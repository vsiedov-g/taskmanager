import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TaskColumn, Task, TaskStatus } from '../../models/task.model';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskActions, selectTaskColumns, selectTasksLoading, selectTasksError } from '../../store';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.scss'
})
export class TaskBoardComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private destroy$ = new Subject<void>();
  
  // Observables
  taskColumns$: Observable<TaskColumn[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  // List creation state
  isAddingNewList = false;
  newListTitle = '';
  
  // Enum reference for template
  TaskStatus = TaskStatus;
  
  constructor() {
    // Initialize observables
    this.taskColumns$ = this.store.select(selectTaskColumns);
    this.loading$ = this.store.select(selectTasksLoading);
    this.error$ = this.store.select(selectTasksError);
  }

  ngOnInit(): void {
    // Load tasks on component initialization
    this.store.dispatch(TaskActions.loadTasks());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTaskStatusChanged(event: { taskId: string, newStatus: TaskStatus }): void {
    this.store.dispatch(TaskActions.updateTaskStatus({ 
      id: event.taskId, 
      status: event.newStatus 
    }));
  }

  getAvailableStatuses(currentStatus: TaskStatus): TaskStatus[] {
    return Object.values(TaskStatus).filter(status => status !== currentStatus);
  }

  onAddNewCard(status: TaskStatus): void {
    console.log('Add new card for status:', status);
    // TODO: Implement add new card functionality
    // Example: Open a dialog or inline form
    // this.store.dispatch(TaskActions.createTask({ task: newTaskData }));
  }

  // Helper method to refresh tasks manually if needed
  onRefreshTasks(): void {
    this.store.dispatch(TaskActions.refreshTasks());
  }

  // List creation methods
  onStartAddingList(): void {
    this.isAddingNewList = true;
    this.newListTitle = '';
    
    // Focus the input field after the view updates
    setTimeout(() => {
      const input = document.querySelector('input[placeholder="Enter list title..."]') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }, 0);
  }

  onCancelAddingList(): void {
    this.isAddingNewList = false;
    this.newListTitle = '';
  }

  onSaveNewList(): void {
    if (this.newListTitle.trim()) {
      // TODO: Implement list creation logic
      // For now, we'll just log it since we don't have a List entity yet
      console.log('Creating new list:', this.newListTitle.trim());
      
      // Reset form
      this.isAddingNewList = false;
      this.newListTitle = '';
      
      // Note: In a full implementation, we would:
      // 1. Create a List entity with the new title
      // 2. Dispatch an action to create the list in the store
      // 3. Update the UI to show the new column
    }
  }

  onNewListKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSaveNewList();
    } else if (event.key === 'Escape') {
      this.onCancelAddingList();
    }
  }
}