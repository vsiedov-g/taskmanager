import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, mergeMap, tap } from 'rxjs/operators';
import { TaskService } from '../../services/task.service';
import { TaskActions } from '../actions/task.actions';
import { AppActions } from '../../../../core/store/actions/app.actions';

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions);
  private taskService = inject(TaskService);

  // Load tasks effect
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.loadTasks),
      exhaustMap(() =>
        this.taskService.getTasks().pipe(
          map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
          catchError((error) => of(TaskActions.loadTasksFailure({ error: error.message })))
        )
      )
    )
  );

  // Create task effect
  createTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTask),
      exhaustMap(({ task }) =>
        // TODO: Replace with actual API call
        of({
          ...task,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }).pipe(
          map((createdTask) => TaskActions.createTaskSuccess({ task: createdTask })),
          catchError((error) => of(TaskActions.createTaskFailure({ error: error.message })))
        )
      )
    )
  );

  // Update task effect
  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      exhaustMap(({ id, changes }) =>
        // TODO: Replace with actual API call
        this.taskService.getTasks().pipe(
          map((tasks) => {
            const task = tasks.find(t => t.id === id);
            if (task) {
              const updatedTask = { ...task, ...changes, updatedAt: new Date().toISOString() };
              return TaskActions.updateTaskSuccess({ task: updatedTask });
            }
            throw new Error('Task not found');
          }),
          catchError((error) => of(TaskActions.updateTaskFailure({ error: error.message })))
        )
      )
    )
  );

  // Update task status effect (drag and drop)
  updateTaskStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTaskStatus),
      exhaustMap(({ id, status, position }) =>
        this.taskService.updateTaskStatus(id, status).pipe(
          map((task) => TaskActions.updateTaskStatusSuccess({ task })),
          catchError((error) => of(TaskActions.updateTaskStatusFailure({ error: error.message })))
        )
      )
    )
  );

  // Delete task effect
  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      exhaustMap(({ id }) =>
        // TODO: Replace with actual API call
        of({ id }).pipe(
          map(() => TaskActions.deleteTaskSuccess({ id })),
          catchError((error) => of(TaskActions.deleteTaskFailure({ error: error.message })))
        )
      )
    )
  );

  // Bulk update tasks effect
  bulkUpdateTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.bulkUpdateTasks),
      exhaustMap(({ ids, changes }) =>
        // TODO: Replace with actual API call
        this.taskService.getTasks().pipe(
          map((tasks) => {
            const updatedTasks = tasks
              .filter(task => ids.includes(task.id))
              .map(task => ({ ...task, ...changes, updatedAt: new Date().toISOString() }));
            return TaskActions.bulkUpdateTasksSuccess({ tasks: updatedTasks });
          }),
          catchError((error) => of(TaskActions.bulkUpdateTasksFailure({ error: error.message })))
        )
      )
    )
  );

  // Bulk delete tasks effect
  bulkDeleteTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.bulkDeleteTasks),
      exhaustMap(({ ids }) =>
        // TODO: Replace with actual API call
        of({ ids }).pipe(
          map(() => TaskActions.bulkDeleteTasksSuccess({ ids })),
          catchError((error) => of(TaskActions.bulkDeleteTasksFailure({ error: error.message })))
        )
      )
    )
  );

  // Success notification effects
  createTaskSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.createTaskSuccess),
      map(() => AppActions.addNotification({
        notification: {
          type: 'success',
          message: 'Task created successfully'
        }
      }))
    )
  );

  updateTaskSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTaskSuccess),
      map(() => AppActions.addNotification({
        notification: {
          type: 'success',
          message: 'Task updated successfully'
        }
      }))
    )
  );

  deleteTaskSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTaskSuccess),
      map(() => AppActions.addNotification({
        notification: {
          type: 'success',
          message: 'Task deleted successfully'
        }
      }))
    )
  );

  // Error notification effects
  taskFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TaskActions.loadTasksFailure,
        TaskActions.createTaskFailure,
        TaskActions.updateTaskFailure,
        TaskActions.updateTaskStatusFailure,
        TaskActions.deleteTaskFailure,
        TaskActions.bulkUpdateTasksFailure,
        TaskActions.bulkDeleteTasksFailure
      ),
      map(({ error }) => AppActions.addNotification({
        notification: {
          type: 'error',
          message: error
        }
      }))
    )
  );

  // Auto-refresh tasks on window focus (optional)
  // refreshOnFocus$ = createEffect(() =>
  //   fromEvent(window, 'focus').pipe(
  //     map(() => TaskActions.refreshTasks())
  //   )
  // );
}