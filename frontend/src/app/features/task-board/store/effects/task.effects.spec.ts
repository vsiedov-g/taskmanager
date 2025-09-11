import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { TaskEffects } from './task.effects';
import { TaskService } from '../../services/task.service';
import { TaskActions } from '../actions/task.actions';
import { ActivityLogActions } from '../actions/activity-log.actions';
import { AppActions } from '../../../../core/store/actions/app.actions';
import { selectQueryParam } from '../../../../core/store/selectors/router.selectors';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';

describe('TaskEffects', () => {
  let actions$: Observable<Action>;
  let effects: TaskEffects;
  let taskService: jasmine.SpyObj<TaskService>;
  let store: MockStore;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    dueDate: new Date().toISOString(),
    position: 1,
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    listId: 'list1',
    projectId: 'project1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const initialState = {
    router: {
      state: {
        queryParams: { boardId: 'board123' }
      }
    }
  };

  beforeEach(() => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getTasks',
      'createTask',
      'updateTask',
      'updateTaskStatus',
      'moveTask',
      'deleteTask'
    ]);

    TestBed.configureTestingModule({
      providers: [
        TaskEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    });

    effects = TestBed.inject(TaskEffects);
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectQueryParam('boardId'), 'board123');
  });

  describe('loadTasks$', () => {
    it('should dispatch loadTasksSuccess on successful load', (done) => {
      const tasks = [mockTask];
      const action = TaskActions.loadTasks();

      taskService.getTasks.and.returnValue(of(tasks));
      actions$ = of(action);

      effects.loadTasks$.subscribe(result => {
        expect(result.type).toBe('[Task] Load Tasks Success');
        expect((result as any).tasks).toEqual(tasks);
        done();
      });
    });

    it('should dispatch loadTasksFailure on error', (done) => {
      const error = new Error('Load failed');
      const action = TaskActions.loadTasks();

      taskService.getTasks.and.returnValue(throwError(() => error));
      actions$ = of(action);

      effects.loadTasks$.subscribe(result => {
        expect(result.type).toBe('[Task] Load Tasks Failure');
        expect((result as any).error).toBe(error.message);
        done();
      });
    });
  });

  describe('createTask$', () => {
    it('should handle task creation', () => {
      const taskToCreate = { ...mockTask, id: undefined } as any;
      const createdTask = mockTask;
      const action = TaskActions.createTask({ task: taskToCreate });

      taskService.createTask.and.returnValue(of(createdTask));
      actions$ = of(action);

      let actionCount = 0;
      effects.createTask$.subscribe(result => {
        actionCount++;
        if (actionCount === 1) {
          expect(result.type).toBe('[Task] Create Task Success');
        }
        // Additional actions are also emitted (close modal, refresh activity)
      });

      expect(taskService.createTask).toHaveBeenCalled();
    });
  });

  describe('deleteTask$', () => {
    it('should handle task deletion', () => {
      const action = TaskActions.deleteTask({ id: mockTask.id });

      taskService.deleteTask.and.returnValue(of(undefined));
      actions$ = of(action);

      let actionCount = 0;
      effects.deleteTask$.subscribe(result => {
        actionCount++;
        if (actionCount === 1) {
          expect(result.type).toBe('[Task] Delete Task Success');
        }
      });

      expect(taskService.deleteTask).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('notification effects', () => {
    it('should dispatch success notification on createTaskSuccess', (done) => {
      const action = TaskActions.createTaskSuccess({ task: mockTask });
      actions$ = of(action);

      effects.createTaskSuccess$.subscribe(result => {
        expect(result.type).toBe('[App] Add Notification');
        expect((result as any).notification.type).toBe('success');
        expect((result as any).notification.message).toBe('Task created successfully');
        done();
      });
    });

    it('should dispatch error notification on task failures', (done) => {
      const errorMessage = 'Task operation failed';
      const action = TaskActions.loadTasksFailure({ error: errorMessage });
      actions$ = of(action);

      effects.taskFailure$.subscribe(result => {
        expect(result.type).toBe('[App] Add Notification');
        expect((result as any).notification.type).toBe('error');
        expect((result as any).notification.message).toBe(errorMessage);
        done();
      });
    });
  });

  describe('Effects Integration', () => {
    it('should be created', () => {
      expect(effects).toBeTruthy();
    });

    it('should have all required effects defined', () => {
      expect(effects.loadTasks$).toBeDefined();
      expect(effects.createTask$).toBeDefined();
      expect(effects.updateTask$).toBeDefined();
      expect(effects.updateTaskStatus$).toBeDefined();
      expect(effects.moveTask$).toBeDefined();
      expect(effects.deleteTask$).toBeDefined();
      expect(effects.deleteTasksByList$).toBeDefined();
      expect(effects.bulkUpdateTasks$).toBeDefined();
      expect(effects.bulkDeleteTasks$).toBeDefined();
    });
  });
});