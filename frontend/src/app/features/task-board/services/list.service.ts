import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { List, CreateListRequest, UpdateListRequest, ListColumn } from '../models/list.model';
import { Task, TaskPriority } from '../models/task.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/lists`;


  getLists(): Observable<List[]> {
    return this.http.get<List[]>(this.baseUrl).pipe(
      map(lists => lists.sort((a, b) => a.position - b.position)),
      catchError(error => {
        console.error('Error loading lists:', error);
        return of([]);
      })
    );
  }

  getListById(id: string): Observable<List | null> {
    return this.http.get<List>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error loading list:', error);
        return of(null);
      })
    );
  }

  createList(listData: CreateListRequest): Observable<List> {
    const requestData = {
      title: listData.name,
      position: listData.position ?? 0
    };
    return this.http.post<List>(this.baseUrl, requestData);
  }

  updateList(listData: UpdateListRequest): Observable<List> {
    const requestData = {
      title: listData.name || '',
      position: listData.position || 0
    };
    return this.http.put<List>(`${this.baseUrl}/${listData.id}`, requestData);
  }

  deleteList(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reorderLists(listIds: string[]): Observable<List[]> {
    // For now, return updated lists after individual position updates
    // TODO: Implement bulk reorder endpoint in backend if needed
    return this.getLists();
  }

  getListColumns(tasks: Task[]): Observable<ListColumn[]> {
    return this.getLists().pipe(
      map(lists => {
        return lists
          .sort((a, b) => a.position - b.position)
          .map(list => {
            const listTasks = tasks.filter(task => task.listId === list.id);
            
            // Sort tasks according to the specification:
            // 1. Due Date (descending, nulls last)
            // 2. Priority (High → Low) 
            // 3. CreatedAt (descending)
            const sortedTasks = this.sortTasks(listTasks);

            return {
              id: list.id,
              name: list.name,
              position: list.position,
              taskCount: listTasks.length,
              tasks: sortedTasks
            };
          });
      })
    );
  }

  private sortTasks(tasks: Task[]): Task[] {
    const priorityOrder = {
      [TaskPriority.Critical]: 4,
      [TaskPriority.High]: 3,
      [TaskPriority.Medium]: 2,
      [TaskPriority.Low]: 1
    };

    return [...tasks].sort((a, b) => {
      // 1. Due Date (descending, nulls last)
      if (a.dueDate && b.dueDate) {
        const dateComparison = new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        if (dateComparison !== 0) return dateComparison;
      } else if (a.dueDate && !b.dueDate) {
        return -1; // a has date, b doesn't - a comes first
      } else if (!a.dueDate && b.dueDate) {
        return 1; // b has date, a doesn't - b comes first
      }

      // 2. Priority (High → Low)
      const priorityComparison = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityComparison !== 0) return priorityComparison;

      // 3. CreatedAt (descending)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
}