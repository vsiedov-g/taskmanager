import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TaskState } from '../task.state';
import { selectAllTasks, selectTaskEntities, taskAdapter } from '../reducers/task.reducer';
import { TaskStatus, TaskPriority, Task } from '../../models/task.model';

// Feature selector - selecting the task state directly since it's registered as 'taskBoard'
export const selectTaskState = createFeatureSelector<TaskState>('taskBoard');

// Entity selectors using the adapter
export const selectAllTasksFromState = createSelector(
  selectTaskState,
  selectAllTasks
);

export const selectTaskEntitiesFromState = createSelector(
  selectTaskState,
  selectTaskEntities
);

// Loading selectors
export const selectTasksLoading = createSelector(
  selectTaskState,
  (state) => state.loading
);

export const selectTasksSaving = createSelector(
  selectTaskState,
  (state) => state.saving
);

export const selectTaskDeleting = createSelector(
  selectTaskState,
  (state) => state.deleting
);

export const selectTasksError = createSelector(
  selectTaskState,
  (state) => state.error
);

// Selection selectors
export const selectSelectedTaskId = createSelector(
  selectTaskState,
  (state) => state.selectedTaskId
);

export const selectSelectedTask = createSelector(
  selectTaskEntitiesFromState,
  selectSelectedTaskId,
  (entities, selectedId) => selectedId ? entities[selectedId] || null : null
);

// Filter selectors
export const selectTaskFilters = createSelector(
  selectTaskState,
  (state) => state.filters
);

export const selectSearchTerm = createSelector(
  selectTaskState,
  (state) => state.searchTerm
);

export const selectSortBy = createSelector(
  selectTaskState,
  (state) => state.sortBy
);

// View selectors
export const selectViewMode = createSelector(
  selectTaskState,
  (state) => state.viewMode
);

export const selectGroupBy = createSelector(
  selectTaskState,
  (state) => state.groupBy
);

// Filtered tasks selectors
export const selectFilteredTasks = createSelector(
  selectAllTasksFromState,
  selectTaskFilters,
  selectSearchTerm,
  (tasks, filters, searchTerm) => {
    let filteredTasks = tasks;

    // Apply status filter
    if (filters.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.status.includes(task.status)
      );
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        filters.priority.includes(task.priority)
      );
    }

    // Apply assignee filter
    if (filters.assigneeIds.length > 0 && filters.assigneeIds[0] !== '') {
      filteredTasks = filteredTasks.filter(task => 
        task.assigneeId && filters.assigneeIds.includes(task.assigneeId)
      );
    }

    // Apply project filter
    if (filters.projectIds.length > 0 && filters.projectIds[0] !== '') {
      filteredTasks = filteredTasks.filter(task => 
        task.projectId && filters.projectIds.includes(task.projectId)
      );
    }

    // Apply date range filter
    if (filters.dueDateFrom) {
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && task.dueDate >= filters.dueDateFrom!
      );
    }

    if (filters.dueDateTo) {
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && task.dueDate <= filters.dueDateTo!
      );
    }

    // Apply completed filter
    if (!filters.showCompleted) {
      filteredTasks = filteredTasks.filter(task => 
        task.status !== TaskStatus.Done
      );
    }

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        (task.description && task.description.toLowerCase().includes(term))
      );
    }

    return filteredTasks;
  }
);

