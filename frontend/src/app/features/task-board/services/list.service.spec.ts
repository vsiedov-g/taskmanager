import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ListService } from './list.service';
import { List, CreateListRequest, UpdateListRequest, ListColumn } from '../models/list.model';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { environment } from '../../../../environments/environment';

describe('ListService', () => {
  let service: ListService;
  let httpMock: HttpTestingController;

  const mockList: List = {
    id: '1',
    name: 'Test List',
    position: 0,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    taskCount: 0
  };

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: TaskStatus.Todo,
      priority: TaskPriority.High,
      dueDate: '2024-01-15T10:00:00Z',
      position: 0,
      assigneeId: 'user1',
      listId: '1',
      projectId: 'project1',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: TaskStatus.InProgress,
      priority: TaskPriority.Medium,
      dueDate: '2024-01-20T10:00:00Z',
      position: 1,
      assigneeId: 'user2',
      listId: '1',
      projectId: 'project1',
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-12T10:00:00Z'
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      status: TaskStatus.Done,
      priority: TaskPriority.Low,
      dueDate: undefined,
      position: 2,
      assigneeId: 'user1',
      listId: '2',
      projectId: 'project1',
      createdAt: '2024-01-08T10:00:00Z',
      updatedAt: '2024-01-08T10:00:00Z'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ListService]
    });
    service = TestBed.inject(ListService);
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
      expect(service['baseUrl']).toBe(`${environment.apiUrl}/lists`);
    });
  });

  describe('getLists', () => {
    const boardId = 'board1';
    const mockLists: List[] = [
      { ...mockList, position: 1 },
      { ...mockList, id: '2', name: 'List 2', position: 0 }
    ];

    it('should send GET request to lists endpoint with boardId', () => {
      service.getLists(boardId).subscribe(lists => {
        expect(lists.length).toBe(2);
        // Should be sorted by position
        expect(lists[0].position).toBe(0);
        expect(lists[1].position).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockLists);
    });

    it('should sort lists by position', () => {
      const unsortedLists: List[] = [
        { ...mockList, position: 3 },
        { ...mockList, id: '2', position: 1 },
        { ...mockList, id: '3', position: 2 }
      ];

      service.getLists(boardId).subscribe(lists => {
        expect(lists[0].position).toBe(1);
        expect(lists[1].position).toBe(2);
        expect(lists[2].position).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush(unsortedLists);
    });

    it('should handle empty lists array', () => {
      service.getLists(boardId).subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush([]);
    });

    it('should handle HTTP error and return empty array', () => {
      service.getLists(boardId).subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', () => {
      service.getLists(boardId).subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getListById', () => {
    const listId = '1';

    it('should send GET request to list by ID endpoint', () => {
      service.getListById(listId).subscribe(list => {
        expect(list).toEqual(mockList);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/${listId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should handle list not found', () => {
      service.getListById('nonexistent').subscribe(list => {
        expect(list).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/nonexistent`);
      req.flush('List not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error and return null', () => {
      service.getListById(listId).subscribe(list => {
        expect(list).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/${listId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error and return null', () => {
      service.getListById(listId).subscribe(list => {
        expect(list).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/${listId}`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('createList', () => {
    const createRequest: CreateListRequest = {
      title: 'New List',
      position: 0,
      boardId: 'board1'
    };

    const expectedRequest = {
      title: 'New List',
      position: 0,
      boardId: 'board1'
    };

    it('should send POST request to create list', () => {
      service.createList(createRequest).subscribe(list => {
        expect(list).toEqual(mockList);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedRequest);
      req.flush(mockList);
    });

    it('should handle validation errors', () => {
      const invalidRequest: CreateListRequest = {
        title: '',
        position: 0,
        boardId: 'board1'
      };

      service.createList(invalidRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists`);
      req.flush('Title is required', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server errors', () => {
      service.createList(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists`);
      req.flush('Database error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized creation', () => {
      service.createList(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('updateList', () => {
    const updateRequest: UpdateListRequest = {
      id: '1',
      name: 'Updated List',
      position: 1
    };

    const expectedRequest = {
      title: 'Updated List',
      position: 1
    };

    it('should send PUT request to update list', () => {
      service.updateList(updateRequest).subscribe(list => {
        expect(list).toEqual(mockList);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedRequest);
      req.flush(mockList);
    });

    it('should handle missing name and position with defaults', () => {
      const minimalRequest: UpdateListRequest = {
        id: '1'
      };

      const expectedMinimalRequest = {
        title: '',
        position: 0
      };

      service.updateList(minimalRequest).subscribe(list => {
        expect(list).toEqual(mockList);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      expect(req.request.body).toEqual(expectedMinimalRequest);
      req.flush(mockList);
    });

    it('should handle list not found', () => {
      service.updateList(updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      req.flush('List not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle validation errors', () => {
      service.updateList(updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      req.flush('Invalid data', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteList', () => {
    const listId = '1';

    it('should send DELETE request to remove list', () => {
      service.deleteList(listId).subscribe(result => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/${listId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle list not found', () => {
      service.deleteList('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/nonexistent`);
      req.flush('List not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle unauthorized deletion', () => {
      service.deleteList(listId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/${listId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });

    it('should handle server errors', () => {
      service.deleteList(listId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/${listId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('reorderLists', () => {
    const listIds = ['3', '1', '2'];
    const reorderedLists: List[] = [
      { ...mockList, id: '3', position: 0 },
      { ...mockList, id: '1', position: 1 },
      { ...mockList, id: '2', position: 2 }
    ];

    it('should send POST request to reorder lists', () => {
      service.reorderLists(listIds).subscribe(lists => {
        expect(lists).toEqual(reorderedLists);
        expect(lists.length).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/reorder`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ listIds: listIds });
      req.flush(reorderedLists);
    });

    it('should handle empty list IDs array', () => {
      service.reorderLists([]).subscribe(lists => {
        expect(lists).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/reorder`);
      expect(req.request.body).toEqual({ listIds: [] });
      req.flush([]);
    });

    it('should handle invalid list IDs', () => {
      service.reorderLists(['invalid1', 'invalid2']).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/reorder`);
      req.flush('Invalid list IDs', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server errors during reordering', () => {
      service.reorderLists(listIds).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/reorder`);
      req.flush('Database error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getListColumns', () => {
    const boardId = 'board1';
    const mockLists: List[] = [
      { id: '1', name: 'To Do', position: 0, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 },
      { id: '2', name: 'In Progress', position: 1, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 }
    ];

    it('should create list columns with tasks', () => {
      service.getListColumns(mockTasks, boardId).subscribe(columns => {
        expect(columns.length).toBe(2);
        
        const todoColumn = columns.find(c => c.id === '1');
        expect(todoColumn).toBeDefined();
        expect(todoColumn!.name).toBe('To Do');
        expect(todoColumn!.taskCount).toBe(2); // Tasks 1 and 2 are in list 1
        expect(todoColumn!.tasks.length).toBe(2);
        
        const inProgressColumn = columns.find(c => c.id === '2');
        expect(inProgressColumn).toBeDefined();
        expect(inProgressColumn!.taskCount).toBe(1); // Task 3 is in list 2
        expect(inProgressColumn!.tasks.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush(mockLists);
    });

    it('should sort lists by position', () => {
      const unsortedLists: List[] = [
        { id: '2', name: 'In Progress', position: 1, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 },
        { id: '1', name: 'To Do', position: 0, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 }
      ];

      service.getListColumns(mockTasks, boardId).subscribe(columns => {
        expect(columns[0].id).toBe('1'); // Should be first due to position 0
        expect(columns[1].id).toBe('2'); // Should be second due to position 1
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush(unsortedLists);
    });

    it('should handle empty task list', () => {
      service.getListColumns([], boardId).subscribe(columns => {
        expect(columns.length).toBe(2);
        columns.forEach(column => {
          expect(column.taskCount).toBe(0);
          expect(column.tasks).toEqual([]);
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush(mockLists);
    });

    it('should handle empty lists', () => {
      service.getListColumns(mockTasks, boardId).subscribe(columns => {
        expect(columns).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush([]);
    });
  });

  describe('Task Sorting', () => {
    it('should sort tasks correctly by due date, priority, and creation date', () => {
      const testTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.Low,
          dueDate: '2024-01-15T10:00:00Z',
          position: 0,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          title: 'Task 2',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.High,
          dueDate: '2024-01-20T10:00:00Z',
          position: 1,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z'
        },
        {
          id: '3',
          title: 'Task 3',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.Medium,
          dueDate: undefined,
          position: 2,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-12T10:00:00Z',
          updatedAt: '2024-01-12T10:00:00Z'
        },
        {
          id: '4',
          title: 'Task 4',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.Critical,
          dueDate: undefined,
          position: 3,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-09T10:00:00Z',
          updatedAt: '2024-01-09T10:00:00Z'
        }
      ];

      const mockLists: List[] = [
        { id: '1', name: 'Test List', position: 0, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 }
      ];

      service.getListColumns(testTasks, 'board1').subscribe(columns => {
        const tasks = columns[0].tasks;
        
        // Task 2: Has due date (2024-01-20), should be first among tasks with due dates
        expect(tasks[0].id).toBe('2');
        
        // Task 1: Has due date (2024-01-15), should be second among tasks with due dates
        expect(tasks[1].id).toBe('1');
        
        // Among tasks without due dates, Task 4 has Critical priority, should come first
        expect(tasks[2].id).toBe('4');
        
        // Task 3: Medium priority, no due date, should be last
        expect(tasks[3].id).toBe('3');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=board1`);
      req.flush(mockLists);
    });

    it('should sort tasks with same due date by priority', () => {
      const testTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.Low,
          dueDate: '2024-01-15T10:00:00Z',
          position: 0,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          title: 'Task 2',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.High,
          dueDate: '2024-01-15T10:00:00Z',
          position: 1,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-08T10:00:00Z',
          updatedAt: '2024-01-08T10:00:00Z'
        }
      ];

      const mockLists: List[] = [
        { id: '1', name: 'Test List', position: 0, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 }
      ];

      service.getListColumns(testTasks, 'board1').subscribe(columns => {
        const tasks = columns[0].tasks;
        
        // Task 2 has High priority, should come before Task 1 with Low priority
        expect(tasks[0].id).toBe('2');
        expect(tasks[1].id).toBe('1');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=board1`);
      req.flush(mockLists);
    });

    it('should sort tasks with same priority by creation date', () => {
      const testTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.Medium,
          dueDate: undefined,
          position: 0,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          title: 'Task 2',
          description: '',
          status: TaskStatus.Todo,
          priority: TaskPriority.Medium,
          dueDate: undefined,
          position: 1,
          assigneeId: '',
          listId: '1',
          projectId: '',
          createdAt: '2024-01-12T10:00:00Z',
          updatedAt: '2024-01-12T10:00:00Z'
        }
      ];

      const mockLists: List[] = [
        { id: '1', name: 'Test List', position: 0, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 }
      ];

      service.getListColumns(testTasks, 'board1').subscribe(columns => {
        const tasks = columns[0].tasks;
        
        // Task 2 created later (2024-01-12), should come before Task 1 (2024-01-10)
        expect(tasks[0].id).toBe('2');
        expect(tasks[1].id).toBe('1');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=board1`);
      req.flush(mockLists);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete list workflow: create -> get -> update -> delete', () => {
      const boardId = 'board1';
      const createRequest: CreateListRequest = {
        title: 'New List',
        position: 0,
        boardId: boardId
      };

      // Step 1: Create list
      service.createList(createRequest).subscribe(list => {
        expect(list.name).toBe('New List');
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/lists`);
      expect(req.request.method).toBe('POST');
      req.flush(mockList);

      // Step 2: Get lists
      service.getLists(boardId).subscribe(lists => {
        expect(lists.length).toBe(1);
      });

      req = httpMock.expectOne(`${environment.apiUrl}/lists?boardId=${boardId}`);
      req.flush([mockList]);

      // Step 3: Update list
      const updateRequest: UpdateListRequest = {
        id: '1',
        name: 'Updated List',
        position: 0
      };

      service.updateList(updateRequest).subscribe(list => {
        expect(list).toEqual(mockList);
      });

      req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockList);

      // Step 4: Delete list
      service.deleteList('1').subscribe();

      req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle list reordering workflow', () => {
      const listIds = ['2', '1', '3'];
      const reorderedLists: List[] = [
        { id: '2', name: 'List 2', position: 0, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 },
        { id: '1', name: 'List 1', position: 1, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 },
        { id: '3', name: 'List 3', position: 2, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z', taskCount: 0 }
      ];

      service.reorderLists(listIds).subscribe(lists => {
        expect(lists[0].id).toBe('2');
        expect(lists[1].id).toBe('1');
        expect(lists[2].id).toBe('3');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/reorder`);
      expect(req.request.body).toEqual({ listIds: listIds });
      req.flush(reorderedLists);
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors', () => {
      service.createList({
        title: 'Test',
        position: 0,
        boardId: 'board1'
      }).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      service.updateList({
        id: '1',
        name: 'Test'
      }).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(408);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/lists/1`);
      req.flush('Request timeout', { status: 408, statusText: 'Request Timeout' });
    });
  });
});