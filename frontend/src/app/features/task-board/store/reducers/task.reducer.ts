import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { TaskState, TaskFilters } from '../task.state';
import { TaskActions } from '../actions/task.actions';

// Feature key for the task board state
export const TaskFeatureKey = 'taskBoard';

// Entity adapter
export const taskAdapter: EntityAdapter<Task> = createEntityAdapter<Task>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
});

// Initial state
export const initialTaskState: TaskState = taskAdapter.getInitialState({
  loading: false,
  saving: false,
  deleting: null,
  error: null,
  selectedTaskId: null,
  filters: {
    status: [],
    priority: [],
    assigneeIds: [],
    projectIds: [],
    dueDateFrom: null,
    dueDateTo: null,
    showCompleted: true
  },
  // Modal state
  isCreateCardModalOpen: false,
  createCardModalListId: null,
  isEditCardModalOpen: false,
  editingTaskId: null,
  viewMode: 'kanban' as const,
  groupBy: 'status' as const,
  searchTerm: '',
  sortBy: {
    field: 'createdAt' as const,
    direction: 'desc' as const
  },
  sortDirection: 'desc' as const
});

// Reducer
export const taskReducer = createReducer(
  initialTaskState,
  
  // Load tasks
  on(TaskActions.loadTasks, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.loadTasksSuccess, (state, { tasks }) =>
    taskAdapter.setAll(tasks, {
      ...state,
      loading: false,
      error: null
    })
  ),
  
  on(TaskActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create task
  on(TaskActions.createTask, (state) => ({
    ...state,
    saving: true,
    error: null
  })),
  
  on(TaskActions.createTaskSuccess, (state, { task }) =>
    taskAdapter.addOne(task, {
      ...state,
      saving: false,
      error: null
    })
  ),
  
  on(TaskActions.createTaskFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),
  
  // Update task
  on(TaskActions.updateTask, (state) => ({
    ...state,
    saving: true,
    error: null
  })),
  
  on(TaskActions.updateTaskSuccess, (state, { task }) =>
    taskAdapter.updateOne(
      { id: task.id, changes: task },
      {
        ...state,
        saving: false,
        error: null
      }
    )
  ),
  
  on(TaskActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),
  
  // Update task status (drag and drop)
  on(TaskActions.updateTaskStatus, (state) => ({
    ...state,
    saving: true
  })),
  
  on(TaskActions.updateTaskStatusSuccess, (state, { task }) =>
    taskAdapter.updateOne(
      { id: task.id, changes: task },
      {
        ...state,
        saving: false,
        error: null
      }
    )
  ),
  
  on(TaskActions.updateTaskStatusFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),
  
  // Move task
  on(TaskActions.moveTask, (state) => ({
    ...state,
    saving: true,
    error: null
  })),
  
  on(TaskActions.moveTaskSuccess, (state) => ({
    ...state,
    saving: false,
    error: null
  })),
  
  on(TaskActions.moveTaskFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),
  
  // Delete task
  on(TaskActions.deleteTask, (state, { id }) => ({
    ...state,
    deleting: id,
    error: null
  })),
  
  on(TaskActions.deleteTaskSuccess, (state, { id }) =>
    taskAdapter.removeOne(id, {
      ...state,
      deleting: null,
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId
    })
  ),
  
  on(TaskActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    deleting: null,
    error
  })),
  
  // Delete tasks by list
  on(TaskActions.deleteTasksByList, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(TaskActions.deleteTasksByListSuccess, (state, { listId }) => {
    // Remove all tasks with the specified listId
    const tasksToDelete = Object.values(state.entities)
      .filter(task => task?.listId === listId)
      .map(task => task!.id);
    
    return taskAdapter.removeMany(tasksToDelete, {
      ...state,
      loading: false,
      error: null
    });
  }),
  
  on(TaskActions.deleteTasksByListFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Bulk operations
  on(TaskActions.bulkUpdateTasksSuccess, (state, { tasks }) =>
    taskAdapter.updateMany(
      tasks.map(task => ({ id: task.id, changes: task })),
      {
        ...state,
        saving: false,
        error: null
      }
    )
  ),
  
  on(TaskActions.bulkDeleteTasksSuccess, (state, { ids }) =>
    taskAdapter.removeMany(ids, {
      ...state,
      deleting: null,
      selectedTaskId: ids.includes(state.selectedTaskId || '') ? null : state.selectedTaskId
    })
  ),
  
  // Selection
  on(TaskActions.selectTask, (state, { id }) => ({
    ...state,
    selectedTaskId: id
  })),
  
  on(TaskActions.deselectTask, (state) => ({
    ...state,
    selectedTaskId: null
  })),
  
  // Filtering and search
  on(TaskActions.setFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),
  
  on(TaskActions.clearFilters, (state) => ({
    ...state,
    filters: initialTaskState.filters
  })),
  
  on(TaskActions.setSearchTerm, (state, { searchTerm }) => ({
    ...state,
    searchTerm
  })),
  
  on(TaskActions.setSort, (state, { sortBy }) => ({
    ...state,
    sortBy
  })),
  
  // View mode
  on(TaskActions.setViewMode, (state, { viewMode }) => ({
    ...state,
    viewMode
  })),
  
  on(TaskActions.setGroupBy, (state, { groupBy }) => ({
    ...state,
    groupBy
  })),
  
  // Real-time updates
  on(TaskActions.taskUpdatedRealTime, (state, { task }) =>
    taskAdapter.updateOne(
      { id: task.id, changes: task },
      state
    )
  ),
  
  on(TaskActions.taskCreatedRealTime, (state, { task }) =>
    taskAdapter.addOne(task, state)
  ),
  
  on(TaskActions.taskDeletedRealTime, (state, { id }) =>
    taskAdapter.removeOne(id, {
      ...state,
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId
    })
  ),
  
  // Cache management
  on(TaskActions.clearTaskCache, (state) =>
    taskAdapter.removeAll({
      ...state,
      selectedTaskId: null
    })
  ),

  // Card creation modal
  on(TaskActions.openCreateCardModal, (state, { listId }) => ({
    ...state,
    isCreateCardModalOpen: true,
    createCardModalListId: listId || null
  })),

  on(TaskActions.closeCreateCardModal, (state) => ({
    ...state,
    isCreateCardModalOpen: false,
    createCardModalListId: null
  })),

  // Card edit modal
  on(TaskActions.openEditCardModal, (state, { task }) => ({
    ...state,
    isEditCardModalOpen: true,
    editingTaskId: task.id
  })),

  on(TaskActions.closeEditCardModal, (state) => ({
    ...state,
    isEditCardModalOpen: false,
    editingTaskId: null
  }))
);

// Export entity selectors
export const {
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
  selectAll: selectAllTasks,
  selectTotal: selectTotalTasks
} = taskAdapter.getSelectors();