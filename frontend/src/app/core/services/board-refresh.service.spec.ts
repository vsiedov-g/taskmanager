import { TestBed } from '@angular/core/testing';
import { BoardRefreshService } from './board-refresh.service';
import { Subject } from 'rxjs';

describe('BoardRefreshService', () => {
  let service: BoardRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BoardRefreshService]
    });
    service = TestBed.inject(BoardRefreshService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have boardMembershipChanged$ observable', () => {
      expect(service.boardMembershipChanged$).toBeDefined();
    });

    it('should initialize with a Subject internally', () => {
      expect(service['boardMembershipChangedSubject']).toBeInstanceOf(Subject);
    });
  });

  describe('notifyBoardMembershipChanged', () => {
    it('should emit boardId when called', (done) => {
      const testBoardId = 'board-123';

      service.boardMembershipChanged$.subscribe(boardId => {
        expect(boardId).toBe(testBoardId);
        done();
      });

      service.notifyBoardMembershipChanged(testBoardId);
    });

    it('should handle empty string boardId', (done) => {
      const emptyBoardId = '';

      service.boardMembershipChanged$.subscribe(boardId => {
        expect(boardId).toBe(emptyBoardId);
        done();
      });

      service.notifyBoardMembershipChanged(emptyBoardId);
    });

    it('should handle multiple notifications', () => {
      const boardIds: string[] = [];
      const expectedBoardIds = ['board-1', 'board-2', 'board-3'];

      service.boardMembershipChanged$.subscribe(boardId => {
        boardIds.push(boardId);
      });

      expectedBoardIds.forEach(id => {
        service.notifyBoardMembershipChanged(id);
      });

      expect(boardIds).toEqual(expectedBoardIds);
    });

    it('should notify all subscribers', () => {
      const testBoardId = 'board-456';
      let subscriber1Called = false;
      let subscriber2Called = false;

      service.boardMembershipChanged$.subscribe(boardId => {
        expect(boardId).toBe(testBoardId);
        subscriber1Called = true;
      });

      service.boardMembershipChanged$.subscribe(boardId => {
        expect(boardId).toBe(testBoardId);
        subscriber2Called = true;
      });

      service.notifyBoardMembershipChanged(testBoardId);

      expect(subscriber1Called).toBe(true);
      expect(subscriber2Called).toBe(true);
    });

    it('should handle rapid successive notifications', () => {
      const receivedBoardIds: string[] = [];
      const testBoardIds = ['board-1', 'board-2', 'board-1', 'board-3', 'board-2'];

      service.boardMembershipChanged$.subscribe(boardId => {
        receivedBoardIds.push(boardId);
      });

      testBoardIds.forEach(id => {
        service.notifyBoardMembershipChanged(id);
      });

      expect(receivedBoardIds).toEqual(testBoardIds);
      expect(receivedBoardIds.length).toBe(5);
    });
  });

  describe('Observable Behavior', () => {
    it('should be hot observable (Subject)', () => {
      // Emit before subscription
      service.notifyBoardMembershipChanged('before-subscription');

      const receivedBoardIds: string[] = [];

      // Subscribe after emission
      service.boardMembershipChanged$.subscribe(boardId => {
        receivedBoardIds.push(boardId);
      });

      // Should not receive the emission that happened before subscription
      expect(receivedBoardIds).toEqual([]);

      // Emit after subscription
      service.notifyBoardMembershipChanged('after-subscription');
      expect(receivedBoardIds).toEqual(['after-subscription']);
    });

    it('should support multiple subscriptions independently', () => {
      const subscription1Results: string[] = [];
      const subscription2Results: string[] = [];

      const sub1 = service.boardMembershipChanged$.subscribe(boardId => {
        subscription1Results.push(boardId);
      });

      service.notifyBoardMembershipChanged('test-1');

      const sub2 = service.boardMembershipChanged$.subscribe(boardId => {
        subscription2Results.push(boardId);
      });

      service.notifyBoardMembershipChanged('test-2');

      expect(subscription1Results).toEqual(['test-1', 'test-2']);
      expect(subscription2Results).toEqual(['test-2']); // Only gets emissions after subscription

      sub1.unsubscribe();
      sub2.unsubscribe();
    });

    it('should handle unsubscription properly', () => {
      let emissionCount = 0;

      const subscription = service.boardMembershipChanged$.subscribe(() => {
        emissionCount++;
      });

      service.notifyBoardMembershipChanged('test-1');
      expect(emissionCount).toBe(1);

      subscription.unsubscribe();

      service.notifyBoardMembershipChanged('test-2');
      expect(emissionCount).toBe(1); // Should not increment after unsubscription
    });

    it('should continue working after one subscriber unsubscribes', () => {
      let sub1Count = 0;
      let sub2Count = 0;

      const sub1 = service.boardMembershipChanged$.subscribe(() => {
        sub1Count++;
      });

      const sub2 = service.boardMembershipChanged$.subscribe(() => {
        sub2Count++;
      });

      service.notifyBoardMembershipChanged('test-1');
      expect(sub1Count).toBe(1);
      expect(sub2Count).toBe(1);

      sub1.unsubscribe();

      service.notifyBoardMembershipChanged('test-2');
      expect(sub1Count).toBe(1); // Should not increment
      expect(sub2Count).toBe(2); // Should continue to increment

      sub2.unsubscribe();
    });
  });

  describe('Integration Scenarios', () => {
    it('should support typical board membership workflow', () => {
      const membershipEvents: { event: string, boardId: string }[] = [];

      service.boardMembershipChanged$.subscribe(boardId => {
        membershipEvents.push({ event: 'membership_changed', boardId });
      });

      // Simulate user joining a board
      service.notifyBoardMembershipChanged('board-1');
      
      // Simulate user leaving a board  
      service.notifyBoardMembershipChanged('board-1');
      
      // Simulate user joining another board
      service.notifyBoardMembershipChanged('board-2');

      expect(membershipEvents).toEqual([
        { event: 'membership_changed', boardId: 'board-1' },
        { event: 'membership_changed', boardId: 'board-1' },
        { event: 'membership_changed', boardId: 'board-2' }
      ]);
    });

    it('should handle error scenarios gracefully', () => {
      let errorOccurred = false;
      
      service.boardMembershipChanged$.subscribe({
        next: (boardId) => {
          // Simulate error in subscriber
          if (boardId === 'error-board') {
            throw new Error('Subscriber error');
          }
        },
        error: () => {
          errorOccurred = true;
        }
      });

      // This should not cause the service to break
      expect(() => {
        service.notifyBoardMembershipChanged('valid-board');
      }).not.toThrow();

      // The error in subscriber should not affect the service
      expect(errorOccurred).toBe(false);
    });

    it('should work with async subscribers', (done) => {
      const asyncResults: string[] = [];

      service.boardMembershipChanged$.subscribe(async (boardId) => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        asyncResults.push(boardId);
        
        if (asyncResults.length === 2) {
          expect(asyncResults).toEqual(['board-1', 'board-2']);
          done();
        }
      });

      service.notifyBoardMembershipChanged('board-1');
      service.notifyBoardMembershipChanged('board-2');
    });
  });

  describe('Memory Management', () => {
    it('should not retain references after unsubscription', () => {
      const subscriptions = [];

      // Create multiple subscriptions
      for (let i = 0; i < 5; i++) {
        const sub = service.boardMembershipChanged$.subscribe(() => {});
        subscriptions.push(sub);
      }

      // Unsubscribe all
      subscriptions.forEach(sub => sub.unsubscribe());

      // Service should continue to work normally
      let received = false;
      const newSub = service.boardMembershipChanged$.subscribe(() => {
        received = true;
      });

      service.notifyBoardMembershipChanged('test');
      expect(received).toBe(true);

      newSub.unsubscribe();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null or undefined boardId gracefully', () => {
      const receivedValues: any[] = [];

      service.boardMembershipChanged$.subscribe(boardId => {
        receivedValues.push(boardId);
      });

      // These should still work even though they're edge cases
      service.notifyBoardMembershipChanged(null as any);
      service.notifyBoardMembershipChanged(undefined as any);

      expect(receivedValues).toEqual([null, undefined]);
    });

    it('should handle special string values', () => {
      const receivedValues: string[] = [];
      const specialValues = ['', ' ', '\n', '\t', '0', 'null', 'undefined'];

      service.boardMembershipChanged$.subscribe(boardId => {
        receivedValues.push(boardId);
      });

      specialValues.forEach(value => {
        service.notifyBoardMembershipChanged(value);
      });

      expect(receivedValues).toEqual(specialValues);
    });
  });
});