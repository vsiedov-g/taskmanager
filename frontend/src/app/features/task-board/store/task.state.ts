import { EntityState } from '@ngrx/entity';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';

// Task entity state
export interface TaskState extends EntityState<Task> {
  // Loading states
  loading: boolean;
  saving: boolean;
  deleting: string | null; // ID of task being deleted
  
  // Error states
  error: string | null;
  
  // UI state
  selectedTaskId: string | null;
  filters: TaskFilters;
  
  // Modal state
  isCreateCardModalOpen: boolean;
  createCardModalListId: string | null;
  isEditCardModalOpen: boolean;
  editingTaskId: string | null;
  
  // View state
  viewMode: 'kanban' | 'list' | 'calendar';
  groupBy: 'status' | 'priority' | 'assignee';
  
  // Search and sorting
  searchTerm: string;
  sortBy: TaskSortBy;
  sortDirection: 'asc' | 'desc';
}

export interface TaskFilters {
  status: TaskStatus[];
  priority: TaskPriority[];
  assigneeIds: string[];
  projectIds: string[];
  dueDateFrom: string | null;
  dueDateTo: string | null;
  showCompleted: boolean;
}

export interface TaskSortBy {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Feature state
export interface TaskBoardState {
  tasks: TaskState;
}