import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import { ActivityLogService } from '../../services/activity-log.service';
import { ActivityLogActions } from '../actions/activity-log.actions';
import { selectActivityLogCurrentPage, selectActivityLogPageSize } from '../selectors/activity-log.selectors';

@Injectable()
export class ActivityLogEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private activityLogService = inject(ActivityLogService);

  loadActivityLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadActivityLogs),
      switchMap(({ page = 1, pageSize = 20 }) =>
        this.activityLogService.getActivityLogs(page, pageSize).pipe(
          map(activityLogs =>
            ActivityLogActions.loadActivityLogsSuccess({ activityLogs, isLoadMore: page > 1 })
          ),
          catchError(error =>
            of(ActivityLogActions.loadActivityLogsFailure({ 
              error: error.message || 'Failed to load activity logs' 
            }))
          )
        )
      )
    )
  );

  loadMoreActivityLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadMoreActivityLogs),
      withLatestFrom(
        this.store.select(selectActivityLogCurrentPage),
        this.store.select(selectActivityLogPageSize)
      ),
      switchMap(([_, currentPage, pageSize]) => {
        const nextPage = currentPage + 1;
        return this.activityLogService.getActivityLogs(nextPage, pageSize).pipe(
          map(activityLogs =>
            ActivityLogActions.loadMoreActivityLogsSuccess({ activityLogs })
          ),
          catchError(error =>
            of(ActivityLogActions.loadMoreActivityLogsFailure({ 
              error: error.message || 'Failed to load more activity logs' 
            }))
          )
        );
      })
    )
  );

  loadActivityLogsByCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadActivityLogsByCard),
      switchMap(({ cardId, page = 1, pageSize = 20 }) =>
        this.activityLogService.getActivityLogsByCard(cardId, page, pageSize).pipe(
          map(activityLogs =>
            ActivityLogActions.loadActivityLogsByCardSuccess({ activityLogs, isLoadMore: page > 1 })
          ),
          catchError(error =>
            of(ActivityLogActions.loadActivityLogsByCardFailure({ 
              error: error.message || 'Failed to load activity logs for card' 
            }))
          )
        )
      )
    )
  );

  loadMoreActivityLogsByCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadMoreActivityLogsByCard),
      withLatestFrom(this.store.select(selectActivityLogCurrentPage)),
      switchMap(([{ cardId }, currentPage]) =>
        this.activityLogService.getActivityLogsByCard(cardId, currentPage + 1, 20).pipe(
          map(activityLogs =>
            ActivityLogActions.loadMoreActivityLogsByCardSuccess({ activityLogs })
          ),
          catchError(error =>
            of(ActivityLogActions.loadMoreActivityLogsByCardFailure({ 
              error: error.message || 'Failed to load more activity logs for card' 
            }))
          )
        )
      )
    )
  );

  loadActivityLogsByUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadActivityLogsByUser),
      switchMap(({ userId }) =>
        this.activityLogService.getActivityLogsByUser(userId).pipe(
          map(activityLogs =>
            ActivityLogActions.loadActivityLogsByUserSuccess({ activityLogs })
          ),
          catchError(error =>
            of(ActivityLogActions.loadActivityLogsByUserFailure({ 
              error: error.message || 'Failed to load activity logs for user' 
            }))
          )
        )
      )
    )
  );

  loadRecentActivityLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadRecentActivityLogs),
      switchMap(({ page = 1, pageSize = 20 }) =>
        this.activityLogService.getRecentActivityLogs(page, pageSize).pipe(
          map(activityLogs =>
            ActivityLogActions.loadRecentActivityLogsSuccess({ activityLogs, isLoadMore: page > 1 })
          ),
          catchError(error =>
            of(ActivityLogActions.loadRecentActivityLogsFailure({ 
              error: error.message || 'Failed to load recent activity logs' 
            }))
          )
        )
      )
    )
  );

  loadMoreRecentActivityLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.loadMoreRecentActivityLogs),
      withLatestFrom(
        this.store.select(selectActivityLogCurrentPage),
        this.store.select(selectActivityLogPageSize)
      ),
      switchMap(([_, currentPage, pageSize]) => {
        const nextPage = currentPage + 1;
        return this.activityLogService.getRecentActivityLogs(nextPage, pageSize).pipe(
          map(activityLogs =>
            ActivityLogActions.loadMoreRecentActivityLogsSuccess({ activityLogs })
          ),
          catchError(error =>
            of(ActivityLogActions.loadMoreRecentActivityLogsFailure({ 
              error: error.message || 'Failed to load more recent activity logs' 
            }))
          )
        );
      })
    )
  );

  getActivityLog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.getActivityLog),
      switchMap(({ id }) =>
        this.activityLogService.getActivityLogById(id).pipe(
          map(activityLog =>
            ActivityLogActions.getActivityLogSuccess({ activityLog })
          ),
          catchError(error =>
            of(ActivityLogActions.getActivityLogFailure({ 
              error: error.message || 'Failed to get activity log' 
            }))
          )
        )
      )
    )
  );

  createActivityLog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.createActivityLog),
      switchMap(({ activityLog }) =>
        this.activityLogService.createActivityLog(activityLog).pipe(
          map(createdActivityLog =>
            ActivityLogActions.createActivityLogSuccess({ activityLog: createdActivityLog })
          ),
          catchError(error =>
            of(ActivityLogActions.createActivityLogFailure({ 
              error: error.message || 'Failed to create activity log' 
            }))
          )
        )
      )
    )
  );

  updateActivityLog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.updateActivityLog),
      switchMap(({ id, changes }) =>
        this.activityLogService.updateActivityLog(id, changes).pipe(
          map(() =>
            ActivityLogActions.updateActivityLogSuccess({ activityLog: { id, ...changes } as any })
          ),
          catchError(error =>
            of(ActivityLogActions.updateActivityLogFailure({ 
              error: error.message || 'Failed to update activity log' 
            }))
          )
        )
      )
    )
  );

  deleteActivityLog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityLogActions.deleteActivityLog),
      switchMap(({ id }) =>
        this.activityLogService.deleteActivityLog(id).pipe(
          map(() =>
            ActivityLogActions.deleteActivityLogSuccess({ id })
          ),
          catchError(error =>
            of(ActivityLogActions.deleteActivityLogFailure({ 
              error: error.message || 'Failed to delete activity log' 
            }))
          )
        )
      )
    )
  );
}