// Sorted tasks selector
export const selectSortedTasks = createSelector(
  selectFilteredTasks,
  selectSortBy,
  (tasks, sortBy) => {
    const sortedTasks = [...tasks];
    
    return sortedTasks.sort((a, b) => {
      let aValue: any = a[sortBy.field];
      let bValue: any = b[sortBy.field];

      // Handle date fields
      if (sortBy.field === 'dueDate' || sortBy.field === 'createdAt' || sortBy.field === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle priority field (already numeric in the new enum)
      if (sortBy.field === 'priority') {
        // Priority values are now numeric (0=LOW, 1=MEDIUM, 2=HIGH, 3=CRITICAL)
        aValue = aValue as number;
        bValue = bValue as number;
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let result = 0;
      if (aValue < bValue) result = -1;
      if (aValue > bValue) result = 1;

      return sortBy.direction === 'desc' ? -result : result;
    });
  }
);

// Tasks grouped by status (for Kanban view)
export const selectTasksByStatus = createSelector(
  selectSortedTasks,
  (tasks) => {
    const tasksByStatus = {
      [TaskStatus.Todo]: tasks.filter(task => task.status === TaskStatus.Todo),
      [TaskStatus.InProgress]: tasks.filter(task => task.status === TaskStatus.InProgress),
      [TaskStatus.Done]: tasks.filter(task => task.status === TaskStatus.Done)
    };

    return tasksByStatus;
  }
);

// Task columns with counts (for Kanban view)
export const selectTaskColumns = createSelector(
  selectTasksByStatus,
  (tasksByStatus) => {
    return [
      {
        id: TaskStatus.Todo,
        title: 'To Do',
        tasks: tasksByStatus[TaskStatus.Todo],
        count: tasksByStatus[TaskStatus.Todo].length
      },
      {
        id: TaskStatus.InProgress,
        title: 'In Progress',
        tasks: tasksByStatus[TaskStatus.InProgress],
        count: tasksByStatus[TaskStatus.InProgress].length
      },
      {
        id: TaskStatus.Done,
        title: 'Done',
        tasks: tasksByStatus[TaskStatus.Done],
        count: tasksByStatus[TaskStatus.Done].length
      }
    ];
  }
);

// Tasks grouped by priority
export const selectTasksByPriority = createSelector(
  selectSortedTasks,
  (tasks) => {
    return {
      [TaskPriority.Low]: tasks.filter(task => task.priority === TaskPriority.Low),
      [TaskPriority.Medium]: tasks.filter(task => task.priority === TaskPriority.Medium),
      [TaskPriority.High]: tasks.filter(task => task.priority === TaskPriority.High),
      [TaskPriority.Critical]: tasks.filter(task => task.priority === TaskPriority.Critical)
    };
  }
);

// Task statistics
export const selectTaskStats = createSelector(
  selectAllTasksFromState,
  (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === TaskStatus.Done).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.InProgress).length;
    const todo = tasks.filter(task => task.status === TaskStatus.Todo).length;

    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
);

// Overdue tasks
export const selectOverdueTasks = createSelector(
  selectAllTasksFromState,
  (tasks) => {
    const now = new Date().toISOString();
    return tasks.filter(task => 
      task.status !== TaskStatus.Done && 
      task.dueDate && task.dueDate < now
    );
  }
);

// Tasks due today
export const selectTasksDueToday = createSelector(
  selectAllTasksFromState,
  (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.status !== TaskStatus.Done && 
      task.dueDate && task.dueDate.startsWith(today)
    );
  }
);

// Recent tasks (created in last 7 days)
export const selectRecentTasks = createSelector(
  selectAllTasksFromState,
  (tasks) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    return tasks.filter(task => task.createdAt > sevenDaysAgoISO);
  }
);

// Modal selectors
export const selectIsCreateCardModalOpen = createSelector(
  selectTaskState,
  (state) => state.isCreateCardModalOpen
);

export const selectCreateCardModalListId = createSelector(
  selectTaskState,
  (state) => state.createCardModalListId
);

export const selectIsCreatingTask = createSelector(
  selectTaskState,
  (state) => state.saving
);

// Edit modal selectors
export const selectIsEditCardModalOpen = createSelector(
  selectTaskState,
  (state) => state.isEditCardModalOpen
);

export const selectEditingTaskId = createSelector(
  selectTaskState,
  (state) => state.editingTaskId
);

export const selectEditingTask = createSelector(
  selectTaskEntitiesFromState,
  selectEditingTaskId,
  (entities, editingId) => editingId ? entities[editingId] || null : null
);

export const selectIsUpdatingTask = createSelector(
  selectTaskState,
  (state) => state.saving
);