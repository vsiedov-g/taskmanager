import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { ListService } from '../../services/list.service';
import { ListActions } from '../actions/list.actions';
import { TaskActions } from '../actions/task.actions';
import { ActivityLogActions } from '../actions/activity-log.actions';

@Injectable()
export class ListEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private listService = inject(ListService);

  // Load lists effect
  loadLists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.loadLists),
      switchMap(() =>
        this.listService.getLists().pipe(
          map((lists) => ListActions.loadListsSuccess({ lists })),
          catchError((error) => of(ListActions.loadListsFailure({ error: error.message })))
        )
      )
    )
  );

  // Create list effect
  createList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.createList),
      switchMap(({ listData }) =>
        this.listService.createList(listData).pipe(
          mergeMap((list) => [
            ListActions.createListSuccess({ list }),
            ActivityLogActions.loadRecentActivityLogs({ page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(ListActions.createListFailure({ error: error.message })))
        )
      )
    )
  );

  // Update list effect
  updateList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.updateList),
      switchMap(({ listData }) =>
        this.listService.updateList(listData).pipe(
          mergeMap((updatedList) => [
            ListActions.updateListSuccess({ list: updatedList }),
            ListActions.cancelEditingList(), // Exit edit mode
            ActivityLogActions.loadRecentActivityLogs({ page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(ListActions.updateListFailure({ error: error.message })))
        )
      )
    )
  );

  // Delete list effect
  deleteList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.deleteList),
      switchMap(({ id }) =>
        this.listService.deleteList(id).pipe(
          mergeMap(() => [
            // First delete all tasks in the list (backend handles this)
            TaskActions.deleteTasksByList({ listId: id }),
            // Then delete the list
            ListActions.deleteListSuccess({ id }),
            // Refresh activity logs
            ActivityLogActions.loadRecentActivityLogs({ page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(ListActions.deleteListFailure({ error: error.message })))
        )
      )
    )
  );

  // Reorder lists effect
  reorderLists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.reorderLists),
      switchMap(({ listIds }) =>
        this.listService.reorderLists(listIds).pipe(
          map((lists) => ListActions.reorderListsSuccess({ lists })),
          catchError((error) => of(ListActions.reorderListsFailure({ error: error.message })))
        )
      )
    )
  );

  // Refresh lists effect
  refreshLists$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ListActions.refreshLists),
      map(() => ListActions.loadLists())
    )
  );
}