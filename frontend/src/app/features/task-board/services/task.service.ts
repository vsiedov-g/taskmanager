import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task, TaskStatus, TaskPriority, TaskColumn } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private mockTasks: Task[] = [
    // To Do Tasks
    {
      id: '1',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T10:00:00Z',
      updatedAt: '2024-04-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual.',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T11:00:00Z',
      updatedAt: '2024-04-15T11:00:00Z'
    },
    {
      id: '3',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual.',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T12:00:00Z',
      updatedAt: '2024-04-15T12:00:00Z'
    },
    
    // Planned Tasks
    {
      id: '4',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.PLANNED,
      priority: TaskPriority.LOW,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T13:00:00Z',
      updatedAt: '2024-04-15T13:00:00Z'
    },
    
    // In Progress Tasks
    {
      id: '5',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T14:00:00Z',
      updatedAt: '2024-04-15T14:00:00Z'
    },
    {
      id: '6',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T15:00:00Z',
      updatedAt: '2024-04-15T15:00:00Z'
    },
    {
      id: '7',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T16:00:00Z',
      updatedAt: '2024-04-15T16:00:00Z'
    },
    
    // Closed Tasks
    {
      id: '8',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.CLOSED,
      priority: TaskPriority.MEDIUM,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T17:00:00Z',
      updatedAt: '2024-04-15T17:00:00Z'
    },
    {
      id: '9',
      title: 'Card name',
      description: 'Task descriptions should be unambiguous, accurate, factual, comprehensive, correct and uniformly designed.',
      status: TaskStatus.CLOSED,
      priority: TaskPriority.HIGH,
      dueDate: 'Wed, 19 Apr',
      createdAt: '2024-04-15T18:00:00Z',
      updatedAt: '2024-04-15T18:00:00Z'
    }
  ];

  getTasks(): Observable<Task[]> {
    return of(this.mockTasks);
  }

  getTasksByStatus(status: TaskStatus): Observable<Task[]> {
    return of(this.mockTasks.filter(task => task.status === status));
  }

  getTaskColumns(): Observable<TaskColumn[]> {
    const columns: TaskColumn[] = [
      {
        id: TaskStatus.TODO,
        title: 'To Do',
        tasks: this.mockTasks.filter(task => task.status === TaskStatus.TODO),
        count: this.mockTasks.filter(task => task.status === TaskStatus.TODO).length
      },
      {
        id: TaskStatus.PLANNED,
        title: 'Planned',
        tasks: this.mockTasks.filter(task => task.status === TaskStatus.PLANNED),
        count: this.mockTasks.filter(task => task.status === TaskStatus.PLANNED).length
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'In Progress',
        tasks: this.mockTasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
        count: this.mockTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length
      },
      {
        id: TaskStatus.CLOSED,
        title: 'Closed',
        tasks: this.mockTasks.filter(task => task.status === TaskStatus.CLOSED),
        count: this.mockTasks.filter(task => task.status === TaskStatus.CLOSED).length
      }
    ];

    return of(columns);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus): Observable<Task> {
    const task = this.mockTasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      task.updatedAt = new Date().toISOString();
    }
    return of(task!);
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-gray-100 text-gray-600';
      case TaskPriority.MEDIUM:
        return 'bg-blue-100 text-blue-600';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-600';
      case TaskPriority.CRITICAL:
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getPriorityDotClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.LOW:
        return 'bg-gray-400';
      case TaskPriority.MEDIUM:
        return 'bg-blue-400';
      case TaskPriority.HIGH:
        return 'bg-orange-400';
      case TaskPriority.CRITICAL:
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  }
}