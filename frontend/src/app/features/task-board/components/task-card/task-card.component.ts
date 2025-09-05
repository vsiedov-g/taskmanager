import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { List } from '../../models/list.model';
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
  @Input() availableLists: List[] = [];
  @Output() statusChanged = new EventEmitter<{ taskId: string, newStatus: TaskStatus }>();
  @Output() listChanged = new EventEmitter<{ taskId: string, newListId: string }>();
  @Output() cardClicked = new EventEmitter<Task>();
  @Output() dragStart = new EventEmitter<{ task: Task, event: DragEvent }>();
  @Output() dragEnd = new EventEmitter<{ task: Task, event: DragEvent }>();

  private taskService = inject(TaskService);
  TaskStatus = TaskStatus;
  isDragging = false;

  getPriorityClass(priority: TaskPriority): string {
    return this.taskService.getPriorityClass(priority);
  }

  getPriorityDotClass(priority: TaskPriority): string {
    return this.taskService.getPriorityDotClass(priority);
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    return this.taskService.getPriorityDisplayName(priority);
  }

  onStatusChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = parseInt(target.value) as TaskStatus;
    
    if (!isNaN(newStatus) && newStatus !== this.task.status) {
      this.statusChanged.emit({ taskId: this.task.id, newStatus });
    }

    // Reset the dropdown to "Move to:"
    target.value = '';
  }

  onListChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newListId = target.value;
    
    if (newListId && newListId !== this.task.listId) {
      this.listChanged.emit({ taskId: this.task.id, newListId });
    }

    // Reset the dropdown to "Move to:"
    target.value = '';
  }

  getStatusOptions(): TaskStatus[] {
    return this.availableStatuses.filter(status => status !== this.task.status);
  }

  getStatusDisplayName(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.Todo:
        return 'To Do';
      case TaskStatus.InProgress:
        return 'In Progress';
      case TaskStatus.Done:
        return 'Done';
      default:
        return String(status);
    }
  }

  onCardClick(event: Event): void {
    // Prevent card click when interacting with the status dropdown or during drag operations
    const target = event.target as HTMLElement;
    if (target.tagName === 'SELECT' || target.closest('select') || this.isDragging) {
      return;
    }
    
    this.cardClicked.emit(this.task);
  }

  onDragStart(event: DragEvent): void {
    this.isDragging = true;
    
    // Set drag data
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', JSON.stringify({
        taskId: this.task.id,
        fromListId: this.task.listId
      }));
    }
    
    this.dragStart.emit({ task: this.task, event });
  }

  onDragEnd(event: DragEvent): void {
    this.isDragging = false;
    this.dragEnd.emit({ task: this.task, event });
  }

  formatDueDate(dueDate: string | undefined): string {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return dueDate;
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }
}