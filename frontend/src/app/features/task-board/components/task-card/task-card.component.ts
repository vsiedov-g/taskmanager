import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() availableStatuses: TaskStatus[] = [];
  @Output() statusChanged = new EventEmitter<{ taskId: string, newStatus: TaskStatus }>();

  private taskService = inject(TaskService);
  TaskStatus = TaskStatus;

  getPriorityClass(priority: TaskPriority): string {
    return this.taskService.getPriorityClass(priority);
  }

  getPriorityDotClass(priority: TaskPriority): string {
    return this.taskService.getPriorityDotClass(priority);
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as TaskStatus;
    
    if (newStatus && newStatus !== this.task.status) {
      this.statusChanged.emit({ taskId: this.task.id, newStatus });
    }

    // Reset the dropdown to "Move to:"
    target.value = '';
  }

  getStatusOptions(): TaskStatus[] {
    return this.availableStatuses.filter(status => status !== this.task.status);
  }

  getStatusDisplayName(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.PLANNED:
        return 'Planned';
      case TaskStatus.IN_PROGRESS:
        return 'In Progress';
      case TaskStatus.CLOSED:
        return 'Closed';
      default:
        return status;
    }
  }
}