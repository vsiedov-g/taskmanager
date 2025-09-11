import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ActivityLogEffects } from './activity-log.effects';
import { ActivityLogService } from '../../services/activity-log.service';
import { ActivityLogActions } from '../actions/activity-log.actions';
import { selectActivityLogCurrentPage, selectActivityLogPageSize } from '../selectors/activity-log.selectors';
import { ActivityLog } from '../../models/activity-log.model';

describe('ActivityLogEffects', () => {
  let actions$: Observable<Action>;
  let effects: ActivityLogEffects;
  let activityLogService: jasmine.SpyObj<ActivityLogService>;
  let store: MockStore;

  const mockActivityLog: ActivityLog = {
    id: '1',
    action: 'task_created',
    entityType: 'task',
    entityId: 'task1',
    description: 'Task created',
    createdAt: new Date().toISOString(),
    userId: 'user1',
    cardId: 'card1',
    user: {
      id: 'user1',
      name: 'John Doe'
    },
    card: null
  };

  const initialState = {
    activityLog: {
      currentPage: 1,
      pageSize: 20,
      hasMore: true,
      loading: false,
      error: null,
      logs: []
    }
  };

  beforeEach(() => {
    const activityLogServiceSpy = jasmine.createSpyObj('ActivityLogService', [
      'getActivityLogs',
      'getActivityLogsByCard',
      'getActivityLogsByUser',
      'getRecentActivityLogs',
      'getActivityLogById',
      'createActivityLog',
      'updateActivityLog',
      'deleteActivityLog'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ActivityLogEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        { provide: ActivityLogService, useValue: activityLogServiceSpy }
      ]
    });

    effects = TestBed.inject(ActivityLogEffects);
    activityLogService = TestBed.inject(ActivityLogService) as jasmine.SpyObj<ActivityLogService>;
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActivityLogCurrentPage, 1);
    store.overrideSelector(selectActivityLogPageSize, 20);
  });

  describe('loadActivityLogs$', () => {
    it('should dispatch loadActivityLogsSuccess on successful load', (done) => {
      const activityLogs = [mockActivityLog];
      const action = ActivityLogActions.loadActivityLogs({ page: 1, pageSize: 20 });

      activityLogService.getActivityLogs.and.returnValue(of(activityLogs));
      actions$ = of(action);

      effects.loadActivityLogs$.subscribe(result => {
        expect(result.type).toBe('[ActivityLog] Load Activity Logs Success');
        expect((result as any).activityLogs).toEqual(activityLogs);
        expect((result as any).isLoadMore).toBe(false);
        done();
      });

      expect(activityLogService.getActivityLogs).toHaveBeenCalledWith(1, 20);
    });

    it('should dispatch loadActivityLogsFailure on error', (done) => {
      const error = new Error('Load failed');
      const action = ActivityLogActions.loadActivityLogs({ page: 1, pageSize: 20 });

      activityLogService.getActivityLogs.and.returnValue(throwError(() => error));
      actions$ = of(action);

      effects.loadActivityLogs$.subscribe(result => {
        expect(result.type).toBe('[ActivityLog] Load Activity Logs Failure');
        expect((result as any).error).toBe(error.message);
        done();
      });
    });

    it('should set isLoadMore to true for pages > 1', (done) => {
      const activityLogs = [mockActivityLog];
      const action = ActivityLogActions.loadActivityLogs({ page: 2, pageSize: 20 });

      activityLogService.getActivityLogs.and.returnValue(of(activityLogs));
      actions$ = of(action);

      effects.loadActivityLogs$.subscribe(result => {
        expect((result as any).isLoadMore).toBe(true);
        done();
      });
    });

    it('should use default values for page and pageSize', (done) => {
      const activityLogs = [mockActivityLog];
      const action = ActivityLogActions.loadActivityLogs({});

      activityLogService.getActivityLogs.and.returnValue(of(activityLogs));
      actions$ = of(action);

      effects.loadActivityLogs$.subscribe(result => {
        expect((result as any).isLoadMore).toBe(false);
        done();
      });

      expect(activityLogService.getActivityLogs).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('loadActivityLogsByCard$', () => {
    it('should dispatch loadActivityLogsByCardSuccess on successful load', (done) => {
      const activityLogs = [mockActivityLog];
      const action = ActivityLogActions.loadActivityLogsByCard({ 
        cardId: 'card1', 
        page: 1, 
        pageSize: 20 
      });

      activityLogService.getActivityLogsByCard.and.returnValue(of(activityLogs));
      actions$ = of(action);

      effects.loadActivityLogsByCard$.subscribe(result => {
        expect(result.type).toBe('[ActivityLog] Load Activity Logs By Card Success');
        expect((result as any).activityLogs).toEqual(activityLogs);
        expect((result as any).isLoadMore).toBe(false);
        done();
      });

      expect(activityLogService.getActivityLogsByCard).toHaveBeenCalledWith('card1', 1, 20);
    });
  });

  describe('createActivityLog$', () => {
    it('should dispatch createActivityLogSuccess on successful creation', (done) => {
      const activityLogData = { 
        action: 'task_created',
        entityType: 'task',
        entityId: 'task1',
        description: 'New task created',
        userId: 'user1',
        cardId: 'card1'
      };
      const createdActivityLog = mockActivityLog;
      const action = ActivityLogActions.createActivityLog({ activityLog: activityLogData });

      activityLogService.createActivityLog.and.returnValue(of(createdActivityLog));
      actions$ = of(action);

      effects.createActivityLog$.subscribe(result => {
        expect(result.type).toBe('[ActivityLog] Create Activity Log Success');
        expect((result as any).activityLog).toEqual(createdActivityLog);
        done();
      });

      expect(activityLogService.createActivityLog).toHaveBeenCalledWith(activityLogData);
    });
  });

  describe('Effects Integration', () => {
    it('should be created', () => {
      expect(effects).toBeTruthy();
    });

    it('should have all required effects defined', () => {
      expect(effects.loadActivityLogs$).toBeDefined();
      expect(effects.loadMoreActivityLogs$).toBeDefined();
      expect(effects.loadActivityLogsByCard$).toBeDefined();
      expect(effects.loadMoreActivityLogsByCard$).toBeDefined();
      expect(effects.loadActivityLogsByUser$).toBeDefined();
      expect(effects.loadRecentActivityLogs$).toBeDefined();
      expect(effects.loadMoreRecentActivityLogs$).toBeDefined();
      expect(effects.getActivityLog$).toBeDefined();
      expect(effects.createActivityLog$).toBeDefined();
      expect(effects.updateActivityLog$).toBeDefined();
      expect(effects.deleteActivityLog$).toBeDefined();
    });
  });
});