import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Task, TaskPriority, TaskStatus } from '../../models/task.model';
import { List } from '../../models/list.model';
import { ActivityLog } from '../../models/activity-log.model';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { 
  TaskActions,
  selectSortedLists,
  selectIsUpdatingTask,
  selectTasksError,
  selectEditingTask
} from '../../store';
import { 
  ActivityLogActions,
  selectCurrentCardActivityLogs,
  selectActivityLogLoadingMore,
  selectActivityLogHasNextPage
} from '../../store';

@Component({
  selector: 'app-card-edit-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-edit-modal.component.html',
  styleUrl: './card-edit-modal.component.scss'
})
export class CardEditModalComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Form
  cardForm: FormGroup;
  
  // Observables
  lists$ = this.store.select(selectSortedLists);
  isUpdating$ = this.store.select(selectIsUpdatingTask);
  error$ = this.store.select(selectTasksError);
  editingTask$ = this.store.select(selectEditingTask);
  cardActivityLogs$ = this.store.select(selectCurrentCardActivityLogs);
  isLoadingMoreLogs$ = this.store.select(selectActivityLogLoadingMore);
  hasMoreLogs$ = this.store.select(selectActivityLogHasNextPage);
  
  // Data
  priorities = [
    { value: TaskPriority.Low, label: this.taskService.getPriorityDisplayName(TaskPriority.Low) },
    { value: TaskPriority.Medium, label: this.taskService.getPriorityDisplayName(TaskPriority.Medium) },
    { value: TaskPriority.High, label: this.taskService.getPriorityDisplayName(TaskPriority.High) },
    { value: TaskPriority.Critical, label: this.taskService.getPriorityDisplayName(TaskPriority.Critical) }
  ];
  currentTask: Task | null = null;
  
  // UI state
  editMode = false;
  showMoveDropdown = false;

  // Enum references for template
  TaskPriority = TaskPriority;
  TaskStatus = TaskStatus;

  constructor() {
    this.cardForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
      dueDate: ['', Validators.required],
      priority: [TaskPriority.Medium, Validators.required],
      assigneeId: [''],
      listId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Subscribe to the editing task to populate the form
    this.editingTask$
      .pipe(takeUntil(this.destroy$))
      .subscribe(task => {
        if (task) {
          this.currentTask = task;
          this.populateForm(task);
          // Load activity logs for this card
          this.store.dispatch(ActivityLogActions.loadActivityLogsByCard({ cardId: task.id }));
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private populateForm(task: Task): void {
    this.cardForm.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ? this.formatDateForInput(task.dueDate) : '',
      priority: task.priority,
      assigneeId: task.assigneeId || '',
      listId: task.listId || ''
    });
  }

  private formatDateForInput(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  onSubmit(): void {
    if (this.cardForm.valid && this.currentTask) {
      const formValue = this.cardForm.value;
      const changes = {
        title: formValue.title.trim(),
        description: formValue.description.trim(),
        dueDate: formValue.dueDate,
        priority: +formValue.priority, // Convert string to number
        assigneeId: formValue.assigneeId || undefined,
        listId: formValue.listId
      };

      this.store.dispatch(TaskActions.updateTask({ 
        id: this.currentTask.id, 
        changes 
      }));
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.closeModal();
  }

  onDelete(): void {
    if (this.currentTask) {
      // TODO: Add confirmation dialog
      this.store.dispatch(TaskActions.deleteTask({ id: this.currentTask.id }));
    }
  }

  onListChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const listId = target.value;
    this.onMoveToList(listId);
  }

  onMoveToList(listId: string): void {
    if (this.currentTask && listId !== this.currentTask.listId) {
      this.store.dispatch(TaskActions.updateTask({ 
        id: this.currentTask.id, 
        changes: { listId } 
      }));
    }
  }

  closeModal(): void {
    this.store.dispatch(TaskActions.closeEditCardModal());
  }

  private markFormGroupTouched(): void {
    Object.keys(this.cardForm.controls).forEach(key => {
      const control = this.cardForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
  getFieldError(fieldName: string): string | null {
    const field = this.cardForm.get(fieldName);
    if (field?.touched && field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return null;
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: Record<string, string> = {
      title: 'Card name',
      description: 'Description',
      dueDate: 'Due date',
      priority: 'Priority',
      listId: 'List'
    };
    return displayNames[fieldName] || fieldName;
  }

  getPriorityClass(priority: TaskPriority): string {
    return this.taskService.getPriorityClass(priority);
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    return this.taskService.getPriorityDisplayName(priority);
  }

  getFormattedDate(dateString: string): string {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid date';
    }
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

  addComment(comment: string): void {
    if (comment.trim()) {
      // TODO: Implement comment functionality when backend is ready
      console.log('Adding comment:', comment);
    }
  }

  getRelativeTime(dateString: string): string {
    if (!dateString) return '';
    try {
      const timestamp = new Date(dateString);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const entryDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const month = months[timestamp.getMonth()];
      const day = timestamp.getDate();
      const hours = timestamp.getHours();
      const minutes = timestamp.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'pm' : 'am';
      const hour12 = hours % 12 || 12;
      
      return `${month} ${day} at ${hour12}:${minutes} ${period}`;
    } catch {
      return '';
    }
  }

  getUserName(activityLog: ActivityLog): string {
    if (activityLog.user) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && activityLog.userId === currentUser.id) {
        return 'You';
      }
      return `${activityLog.user.firstName} ${activityLog.user.lastName}`.trim();
    }
    return 'Unknown User';
  }

  getActivityText(activityLog: ActivityLog): string {
    // Use the description from the backend if available, otherwise fallback to action
    if (activityLog.description) {
      return activityLog.description;
    }
    
    // Fallback formatting based on action type
    switch (activityLog.action.toLowerCase()) {
      case 'create':
        return `created this card`;
      case 'update':
        return `updated this card`;
      case 'move':
        return `moved this card`;
      case 'delete':
        return `deleted this card`;
      case 'assign':
        return `assigned this card`;
      default:
        return `${activityLog.action.toLowerCase()} this card`;
    }
  }

  formatActivityDescription(activityLog: ActivityLog): string {
    const userName = this.getUserName(activityLog);
    const activityText = this.getActivityText(activityLog);
    return `${userName} ${activityText}`;
  }

  loadMoreActivityLogs(): void {
    if (this.currentTask) {
      this.store.dispatch(ActivityLogActions.loadMoreActivityLogsByCard({ cardId: this.currentTask.id }));
    }
  }
}