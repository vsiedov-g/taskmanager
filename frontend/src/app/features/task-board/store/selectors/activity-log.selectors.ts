import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActivityLogState, activityLogAdapter } from '../reducers/activity-log.reducer';
import { ActivityLog } from '../../models/activity-log.model';

export const selectActivityLogState = createFeatureSelector<ActivityLogState>('activityLog');

// Entity selectors
const {
  selectIds: selectActivityLogIds,
  selectEntities: selectActivityLogEntities,
  selectAll: selectAllActivityLogs,
  selectTotal: selectActivityLogTotal,
} = activityLogAdapter.getSelectors(selectActivityLogState);

// Basic selectors
export const selectActivityLogLoading = createSelector(
  selectActivityLogState,
  (state) => state.loading
);

export const selectActivityLogLoadingMore = createSelector(
  selectActivityLogState,
  (state) => state.loadingMore
);

export const selectActivityLogSaving = createSelector(
  selectActivityLogState,
  (state) => state.saving
);

export const selectActivityLogDeleting = createSelector(
  selectActivityLogState,
  (state) => state.deleting
);

export const selectActivityLogError = createSelector(
  selectActivityLogState,
  (state) => state.error
);

// Selection
export const selectSelectedActivityLogId = createSelector(
  selectActivityLogState,
  (state) => state.selectedActivityLogId
);

export const selectSelectedActivityLog = createSelector(
  selectActivityLogEntities,
  selectSelectedActivityLogId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

// Filters
export const selectActivityLogFilters = createSelector(
  selectActivityLogState,
  (state) => state.filters
);

// Pagination
export const selectActivityLogCurrentPage = createSelector(
  selectActivityLogState,
  (state) => state.currentPage
);

export const selectActivityLogPageSize = createSelector(
  selectActivityLogState,
  (state) => state.pageSize
);

export const selectActivityLogTotalCount = createSelector(
  selectActivityLogState,
  (state) => state.totalCount
);

export const selectActivityLogHasNextPage = createSelector(
  selectActivityLogState,
  (state) => state.hasNextPage
);

// View state
export const selectActivityLogViewMode = createSelector(
  selectActivityLogState,
  (state) => state.viewMode
);

export const selectActivityLogCurrentCardId = createSelector(
  selectActivityLogState,
  (state) => state.currentCardId
);

export const selectActivityLogCurrentUserId = createSelector(
  selectActivityLogState,
  (state) => state.currentUserId
);

// Computed selectors
export const selectActivityLogsArray = createSelector(
  selectAllActivityLogs,
  (activityLogs) => activityLogs
);

export const selectActivityLogsSorted = createSelector(
  selectAllActivityLogs,
  (activityLogs) => [...activityLogs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
);

export const selectRecentActivityLogs = createSelector(
  selectActivityLogsSorted,
  (activityLogs) => activityLogs.slice(0, 20)
);

export const selectActivityLogsByCard = createSelector(
  selectAllActivityLogs,
  (activityLogs: ActivityLog[], props: { cardId: string }) => 
    activityLogs.filter((log: ActivityLog) => log.cardId === props.cardId)
);

// Selector for current card's activity logs based on state
export const selectCurrentCardActivityLogs = createSelector(
  selectAllActivityLogs,
  selectActivityLogCurrentCardId,
  (activityLogs: ActivityLog[], currentCardId: string | null) => {
    if (!currentCardId) return [];
    return activityLogs.filter((log: ActivityLog) => log.cardId === currentCardId);
  }
);

export const selectActivityLogsByUser = createSelector(
  selectAllActivityLogs,
  (activityLogs: ActivityLog[], props: { userId: string }) => 
    activityLogs.filter((log: ActivityLog) => log.userId === props.userId)
);

export const selectActivityLogsByAction = createSelector(
  selectAllActivityLogs,
  (activityLogs: ActivityLog[], props: { action: string }) => 
    activityLogs.filter((log: ActivityLog) => log.action === props.action)
);

// Pagination info
export const selectActivityLogPaginationInfo = createSelector(
  selectActivityLogCurrentPage,
  selectActivityLogPageSize,
  selectActivityLogTotalCount,
  selectActivityLogHasNextPage,
  (currentPage, pageSize, totalCount, hasNextPage) => ({
    currentPage,
    pageSize,
    totalCount,
    hasNextPage,
    totalPages: Math.ceil(totalCount / pageSize),
    isFirstPage: currentPage === 1,
    isLastPage: !hasNextPage
  })
);

// Loading states
export const selectActivityLogLoadingStates = createSelector(
  selectActivityLogLoading,
  selectActivityLogLoadingMore,
  selectActivityLogSaving,
  selectActivityLogDeleting,
  (loading, loadingMore, saving, deleting) => ({
    loading,
    loadingMore,
    saving,
    deleting: !!deleting,
    anyLoading: loading || loadingMore || saving || !!deleting
  })
);

// Statistics
export const selectActivityLogStats = createSelector(
  selectAllActivityLogs,
  (activityLogs) => {
    const stats = activityLogs.reduce((acc, log) => {
      acc.total++;
      acc.byAction[log.action] = (acc.byAction[log.action] || 0) + 1;
      acc.byEntityType[log.entityType] = (acc.byEntityType[log.entityType] || 0) + 1;
      return acc;
    }, {
      total: 0,
      byAction: {} as Record<string, number>,
      byEntityType: {} as Record<string, number>
    });

    return stats;
  }
);

// User activity summary
export const selectUserActivitySummary = createSelector(
  selectAllActivityLogs,
  (activityLogs) => {
    const userActivity = activityLogs.reduce((acc, log) => {
      const userId = log.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: log.user,
          totalActions: 0,
          actionBreakdown: {} as Record<string, number>,
          lastActivity: log.createdAt
        };
      }
      
      acc[userId].totalActions++;
      acc[userId].actionBreakdown[log.action] = (acc[userId].actionBreakdown[log.action] || 0) + 1;
      
      // Update last activity if this log is more recent
      if (new Date(log.createdAt) > new Date(acc[userId].lastActivity)) {
        acc[userId].lastActivity = log.createdAt;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(userActivity);
  }
);

// Filter helpers
export const selectFilteredActivityLogs = createSelector(
  selectAllActivityLogs,
  selectActivityLogFilters,
  (activityLogs, filters) => {
    let filtered = activityLogs;

    if (filters.cardId) {
      filtered = filtered.filter(log => log.cardId === filters.cardId);
    }

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.actionType) {
      filtered = filtered.filter(log => log.action === filters.actionType);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.createdAt) >= new Date(filters.dateFrom!)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.createdAt) <= new Date(filters.dateTo!)
      );
    }

    return filtered;
  }
);

// Export entity selectors for direct access
export {
  selectActivityLogIds,
  selectActivityLogEntities,
  selectAllActivityLogs,
  selectActivityLogTotal,
};