import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { TaskService } from '../../services/task.service';
import { TaskActions } from '../actions/task.actions';
import { ActivityLogActions } from '../actions/activity-log.actions';
import { AppActions } from '../../../../core/store/actions/app.actions';
import { selectQueryParam } from '../../../../core/store/selectors/router.selectors';

@Injectable()
export class TaskEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
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
      withLatestFrom(this.store.select(selectQueryParam('boardId'))),
      exhaustMap(([{ task }, boardId]) => {
        const createRequest = {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          position: task.position,
          assigneeId: task.assigneeId,
          listId: task.listId,
          projectId: task.projectId
        };
        
        return this.taskService.createTask(createRequest).pipe(
          mergeMap((createdTask) => [
            TaskActions.createTaskSuccess({ task: createdTask }),
            TaskActions.closeCreateCardModal(),
            ActivityLogActions.loadRecentActivityLogs({ boardId: Array.isArray(boardId) ? boardId[0] : boardId!, page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(TaskActions.createTaskFailure({ error: error.message })))
        );
      })
    )
  );

  // Update task effect
  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.updateTask),
      withLatestFrom(this.store.select(selectQueryParam('boardId'))),
      exhaustMap(([{ id, changes }, boardId]) =>
        this.taskService.getTasks().pipe(
          mergeMap((tasks) => {
            const currentTask = tasks.find(t => t.id === id);
            if (!currentTask) {
              throw new Error('Task not found');
            }
            
            const updateRequest = {
              title: changes.title || currentTask.title,
              description: changes.description !== undefined ? changes.description : currentTask.description,
              status: changes.status || currentTask.status,
              priority: changes.priority || currentTask.priority,
              dueDate: changes.dueDate !== undefined ? changes.dueDate : currentTask.dueDate,
              position: changes.position !== undefined ? changes.position : currentTask.position,
              assigneeId: changes.assigneeId !== undefined ? changes.assigneeId : currentTask.assigneeId,
              listId: changes.listId || currentTask.listId,
              projectId: changes.projectId !== undefined ? changes.projectId : currentTask.projectId
            };
            
            return this.taskService.updateTask(id, updateRequest).pipe(
              mergeMap((updatedTask) => [
                TaskActions.updateTaskSuccess({ task: updatedTask }),
                TaskActions.closeEditCardModal(),
                ActivityLogActions.loadRecentActivityLogs({ boardId: Array.isArray(boardId) ? boardId[0] : boardId!, page: 1, pageSize: 20 })
              ])
            );
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
      withLatestFrom(this.store.select(selectQueryParam('boardId'))),
      exhaustMap(([{ id, status, position }, boardId]) =>
        this.taskService.updateTaskStatus(id, status).pipe(
          mergeMap((task) => [
            TaskActions.updateTaskStatusSuccess({ task }),
            ActivityLogActions.loadRecentActivityLogs({ boardId: Array.isArray(boardId) ? boardId[0] : boardId!, page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(TaskActions.updateTaskStatusFailure({ error: error.message })))
        )
      )
    )
  );

  // Move task effect (between lists)
  moveTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.moveTask),
      withLatestFrom(this.store.select(selectQueryParam('boardId'))),
      exhaustMap(([{ id, listId, position }, boardId]) =>
        this.taskService.moveTask(id, { listId, position }).pipe(
          mergeMap(() => [
            TaskActions.moveTaskSuccess({ id }),
            TaskActions.loadTasks(), // Reload tasks to get updated state
            ActivityLogActions.loadRecentActivityLogs({ boardId: Array.isArray(boardId) ? boardId[0] : boardId!, page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(TaskActions.moveTaskFailure({ error: error.message })))
        )
      )
    )
  );

  // Delete task effect
  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTask),
      withLatestFrom(this.store.select(selectQueryParam('boardId'))),
      exhaustMap(([{ id }, boardId]) =>
        this.taskService.deleteTask(id).pipe(
          mergeMap(() => [
            TaskActions.deleteTaskSuccess({ id }),
            TaskActions.closeEditCardModal(),
            ActivityLogActions.loadRecentActivityLogs({ boardId: Array.isArray(boardId) ? boardId[0] : boardId!, page: 1, pageSize: 20 })
          ]),
          catchError((error) => of(TaskActions.deleteTaskFailure({ error: error.message })))
        )
      )
    )
  );

  // Delete tasks by list effect (handled by backend when list is deleted)
  deleteTasksByList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.deleteTasksByList),
      map(({ listId }) => TaskActions.deleteTasksByListSuccess({ listId }))
    )
  );

  // Bulk update tasks effect
  bulkUpdateTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.bulkUpdateTasks),
      exhaustMap(({ ids, changes }) =>
        // For now, update tasks individually - can optimize with bulk endpoint later
        this.taskService.getTasks().pipe(
          mergeMap((tasks) => {
            const tasksToUpdate = tasks.filter(task => ids.includes(task.id));
            const updatePromises = tasksToUpdate.map(task => {
              const updateRequest = {
                title: changes.title || task.title,
                description: changes.description !== undefined ? changes.description : task.description,
                status: changes.status || task.status,
                priority: changes.priority || task.priority,
                dueDate: changes.dueDate !== undefined ? changes.dueDate : task.dueDate,
                position: changes.position !== undefined ? changes.position : task.position,
                assigneeId: changes.assigneeId !== undefined ? changes.assigneeId : task.assigneeId,
                listId: changes.listId || task.listId,
                projectId: changes.projectId !== undefined ? changes.projectId : task.projectId
              };
              return this.taskService.updateTask(task.id, updateRequest);
            });
            
            // For simplicity, just reload all tasks after bulk update
            return of(TaskActions.loadTasks());
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
        // Delete tasks individually - can optimize with bulk endpoint later
        of(...ids.map(id => this.taskService.deleteTask(id))).pipe(
          mergeMap(() => of(TaskActions.bulkDeleteTasksSuccess({ ids }))),
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

  moveTaskSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TaskActions.moveTaskSuccess),
      map(() => AppActions.addNotification({
        notification: {
          type: 'success',
          message: 'Task moved successfully'
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
        TaskActions.moveTaskFailure,
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