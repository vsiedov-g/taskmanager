import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskFilters, TaskSortBy } from '../task.state';

export const TaskActions = createActionGroup({
  source: 'Task',
  events: {
    // Load tasks
    'Load Tasks': emptyProps(),
    'Load Tasks Success': props<{ tasks: Task[] }>(),
    'Load Tasks Failure': props<{ error: string }>(),
    
    // Create task
    'Create Task': props<{ task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }>(),
    'Create Task Success': props<{ task: Task }>(),
    'Create Task Failure': props<{ error: string }>(),
    
    // Update task
    'Update Task': props<{ id: string; changes: Partial<Task> }>(),
    'Update Task Success': props<{ task: Task }>(),
    'Update Task Failure': props<{ error: string }>(),
    
    // Update task status (drag and drop)
    'Update Task Status': props<{ id: string; status: TaskStatus; position?: number }>(),
    'Update Task Status Success': props<{ task: Task }>(),
    'Update Task Status Failure': props<{ error: string }>(),
    
    // Move task (between lists)
    'Move Task': props<{ id: string; listId: string; position: number }>(),
    'Move Task Success': props<{ id: string }>(),
    'Move Task Failure': props<{ error: string }>(),
    
    // Delete task
    'Delete Task': props<{ id: string }>(),
    'Delete Task Success': props<{ id: string }>(),
    'Delete Task Failure': props<{ error: string }>(),
    
    // Delete tasks by list (when list is deleted)
    'Delete Tasks By List': props<{ listId: string }>(),
    'Delete Tasks By List Success': props<{ listId: string }>(),
    'Delete Tasks By List Failure': props<{ error: string }>(),
    
    // Bulk operations
    'Bulk Update Tasks': props<{ ids: string[]; changes: Partial<Task> }>(),
    'Bulk Update Tasks Success': props<{ tasks: Task[] }>(),
    'Bulk Update Tasks Failure': props<{ error: string }>(),
    
    'Bulk Delete Tasks': props<{ ids: string[] }>(),
    'Bulk Delete Tasks Success': props<{ ids: string[] }>(),
    'Bulk Delete Tasks Failure': props<{ error: string }>(),
    
    // Selection
    'Select Task': props<{ id: string }>(),
    'Deselect Task': emptyProps(),
    
    // Filtering and search
    'Set Filters': props<{ filters: Partial<TaskFilters> }>(),
    'Clear Filters': emptyProps(),
    'Set Search Term': props<{ searchTerm: string }>(),
    'Set Sort': props<{ sortBy: TaskSortBy }>(),
    
    // View mode
    'Set View Mode': props<{ viewMode: 'kanban' | 'list' | 'calendar' }>(),
    'Set Group By': props<{ groupBy: 'status' | 'priority' | 'assignee' }>(),
    
    // Real-time updates
    'Task Updated Real Time': props<{ task: Task }>(),
    'Task Created Real Time': props<{ task: Task }>(),
    'Task Deleted Real Time': props<{ id: string }>(),
    
    // Cache management
    'Refresh Tasks': emptyProps(),
    'Clear Task Cache': emptyProps(),

    // Card creation modal
    'Open Create Card Modal': props<{ listId?: string }>(),
    'Close Create Card Modal': emptyProps(),

    // Card edit modal
    'Open Edit Card Modal': props<{ task: Task }>(),
    'Close Edit Card Modal': emptyProps(),
  }
});