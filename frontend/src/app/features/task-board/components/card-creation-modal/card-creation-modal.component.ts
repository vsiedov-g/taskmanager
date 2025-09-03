import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { TaskPriority, TaskStatus } from '../../models/task.model';
import { List } from '../../models/list.model';
import { TaskService } from '../../services/task.service';
import { UserService, User } from '../../services/user.service';
import { 
  TaskActions,
  selectSortedLists,
  selectIsCreatingTask,
  selectTasksError,
  selectCreateCardModalListId
} from '../../store';

@Component({
  selector: 'app-card-creation-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './card-creation-modal.component.html',
  styleUrl: './card-creation-modal.component.scss'
})
export class CardCreationModalComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private userService = inject(UserService);

  // Form
  cardForm: FormGroup;
  
  // Observables
  lists$ = this.store.select(selectSortedLists);
  isCreating$ = this.store.select(selectIsCreatingTask);
  error$ = this.store.select(selectTasksError);
  selectedListId$ = this.store.select(selectCreateCardModalListId);
  users$ = this.userService.users$;
  
  // Data
  priorities = [
    { value: TaskPriority.Low, label: this.taskService.getPriorityDisplayName(TaskPriority.Low) },
    { value: TaskPriority.Medium, label: this.taskService.getPriorityDisplayName(TaskPriority.Medium) },
    { value: TaskPriority.High, label: this.taskService.getPriorityDisplayName(TaskPriority.High) },
    { value: TaskPriority.Critical, label: this.taskService.getPriorityDisplayName(TaskPriority.Critical) }
  ];

  // Enum reference for template
  TaskPriority = TaskPriority;

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
    // Load users
    this.userService.loadUsers().subscribe();
    
    // Subscribe to the selected list ID from store
    this.selectedListId$.subscribe(listId => {
      if (listId) {
        this.cardForm.patchValue({ listId });
      }
    });
  }

  onSubmit(): void {
    if (this.cardForm.valid) {
      const formValue = this.cardForm.value;
      const taskData = {
        title: formValue.title.trim(),
        description: formValue.description?.trim(),
        dueDate: formValue.dueDate,
        priority: +formValue.priority, // Convert string to number
        status: TaskStatus.Todo, // Default status
        assigneeId: formValue.assigneeId || undefined,
        listId: formValue.listId,
        position: 0 // Default position at top
      };

      this.store.dispatch(TaskActions.createTask({ task: taskData }));
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.closeModal();
  }

  closeModal(): void {
    // Dispatch action to close modal
    this.store.dispatch(TaskActions.closeCreateCardModal());
    this.resetForm();
  }

  private resetForm(): void {
    this.cardForm.reset({
      priority: TaskPriority.Medium,
      listId: ''
    });
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
      assigneeId: 'Assignee',
      listId: 'List'
    };
    return displayNames[fieldName] || fieldName;
  }

  getPriorityClass(priority: TaskPriority): string {
    switch (priority) {
      case TaskPriority.Low:
        return 'bg-gray-100 text-gray-700';
      case TaskPriority.Medium:
        return 'bg-blue-100 text-blue-700';
      case TaskPriority.High:
        return 'bg-orange-100 text-orange-700';
      case TaskPriority.Critical:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getUserDisplayName(user: User): string {
    return this.userService.getUserDisplayName(user);
  }
}