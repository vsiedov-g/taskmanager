import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog, ActivityLogFilters } from '../models/activity-log.model';
import { environment } from '../../../../environments/environment';

describe('ActivityLogService', () => {
  let service: ActivityLogService;
  let httpMock: HttpTestingController;

  const mockActivityLog: ActivityLog = {
    id: '1',
    action: 'Task Created',
    entityType: 'Task',
    entityId: 'card1',
    description: 'Task "Test Task" was created',
    cardId: 'card1',
    userId: 'user1',
    createdAt: '2024-01-15T10:00:00Z',
    user: {
      id: 'user1',
      name: 'John Doe'
    },
    card: {
      id: 'card1',
      title: 'Test Task',
      description: 'Test task description',
      status: 0,
      position: 1,
      assigneeId: 'user1',
      listId: 'list1'
    }
  };

  const mockActivityLogs: ActivityLog[] = [
    mockActivityLog,
    {
      id: '2',
      action: 'Task Updated',
      entityType: 'Task',
      entityId: 'card1',
      description: 'Task status changed to In Progress',
      cardId: 'card1',
      userId: 'user2',
      createdAt: '2024-01-15T11:00:00Z',
      user: {
        id: 'user2',
        name: 'Jane Smith'
      },
      card: {
        id: 'card1',
        title: 'Test Task',
        description: 'Test task description',
        status: 1,
        position: 1,
        assigneeId: 'user2',
        listId: 'list1'
      }
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ActivityLogService]
    });
    service = TestBed.inject(ActivityLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct base URL', () => {
      expect(service['baseUrl']).toBe(`${environment.apiUrl}/activitylogs`);
    });
  });

  describe('getActivityLogs', () => {
    it('should send GET request with default pagination', () => {
      service.getActivityLogs().subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
        expect(logs.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockActivityLogs);
    });

    it('should send GET request with custom pagination', () => {
      service.getActivityLogs(2, 10).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=2&pageSize=10`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockActivityLogs);
    });

    it('should handle empty activity logs array', () => {
      service.getActivityLogs().subscribe(logs => {
        expect(logs).toEqual([]);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      service.getActivityLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized access', () => {
      service.getActivityLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getActivityLogById', () => {
    const logId = '1';

    it('should send GET request to activity log by ID endpoint', () => {
      service.getActivityLogById(logId).subscribe(log => {
        expect(log).toEqual(mockActivityLog);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActivityLog);
    });

    it('should handle activity log not found', () => {
      service.getActivityLogById('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/nonexistent`);
      req.flush('Activity log not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error', () => {
      service.getActivityLogById(logId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getActivityLogsByCard', () => {
    const cardId = 'card1';

    it('should send GET request with card ID and default pagination', () => {
      service.getActivityLogsByCard(cardId).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/${cardId}?page=1&pageSize=20`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockActivityLogs);
    });

    it('should send GET request with card ID and custom pagination', () => {
      service.getActivityLogsByCard(cardId, 3, 5).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/${cardId}?page=3&pageSize=5`
      );
      req.flush(mockActivityLogs);
    });

    it('should handle card not found', () => {
      service.getActivityLogsByCard('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/nonexistent?page=1&pageSize=20`
      );
      req.flush('Card not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return empty array for card with no activity', () => {
      service.getActivityLogsByCard(cardId).subscribe(logs => {
        expect(logs).toEqual([]);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/${cardId}?page=1&pageSize=20`
      );
      req.flush([]);
    });
  });

  describe('getActivityLogsByUser', () => {
    const userId = 'user1';

    it('should send GET request to user activity logs endpoint', () => {
      service.getActivityLogsByUser(userId).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/by-user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockActivityLogs);
    });

    it('should handle user not found', () => {
      service.getActivityLogsByUser('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/by-user/nonexistent`);
      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return empty array for user with no activity', () => {
      service.getActivityLogsByUser(userId).subscribe(logs => {
        expect(logs).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/by-user/${userId}`);
      req.flush([]);
    });

    it('should handle forbidden access to user activities', () => {
      service.getActivityLogsByUser(userId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/by-user/${userId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getRecentActivityLogs', () => {
    const boardId = 'board1';

    it('should send GET request with board ID and default pagination', () => {
      service.getRecentActivityLogs(boardId).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?boardId=${boardId}&page=1&pageSize=20`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockActivityLogs);
    });

    it('should send GET request with board ID and custom pagination', () => {
      service.getRecentActivityLogs(boardId, 2, 15).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?boardId=${boardId}&page=2&pageSize=15`
      );
      req.flush(mockActivityLogs);
    });

    it('should handle board not found', () => {
      service.getRecentActivityLogs('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?boardId=nonexistent&page=1&pageSize=20`
      );
      req.flush('Board not found', { status: 404, statusText: 'Not Found' });
    });

    it('should return empty array for board with no activity', () => {
      service.getRecentActivityLogs(boardId).subscribe(logs => {
        expect(logs).toEqual([]);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?boardId=${boardId}&page=1&pageSize=20`
      );
      req.flush([]);
    });
  });

  describe('createActivityLog', () => {
    const createRequest = {
      action: 'Task Created',
      entityType: 'Task',
      entityId: 'card1',
      description: 'New task was created',
      cardId: 'card1',
      userId: 'user1'
    };

    it('should send POST request to create activity log', () => {
      service.createActivityLog(createRequest).subscribe(log => {
        expect(log).toEqual(mockActivityLog);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockActivityLog);
    });

    it('should handle validation errors', () => {
      const invalidRequest = {
        action: '',
        entityType: 'Task',
        entityId: 'card1',
        description: 'Description without action',
        cardId: 'card1',
        userId: 'user1'
      };

      service.createActivityLog(invalidRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs`);
      req.flush('Action is required', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server errors during creation', () => {
      service.createActivityLog(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs`);
      req.flush('Database error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized creation', () => {
      service.createActivityLog(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateActivityLog', () => {
    const logId = '1';
    const updateRequest = {
      description: 'Updated description'
    };

    it('should send PUT request to update activity log', () => {
      service.updateActivityLog(logId, updateRequest).subscribe(result => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(null);
    });

    it('should handle activity log not found', () => {
      service.updateActivityLog('nonexistent', updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/nonexistent`);
      req.flush('Activity log not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle validation errors', () => {
      service.updateActivityLog(logId, updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle unauthorized update', () => {
      service.updateActivityLog(logId, updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('deleteActivityLog', () => {
    const logId = '1';

    it('should send DELETE request to remove activity log', () => {
      service.deleteActivityLog(logId).subscribe(result => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle activity log not found', () => {
      service.deleteActivityLog('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/nonexistent`);
      req.flush('Activity log not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized deletion', () => {
      service.deleteActivityLog(logId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle server errors', () => {
      service.deleteActivityLog(logId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/${logId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getFilteredActivityLogs', () => {
    it('should call getActivityLogsByCard when cardId filter is provided', () => {
      const filters: ActivityLogFilters = {
        cardId: 'card1'
      };

      service.getFilteredActivityLogs(filters).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      // Should call the by-card endpoint, not the filtered endpoint
      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/card1?page=1&pageSize=20`
      );
      req.flush(mockActivityLogs);
    });

    it('should call getActivityLogsByUser when userId filter is provided', () => {
      const filters: ActivityLogFilters = {
        userId: 'user1'
      };

      service.getFilteredActivityLogs(filters).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      // Should call the by-user endpoint
      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/by-user/user1`);
      req.flush(mockActivityLogs);
    });

    it('should call getActivityLogs when no specific filters are provided', () => {
      const filters: ActivityLogFilters = {};

      service.getFilteredActivityLogs(filters, 2, 10).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      // Should call the regular paginated endpoint
      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=2&pageSize=10`
      );
      req.flush(mockActivityLogs);
    });

    it('should prefer cardId over userId when both are provided', () => {
      const filters: ActivityLogFilters = {
        cardId: 'card1',
        userId: 'user1'
      };

      service.getFilteredActivityLogs(filters).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      // Should call the by-card endpoint, not by-user
      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/card1?page=1&pageSize=20`
      );
      req.flush(mockActivityLogs);
    });

    it('should handle custom pagination with filters', () => {
      const filters: ActivityLogFilters = {
        cardId: 'card1'
      };

      service.getFilteredActivityLogs(filters, 3, 5).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/card1?page=3&pageSize=5`
      );
      req.flush(mockActivityLogs);
    });
  });

  describe('Pagination Edge Cases', () => {
    it('should handle zero page number', () => {
      service.getActivityLogs(0, 20).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=0&pageSize=20`
      );
      req.flush(mockActivityLogs);
    });

    it('should handle negative page number', () => {
      service.getActivityLogs(-1, 20).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=-1&pageSize=20`
      );
      req.flush(mockActivityLogs);
    });

    it('should handle very large page size', () => {
      service.getActivityLogs(1, 1000).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=1000`
      );
      req.flush(mockActivityLogs);
    });

    it('should handle zero page size', () => {
      service.getActivityLogs(1, 0).subscribe(logs => {
        expect(logs).toEqual(mockActivityLogs);
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=0`
      );
      req.flush(mockActivityLogs);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete activity log workflow: create -> get -> update -> delete', () => {
      const createRequest = {
        action: 'Task Created',
        entityType: 'Task',
        entityId: 'card1',
        description: 'New task created',
        cardId: 'card1',
        userId: 'user1'
      };

      // Step 1: Create activity log
      service.createActivityLog(createRequest).subscribe(log => {
        expect(log.action).toBe('Task Created');
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/activitylogs`);
      expect(req.request.method).toBe('POST');
      req.flush(mockActivityLog);

      // Step 2: Get activity log by ID
      service.getActivityLogById('1').subscribe(log => {
        expect(log).toEqual(mockActivityLog);
      });

      req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/1`);
      req.flush(mockActivityLog);

      // Step 3: Update activity log
      const updateRequest = { description: 'Updated description' };
      service.updateActivityLog('1', updateRequest).subscribe();

      req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(null);

      // Step 4: Delete activity log
      service.deleteActivityLog('1').subscribe();

      req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle filtering workflow', () => {
      // Step 1: Get all activity logs
      service.getActivityLogs().subscribe(logs => {
        expect(logs.length).toBe(2);
      });

      let req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      req.flush(mockActivityLogs);

      // Step 2: Filter by card
      service.getActivityLogsByCard('card1').subscribe(logs => {
        expect(logs.length).toBe(2);
      });

      req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs/by-card/card1?page=1&pageSize=20`
      );
      req.flush(mockActivityLogs);

      // Step 3: Filter by user
      service.getActivityLogsByUser('user1').subscribe(logs => {
        expect(logs.length).toBe(1);
      });

      req = httpMock.expectOne(`${environment.apiUrl}/activitylogs/by-user/user1`);
      req.flush([mockActivityLog]);
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors', () => {
      service.getActivityLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      service.createActivityLog({
        action: 'Test',
        entityType: 'Task',
        entityId: 'card1',
        description: 'Test',
        cardId: 'card1',
        userId: 'user1'
      }).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(408);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/activitylogs`);
      req.flush('Request timeout', { status: 408, statusText: 'Request Timeout' });
    });

    it('should handle rate limiting errors', () => {
      service.getActivityLogs().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(429);
        }
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/activitylogs?page=1&pageSize=20`
      );
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    });
  });
});