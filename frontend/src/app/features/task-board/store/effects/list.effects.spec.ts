import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ListEffects } from './list.effects';
import { ListService } from '../../services/list.service';
import { ListActions } from '../actions/list.actions';
import { TaskActions } from '../actions/task.actions';
import { ActivityLogActions } from '../actions/activity-log.actions';
import { selectQueryParam } from '../../../../core/store/selectors/router.selectors';
import { List } from '../../models/list.model';

describe('ListEffects', () => {
  let actions$: Observable<Action>;
  let effects: ListEffects;
  let listService: jasmine.SpyObj<ListService>;
  let store: MockStore;

  const mockList: List = {
    id: '1',
    name: 'Test List',
    position: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    taskCount: 0
  };

  const initialState = {
    router: {
      state: {
        queryParams: { boardId: 'board123' }
      }
    }
  };

  beforeEach(() => {
    const listServiceSpy = jasmine.createSpyObj('ListService', [
      'getLists',
      'createList',
      'updateList',
      'deleteList',
      'reorderLists'
    ]);

    TestBed.configureTestingModule({
      providers: [
        ListEffects,
        provideMockActions(() => actions$),
        provideMockStore({ initialState }),
        { provide: ListService, useValue: listServiceSpy }
      ]
    });

    effects = TestBed.inject(ListEffects);
    listService = TestBed.inject(ListService) as jasmine.SpyObj<ListService>;
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectQueryParam('boardId'), 'board123');
  });

  describe('loadLists$', () => {
    it('should dispatch loadListsSuccess on successful load', (done) => {
      const lists = [mockList];
      const action = ListActions.loadLists({ boardId: 'board1' });

      listService.getLists.and.returnValue(of(lists));
      actions$ = of(action);

      effects.loadLists$.subscribe(result => {
        expect(result.type).toBe('[List] Load Lists Success');
        expect((result as any).lists).toEqual(lists);
        done();
      });

      expect(listService.getLists).toHaveBeenCalledWith('board1');
    });

    it('should dispatch loadListsFailure on error', (done) => {
      const error = new Error('Load failed');
      const action = ListActions.loadLists({ boardId: 'board1' });

      listService.getLists.and.returnValue(throwError(() => error));
      actions$ = of(action);

      effects.loadLists$.subscribe(result => {
        expect(result.type).toBe('[List] Load Lists Failure');
        expect((result as any).error).toBe(error.message);
        done();
      });
    });
  });

  describe('createList$', () => {
    it('should handle list creation', () => {
      const listData = { 
        title: 'New List', 
        position: 1, 
        boardId: 'board1'
      };
      const action = ListActions.createList({ listData });

      listService.createList.and.returnValue(of(mockList));
      actions$ = of(action);

      let actionCount = 0;
      effects.createList$.subscribe(result => {
        actionCount++;
        if (actionCount === 1) {
          expect(result.type).toBe('[List] Create List Success');
        }
      });

      expect(listService.createList).toHaveBeenCalledWith(listData);
    });
  });

  describe('deleteList$', () => {
    it('should handle list deletion', () => {
      const action = ListActions.deleteList({ id: mockList.id });

      listService.deleteList.and.returnValue(of(undefined));
      actions$ = of(action);

      let actionCount = 0;
      effects.deleteList$.subscribe(result => {
        actionCount++;
        if (actionCount === 1) {
          expect(result.type).toBe('[Task] Delete Tasks By List');
        } else if (actionCount === 2) {
          expect(result.type).toBe('[List] Delete List Success');
        }
      });

      expect(listService.deleteList).toHaveBeenCalledWith(mockList.id);
    });
  });

  describe('refreshLists$', () => {
    it('should dispatch loadLists action', (done) => {
      const boardId = 'board123';
      const action = ListActions.refreshLists({ boardId });
      actions$ = of(action);

      effects.refreshLists$.subscribe(result => {
        expect(result.type).toBe('[List] Load Lists');
        expect((result as any).boardId).toBe(boardId);
        done();
      });
    });
  });

  describe('Effects Integration', () => {
    it('should be created', () => {
      expect(effects).toBeTruthy();
    });

    it('should have all required effects defined', () => {
      expect(effects.loadLists$).toBeDefined();
      expect(effects.createList$).toBeDefined();
      expect(effects.updateList$).toBeDefined();
      expect(effects.deleteList$).toBeDefined();
      expect(effects.reorderLists$).toBeDefined();
      expect(effects.refreshLists$).toBeDefined();
    });

    it('should inject all required dependencies', () => {
      expect(effects['actions$']).toBeDefined();
      expect(effects['store']).toBeDefined();
      expect(effects['listService']).toBeDefined();
    });
  });
});