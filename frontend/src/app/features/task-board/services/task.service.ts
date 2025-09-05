import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Task, TaskStatus, TaskPriority, TaskColumn } from '../models/task.model';
import { environment } from '../../../../environments/environment';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  position: number;
  assigneeId?: string;
  listId: string;
  projectId?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  position: number;
  assigneeId?: string;
  listId: string;
  projectId?: string;
}

export interface MoveTaskRequest {
  listId: string;
  position: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/cards`;


  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.baseUrl).pipe(
      catchError(error => {
        console.error('Error loading tasks:', error);
        return of([]);
      })
    );
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return this.getTasks().pipe(
      map(tasks => tasks.filter(task => task.status === status))
    );
  }

  getTasksByListId(listId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/by-list/${listId}`);
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, taskData);
  }

  updateTask(taskId: string, taskData: UpdateTaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${taskId}`, taskData);
  }

  moveTask(taskId: string, moveData: MoveTaskRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${taskId}/move`, moveData);
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${taskId}`);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus): Observable<Task> {
    // Get current task data to preserve other fields
    return this.getTasks().pipe(
      map(tasks => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new Error('Task not found');
        
        const updateData: UpdateTaskRequest = {
          title: task.title,
          description: task.description,
          status: newStatus,
          priority: task.priority,
          dueDate: task.dueDate,
          position: task.position,
          assigneeId: task.assigneeId,
          listId: task.listId,
          projectId: task.projectId
        };
        
        return this.updateTask(taskId, updateData);
      }),
      switchMap(updateObservable => updateObservable)
    );
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'bg-gray-100 text-gray-600';
      case TaskPriority.Medium:
        return 'bg-blue-100 text-blue-600';
      case TaskPriority.High:
        return 'bg-orange-100 text-orange-600';
      case TaskPriority.Critical:
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getPriorityDotClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'bg-gray-400';
      case TaskPriority.Medium:
        return 'bg-blue-400';
      case TaskPriority.High:
        return 'bg-orange-400';
      case TaskPriority.Critical:
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'Low';
      case TaskPriority.Medium:
        return 'Medium';
      case TaskPriority.High:
        return 'High';
      case TaskPriority.Critical:
        return 'Critical';
      default:
        return 'Unknown';
    }
  }
}