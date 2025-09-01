import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ActivityLog, ActivityLogFilters } from '../../models/activity-log.model';

export const ActivityLogActions = createActionGroup({
  source: 'Activity Log',
  events: {
    // Load activity logs
    'Load Activity Logs': props<{ page?: number; pageSize?: number }>(),
    'Load Activity Logs Success': props<{ activityLogs: ActivityLog[]; isLoadMore?: boolean }>(),
    'Load Activity Logs Failure': props<{ error: string }>(),
    
    // Load more activity logs (pagination)
    'Load More Activity Logs': emptyProps(),
    'Load More Activity Logs Success': props<{ activityLogs: ActivityLog[] }>(),
    'Load More Activity Logs Failure': props<{ error: string }>(),
    
    // Load activity logs by card
    'Load Activity Logs By Card': props<{ cardId: string; page?: number; pageSize?: number }>(),
    'Load Activity Logs By Card Success': props<{ activityLogs: ActivityLog[]; isLoadMore?: boolean }>(),
    'Load Activity Logs By Card Failure': props<{ error: string }>(),
    
    // Load more activity logs by card
    'Load More Activity Logs By Card': props<{ cardId: string }>(),
    'Load More Activity Logs By Card Success': props<{ activityLogs: ActivityLog[] }>(),
    'Load More Activity Logs By Card Failure': props<{ error: string }>(),
    
    // Load activity logs by user
    'Load Activity Logs By User': props<{ userId: string }>(),
    'Load Activity Logs By User Success': props<{ activityLogs: ActivityLog[] }>(),
    'Load Activity Logs By User Failure': props<{ error: string }>(),
    
    // Load recent activity logs
    'Load Recent Activity Logs': props<{ count?: number }>(),
    'Load Recent Activity Logs Success': props<{ activityLogs: ActivityLog[] }>(),
    'Load Recent Activity Logs Failure': props<{ error: string }>(),
    
    // Get single activity log
    'Get Activity Log': props<{ id: string }>(),
    'Get Activity Log Success': props<{ activityLog: ActivityLog }>(),
    'Get Activity Log Failure': props<{ error: string }>(),
    
    // Create activity log
    'Create Activity Log': props<{ activityLog: Omit<ActivityLog, 'id' | 'createdAt' | 'user' | 'card'> }>(),
    'Create Activity Log Success': props<{ activityLog: ActivityLog }>(),
    'Create Activity Log Failure': props<{ error: string }>(),
    
    // Update activity log
    'Update Activity Log': props<{ id: string; changes: Partial<ActivityLog> }>(),
    'Update Activity Log Success': props<{ activityLog: ActivityLog }>(),
    'Update Activity Log Failure': props<{ error: string }>(),
    
    // Delete activity log
    'Delete Activity Log': props<{ id: string }>(),
    'Delete Activity Log Success': props<{ id: string }>(),
    'Delete Activity Log Failure': props<{ error: string }>(),
    
    // Filtering
    'Set Activity Log Filters': props<{ filters: ActivityLogFilters }>(),
    'Clear Activity Log Filters': emptyProps(),
    
    // Real-time updates
    'Activity Log Added Real Time': props<{ activityLog: ActivityLog }>(),
    'Activity Log Updated Real Time': props<{ activityLog: ActivityLog }>(),
    'Activity Log Deleted Real Time': props<{ id: string }>(),
    
    // UI state
    'Set Selected Activity Log': props<{ id: string }>(),
    'Clear Selected Activity Log': emptyProps(),
    
    // Reset state
    'Reset Activity Logs': emptyProps(),
    'Clear Activity Log Cache': emptyProps(),
  }
});