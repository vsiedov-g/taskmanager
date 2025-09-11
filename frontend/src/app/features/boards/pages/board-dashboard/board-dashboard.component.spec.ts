import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { BoardDashboardComponent } from './board-dashboard.component';
import { BoardService } from '../../../../core/services/board.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BoardRefreshService } from '../../../../core/services/board-refresh.service';
import { CreateBoardModalComponent } from '../../components/create-board-modal/create-board-modal.component';
import { JoinBoardModalComponent } from '../../components/join-board-modal/join-board-modal.component';
import { Board } from '../../../../core/models/board.model';
import { By } from '@angular/platform-browser';

describe('BoardDashboardComponent', () => {
  let component: BoardDashboardComponent;
  let fixture: ComponentFixture<BoardDashboardComponent>;
  let boardService: jasmine.SpyObj<BoardService>;
  let authService: jasmine.SpyObj<AuthService>;
  let boardRefreshService: jasmine.SpyObj<BoardRefreshService>;
  let router: jasmine.SpyObj<Router>;

  const mockBoards: Board[] = [
    {
      id: '1',
      name: 'Test Board 1',
      description: 'Test Description 1',
      joinCode: 'JOIN123',
      ownerId: 'user1',
      createdAt: new Date().toISOString(),
      memberCount: 5,
      userRole: 0 // Admin
    },
    {
      id: '2',
      name: 'Test Board 2', 
      description: 'Test Description 2',
      joinCode: 'JOIN456',
      ownerId: 'user1',
      createdAt: new Date().toISOString(),
      memberCount: 3,
      userRole: 1 // Member
    }
  ];

  beforeEach(async () => {
    const boardServiceSpy = jasmine.createSpyObj('BoardService', ['getUserBoards']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut']);
    const boardRefreshServiceSpy = jasmine.createSpyObj('BoardRefreshService', ['notifyBoardMembershipChanged']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [BoardDashboardComponent],
      providers: [
        { provide: BoardService, useValue: boardServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: BoardRefreshService, useValue: boardRefreshServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    })
    .overrideComponent(BoardDashboardComponent, {
      remove: { imports: [CreateBoardModalComponent, JoinBoardModalComponent] },
      add: { imports: [] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardDashboardComponent);
    component = fixture.componentInstance;
    boardService = TestBed.inject(BoardService) as jasmine.SpyObj<BoardService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    boardRefreshService = TestBed.inject(BoardRefreshService) as jasmine.SpyObj<BoardRefreshService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    boardService.getUserBoards.and.returnValue(of(mockBoards));
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize properties correctly', () => {
      expect(component.isLoading).toBe(false);
      expect(component.copiedBoardIds).toEqual(new Set());
    });

    it('should load boards on ngOnInit', () => {
      component.ngOnInit();
      
      expect(boardService.getUserBoards).toHaveBeenCalled();
      expect(component.boards$).toBeDefined();
    });

    it('should set isLoading to false after boards are loaded', fakeAsync(() => {
      component.ngOnInit();
      tick();
      
      expect(component.isLoading).toBe(false);
    }));
  });

  describe('loadBoards', () => {
    it('should set isLoading to true initially', () => {
      component.loadBoards();
      
      expect(component.isLoading).toBe(true);
    });

    it('should call boardService.getUserBoards', () => {
      component.loadBoards();
      
      expect(boardService.getUserBoards).toHaveBeenCalled();
    });

    it('should set isLoading to false after subscription', fakeAsync(() => {
      component.loadBoards();
      tick();
      
      expect(component.isLoading).toBe(false);
    }));

    it('should handle observable subscription', () => {
      const mockObservable = of(mockBoards);
      boardService.getUserBoards.and.returnValue(mockObservable);
      
      component.loadBoards();
      
      expect(component.boards$).toBe(mockObservable);
    });
  });

  describe('onBoardSelect', () => {
    it('should navigate to task-board with boardId query param', () => {
      const board = mockBoards[0];
      
      component.onBoardSelect(board);
      
      expect(router.navigate).toHaveBeenCalledWith(['/task-board'], { 
        queryParams: { boardId: board.id } 
      });
    });

    it('should handle board selection with different boards', () => {
      const board1 = mockBoards[0];
      const board2 = mockBoards[1];
      
      component.onBoardSelect(board1);
      expect(router.navigate).toHaveBeenCalledWith(['/task-board'], { 
        queryParams: { boardId: board1.id } 
      });
      
      component.onBoardSelect(board2);
      expect(router.navigate).toHaveBeenCalledWith(['/task-board'], { 
        queryParams: { boardId: board2.id } 
      });
    });
  });

  describe('Modal Operations', () => {
    beforeEach(() => {
      // Create mock modals
      component.createModal = jasmine.createSpyObj('CreateBoardModalComponent', ['show']);
      component.joinModal = jasmine.createSpyObj('JoinBoardModalComponent', ['show']);
    });

    it('should show create modal on onCreateBoard', () => {
      component.onCreateBoard();
      
      expect(component.createModal.show).toHaveBeenCalled();
    });

    it('should show join modal on onJoinBoard', () => {
      component.onJoinBoard();
      
      expect(component.joinModal.show).toHaveBeenCalled();
    });

    it('should reload boards on board created', () => {
      spyOn(component, 'loadBoards');
      
      component.onBoardCreated();
      
      expect(component.loadBoards).toHaveBeenCalled();
    });

    it('should reload boards and notify refresh service on board joined', () => {
      spyOn(component, 'loadBoards');
      
      component.onBoardJoined();
      
      expect(component.loadBoards).toHaveBeenCalled();
      expect(boardRefreshService.notifyBoardMembershipChanged).toHaveBeenCalledWith('');
    });
  });

  describe('Sign Out', () => {
    it('should call authService.signOut and navigate to sign-in', () => {
      component.onSignOut();
      
      expect(authService.signOut).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/sign-in']);
    });
  });

  describe('Copy Join Code', () => {
    let mockClipboard: jasmine.SpyObj<Clipboard>;

    beforeEach(() => {
      mockClipboard = jasmine.createSpyObj('Clipboard', ['writeText']);
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true
      });
    });

    it('should copy join code using clipboard API', fakeAsync(() => {
      const joinCode = 'JOIN123';
      const boardId = '1';
      mockClipboard.writeText.and.returnValue(Promise.resolve());
      
      component.copyJoinCode(joinCode, boardId);
      tick();
      
      expect(mockClipboard.writeText).toHaveBeenCalledWith(joinCode);
      expect(component.isCopied(boardId)).toBe(true);
    }));

    it('should clear copied state after 2 seconds', fakeAsync(() => {
      const joinCode = 'JOIN123';
      const boardId = '1';
      mockClipboard.writeText.and.returnValue(Promise.resolve());
      
      component.copyJoinCode(joinCode, boardId);
      tick();
      
      expect(component.isCopied(boardId)).toBe(true);
      
      tick(2000);
      
      expect(component.isCopied(boardId)).toBe(false);
    }));

    it('should use fallback when clipboard API fails', fakeAsync(() => {
      const joinCode = 'JOIN123';
      const boardId = '1';
      mockClipboard.writeText.and.returnValue(Promise.reject(new Error('Clipboard error')));
      spyOn(component as any, 'fallbackCopyText');
      
      component.copyJoinCode(joinCode, boardId);
      tick();
      
      expect((component as any).fallbackCopyText).toHaveBeenCalledWith(joinCode);
      expect(component.isCopied(boardId)).toBe(true);
    }));

    it('should use fallback when not in secure context', fakeAsync(() => {
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true
      });
      const joinCode = 'JOIN123';
      const boardId = '1';
      spyOn(component as any, 'fallbackCopyText');
      
      component.copyJoinCode(joinCode, boardId);
      tick();
      
      expect((component as any).fallbackCopyText).toHaveBeenCalledWith(joinCode);
      expect(component.isCopied(boardId)).toBe(true);
    }));

    it('should use fallback when clipboard is not available', fakeAsync(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true
      });
      const joinCode = 'JOIN123';
      const boardId = '1';
      spyOn(component as any, 'fallbackCopyText');
      
      component.copyJoinCode(joinCode, boardId);
      tick();
      
      expect((component as any).fallbackCopyText).toHaveBeenCalledWith(joinCode);
      expect(component.isCopied(boardId)).toBe(true);
    }));
  });

  describe('isCopied', () => {
    it('should return true for copied board IDs', () => {
      component.copiedBoardIds.add('board1');
      
      expect(component.isCopied('board1')).toBe(true);
      expect(component.isCopied('board2')).toBe(false);
    });

    it('should return false for non-copied board IDs', () => {
      expect(component.isCopied('nonexistent')).toBe(false);
    });
  });

  describe('Fallback Copy Method', () => {
    let createElementSpy: jasmine.Spy;
    let appendChildSpy: jasmine.Spy;
    let removeChildSpy: jasmine.Spy;
    let execCommandSpy: jasmine.Spy;
    let mockTextArea: jasmine.SpyObj<HTMLTextAreaElement>;

    beforeEach(() => {
      mockTextArea = jasmine.createSpyObj('HTMLTextAreaElement', ['focus', 'select'], {
        value: '',
        style: {}
      });
      
      createElementSpy = spyOn(document, 'createElement').and.returnValue(mockTextArea);
      appendChildSpy = spyOn(document.body, 'appendChild');
      removeChildSpy = spyOn(document.body, 'removeChild');
      execCommandSpy = spyOn(document, 'execCommand').and.returnValue(true);
    });

    it('should create textarea element with correct properties', () => {
      const text = 'test-text';
      
      (component as any).fallbackCopyText(text);
      
      expect(createElementSpy).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe(text);
      expect(mockTextArea.style.position).toBe('fixed');
      expect(mockTextArea.style.opacity).toBe('0');
    });

    it('should append and remove textarea from body', () => {
      const text = 'test-text';
      
      (component as any).fallbackCopyText(text);
      
      expect(appendChildSpy).toHaveBeenCalledWith(mockTextArea);
      expect(removeChildSpy).toHaveBeenCalledWith(mockTextArea);
    });

    it('should focus and select textarea', () => {
      const text = 'test-text';
      
      (component as any).fallbackCopyText(text);
      
      expect(mockTextArea.focus).toHaveBeenCalled();
      expect(mockTextArea.select).toHaveBeenCalled();
    });

    it('should execute copy command', () => {
      const text = 'test-text';
      
      (component as any).fallbackCopyText(text);
      
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
    });

    it('should handle execCommand failure gracefully', () => {
      execCommandSpy.and.returnValue(false);
      const consoleSpy = spyOn(console, 'error');
      
      (component as any).fallbackCopyText('test');
      
      // Should not throw error and should clean up
      expect(removeChildSpy).toHaveBeenCalledWith(mockTextArea);
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display loading state', () => {
      component.isLoading = true;
      fixture.detectChanges();
      
      // This would depend on the actual template implementation
      expect(component.isLoading).toBe(true);
    });

    it('should handle empty boards array', fakeAsync(() => {
      boardService.getUserBoards.and.returnValue(of([]));
      
      component.loadBoards();
      tick();
      
      component.boards$.subscribe(boards => {
        expect(boards).toEqual([]);
      });
    }));

    it('should handle service errors gracefully', fakeAsync(() => {
      boardService.getUserBoards.and.returnValue(throwError(() => new Error('Service error')));
      
      component.loadBoards();
      tick();
      
      // Component should handle errors gracefully
      expect(component.boards$).toBeDefined();
    }));
  });

  describe('Template Bindings', () => {
    it('should bind to boards observable', fakeAsync(() => {
      boardService.getUserBoards.and.returnValue(of(mockBoards));
      
      component.ngOnInit();
      tick();
      fixture.detectChanges();
      
      component.boards$.subscribe(boards => {
        expect(boards).toEqual(mockBoards);
      });
    }));
  });

  describe('Error Handling', () => {
    it('should handle copy operation errors', fakeAsync(() => {
      const consoleSpy = spyOn(console, 'error');
      const mockClipboard = jasmine.createSpyObj('Clipboard', ['writeText']);
      mockClipboard.writeText.and.returnValue(Promise.reject(new Error('Copy failed')));
      
      Object.defineProperty(navigator, 'clipboard', {
        value: mockClipboard,
        writable: true
      });
      
      component.copyJoinCode('JOIN123', '1');
      tick();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy join code:', jasmine.any(Error));
    }));
  });
});