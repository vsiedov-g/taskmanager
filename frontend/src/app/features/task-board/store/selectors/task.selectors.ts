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
  (entities, selectedId) => selectedId ? entities[selectedId] : null
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
        task.dueDate >= filters.dueDateFrom!
      );
    }

    if (filters.dueDateTo) {
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate <= filters.dueDateTo!
      );
    }

    // Apply completed filter
    if (!filters.showCompleted) {
      filteredTasks = filteredTasks.filter(task => 
        task.status !== TaskStatus.CLOSED
      );
    }

    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term)
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

      // Handle priority field (convert to numeric for sorting)
      if (sortBy.field === 'priority') {
        const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
        aValue = priorityOrder[aValue as TaskPriority] || 0;
        bValue = priorityOrder[bValue as TaskPriority] || 0;
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
      [TaskStatus.TODO]: tasks.filter(task => task.status === TaskStatus.TODO),
      [TaskStatus.PLANNED]: tasks.filter(task => task.status === TaskStatus.PLANNED),
      [TaskStatus.IN_PROGRESS]: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS),
      [TaskStatus.CLOSED]: tasks.filter(task => task.status === TaskStatus.CLOSED)
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
        id: TaskStatus.TODO,
        title: 'To Do',
        tasks: tasksByStatus[TaskStatus.TODO],
        count: tasksByStatus[TaskStatus.TODO].length
      },
      {
        id: TaskStatus.PLANNED,
        title: 'Planned',
        tasks: tasksByStatus[TaskStatus.PLANNED],
        count: tasksByStatus[TaskStatus.PLANNED].length
      },
      {
        id: TaskStatus.IN_PROGRESS,
        title: 'In Progress',
        tasks: tasksByStatus[TaskStatus.IN_PROGRESS],
        count: tasksByStatus[TaskStatus.IN_PROGRESS].length
      },
      {
        id: TaskStatus.CLOSED,
        title: 'Closed',
        tasks: tasksByStatus[TaskStatus.CLOSED],
        count: tasksByStatus[TaskStatus.CLOSED].length
      }
    ];
  }
);

// Tasks grouped by priority
export const selectTasksByPriority = createSelector(
  selectSortedTasks,
  (tasks) => {
    return {
      [TaskPriority.LOW]: tasks.filter(task => task.priority === TaskPriority.LOW),
      [TaskPriority.MEDIUM]: tasks.filter(task => task.priority === TaskPriority.MEDIUM),
      [TaskPriority.HIGH]: tasks.filter(task => task.priority === TaskPriority.HIGH),
      [TaskPriority.CRITICAL]: tasks.filter(task => task.priority === TaskPriority.CRITICAL)
    };
  }
);

// Task statistics
export const selectTaskStats = createSelector(
  selectAllTasksFromState,
  (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === TaskStatus.CLOSED).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const todo = tasks.filter(task => task.status === TaskStatus.TODO).length;
    const planned = tasks.filter(task => task.status === TaskStatus.PLANNED).length;

    return {
      total,
      completed,
      inProgress,
      todo,
      planned,
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
      task.status !== TaskStatus.CLOSED && 
      task.dueDate < now
    );
  }
);

// Tasks due today
export const selectTasksDueToday = createSelector(
  selectAllTasksFromState,
  (tasks) => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => 
      task.status !== TaskStatus.CLOSED && 
      task.dueDate.startsWith(today)
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