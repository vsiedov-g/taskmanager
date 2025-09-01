import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { ActivityLog, ActivityLogFilters } from '../../models/activity-log.model';
import { ActivityLogActions } from '../actions/activity-log.actions';

// Feature key
export const ActivityLogFeatureKey = 'activityLog';

export interface ActivityLogState extends EntityState<ActivityLog> {
  // Loading states
  loading: boolean;
  loadingMore: boolean;
  saving: boolean;
  deleting: string | null; // ID of activity log being deleted
  
  // Error states
  error: string | null;
  
  // UI state
  selectedActivityLogId: string | null;
  filters: ActivityLogFilters;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  
  // View state
  viewMode: 'all' | 'byCard' | 'byUser' | 'recent';
  
  // Filter context
  currentCardId: string | null;
  currentUserId: string | null;
}

export const activityLogAdapter: EntityAdapter<ActivityLog> = createEntityAdapter<ActivityLog>({
  selectId: (activityLog: ActivityLog) => activityLog.id,
  sortComparer: (a: ActivityLog, b: ActivityLog) => {
    // Sort by createdAt descending (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
});

export const initialActivityLogState: ActivityLogState = activityLogAdapter.getInitialState({
  loading: false,
  loadingMore: false,
  saving: false,
  deleting: null,
  error: null,
  selectedActivityLogId: null,
  filters: {},
  currentPage: 1,
  pageSize: 20,
  totalCount: 0,
  hasNextPage: true,
  viewMode: 'all' as const,
  currentCardId: null,
  currentUserId: null,
});

export const activityLogReducer = createReducer(
  initialActivityLogState,

  // Load Activity Logs
  on(ActivityLogActions.loadActivityLogs, (state) => ({
    ...state,
    loading: true,
    error: null,
    currentPage: 1,
    viewMode: 'all' as const
  })),

  on(ActivityLogActions.loadActivityLogsSuccess, (state, { activityLogs, isLoadMore }) => {
    if (isLoadMore) {
      return activityLogAdapter.addMany(activityLogs, {
        ...state,
        loading: false,
        loadingMore: false,
        currentPage: state.currentPage + 1,
        hasNextPage: activityLogs.length === state.pageSize,
        error: null
      });
    } else {
      return activityLogAdapter.setAll(activityLogs, {
        ...state,
        loading: false,
        currentPage: 1,
        hasNextPage: activityLogs.length === state.pageSize,
        error: null
      });
    }
  }),

  on(ActivityLogActions.loadActivityLogsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    loadingMore: false,
    error
  })),

  // Load More Activity Logs
  on(ActivityLogActions.loadMoreActivityLogs, (state) => ({
    ...state,
    loadingMore: true,
    error: null
  })),

  on(ActivityLogActions.loadMoreActivityLogsSuccess, (state, { activityLogs }) =>
    activityLogAdapter.addMany(activityLogs, {
      ...state,
      loadingMore: false,
      currentPage: state.currentPage + 1,
      hasNextPage: activityLogs.length === state.pageSize,
      error: null
    })
  ),

  on(ActivityLogActions.loadMoreActivityLogsFailure, (state, { error }) => ({
    ...state,
    loadingMore: false,
    error
  })),

  // Load Activity Logs By Card
  on(ActivityLogActions.loadActivityLogsByCard, (state, { cardId }) => ({
    ...state,
    loading: true,
    error: null,
    viewMode: 'byCard' as const,
    currentCardId: cardId,
    currentUserId: null
  })),

  on(ActivityLogActions.loadActivityLogsByCardSuccess, (state, { activityLogs, isLoadMore }) =>
    isLoadMore 
      ? activityLogAdapter.addMany(activityLogs, {
          ...state,
          loading: false,
          loadingMore: false,
          error: null,
          hasNextPage: activityLogs.length >= state.pageSize,
          currentPage: state.currentPage + 1
        })
      : activityLogAdapter.setAll(activityLogs, {
          ...state,
          loading: false,
          loadingMore: false,
          error: null,
          hasNextPage: activityLogs.length >= state.pageSize,
          currentPage: 1
        })
  ),

  on(ActivityLogActions.loadActivityLogsByCardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    loadingMore: false,
    error
  })),

  // Load More Activity Logs By Card
  on(ActivityLogActions.loadMoreActivityLogsByCard, (state) => ({
    ...state,
    loadingMore: true,
    error: null
  })),

  on(ActivityLogActions.loadMoreActivityLogsByCardSuccess, (state, { activityLogs }) =>
    activityLogAdapter.addMany(activityLogs, {
      ...state,
      loadingMore: false,
      error: null,
      hasNextPage: activityLogs.length >= state.pageSize,
      currentPage: state.currentPage + 1
    })
  ),

  on(ActivityLogActions.loadMoreActivityLogsByCardFailure, (state, { error }) => ({
    ...state,
    loadingMore: false,
    error
  })),

  // Load Activity Logs By User
  on(ActivityLogActions.loadActivityLogsByUser, (state, { userId }) => ({
    ...state,
    loading: true,
    error: null,
    viewMode: 'byUser' as const,
    currentUserId: userId,
    currentCardId: null
  })),

  on(ActivityLogActions.loadActivityLogsByUserSuccess, (state, { activityLogs }) =>
    activityLogAdapter.setAll(activityLogs, {
      ...state,
      loading: false,
      hasNextPage: false,
      error: null
    })
  ),

  on(ActivityLogActions.loadActivityLogsByUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Recent Activity Logs
  on(ActivityLogActions.loadRecentActivityLogs, (state) => ({
    ...state,
    loading: true,
    error: null,
    viewMode: 'recent' as const,
    currentCardId: null,
    currentUserId: null
  })),

  on(ActivityLogActions.loadRecentActivityLogsSuccess, (state, { activityLogs }) =>
    activityLogAdapter.setAll(activityLogs, {
      ...state,
      loading: false,
      hasNextPage: false,
      error: null
    })
  ),

  on(ActivityLogActions.loadRecentActivityLogsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Get Single Activity Log
  on(ActivityLogActions.getActivityLog, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ActivityLogActions.getActivityLogSuccess, (state, { activityLog }) =>
    activityLogAdapter.upsertOne(activityLog, {
      ...state,
      loading: false,
      error: null
    })
  ),

  on(ActivityLogActions.getActivityLogFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Activity Log
  on(ActivityLogActions.createActivityLog, (state) => ({
    ...state,
    saving: true,
    error: null
  })),

  on(ActivityLogActions.createActivityLogSuccess, (state, { activityLog }) =>
    activityLogAdapter.addOne(activityLog, {
      ...state,
      saving: false,
      error: null
    })
  ),

  on(ActivityLogActions.createActivityLogFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),

  // Update Activity Log
  on(ActivityLogActions.updateActivityLog, (state) => ({
    ...state,
    saving: true,
    error: null
  })),

  on(ActivityLogActions.updateActivityLogSuccess, (state, { activityLog }) =>
    activityLogAdapter.updateOne({ id: activityLog.id, changes: activityLog }, {
      ...state,
      saving: false,
      error: null
    })
  ),

  on(ActivityLogActions.updateActivityLogFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),

  // Delete Activity Log
  on(ActivityLogActions.deleteActivityLog, (state, { id }) => ({
    ...state,
    deleting: id,
    error: null
  })),

  on(ActivityLogActions.deleteActivityLogSuccess, (state, { id }) =>
    activityLogAdapter.removeOne(id, {
      ...state,
      deleting: null,
      error: null
    })
  ),

  on(ActivityLogActions.deleteActivityLogFailure, (state, { error }) => ({
    ...state,
    deleting: null,
    error
  })),

  // Filters
  on(ActivityLogActions.setActivityLogFilters, (state, { filters }) => ({
    ...state,
    filters,
    currentPage: 1
  })),

  on(ActivityLogActions.clearActivityLogFilters, (state) => ({
    ...state,
    filters: {},
    currentPage: 1
  })),

  // Real-time updates
  on(ActivityLogActions.activityLogAddedRealTime, (state, { activityLog }) =>
    activityLogAdapter.addOne(activityLog, state)
  ),

  on(ActivityLogActions.activityLogUpdatedRealTime, (state, { activityLog }) =>
    activityLogAdapter.updateOne({ id: activityLog.id, changes: activityLog }, state)
  ),

  on(ActivityLogActions.activityLogDeletedRealTime, (state, { id }) =>
    activityLogAdapter.removeOne(id, state)
  ),

  // Selection
  on(ActivityLogActions.setSelectedActivityLog, (state, { id }) => ({
    ...state,
    selectedActivityLogId: id
  })),

  on(ActivityLogActions.clearSelectedActivityLog, (state) => ({
    ...state,
    selectedActivityLogId: null
  })),

  // Reset
  on(ActivityLogActions.resetActivityLogs, (state) =>
    activityLogAdapter.removeAll({
      ...state,
      loading: false,
      loadingMore: false,
      saving: false,
      deleting: null,
      error: null,
      selectedActivityLogId: null,
      currentPage: 1,
      hasNextPage: true,
      viewMode: 'all' as const,
      currentCardId: null,
      currentUserId: null
    })
  ),

  on(ActivityLogActions.clearActivityLogCache, (state) =>
    activityLogAdapter.removeAll(state)
  )
);