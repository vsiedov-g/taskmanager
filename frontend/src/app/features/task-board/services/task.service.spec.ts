import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService, CreateTaskRequest, UpdateTaskRequest, MoveTaskRequest } from './task.service';
import { Task, TaskStatus, TaskPriority } from '../models/task.model';
import { environment } from '../../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    dueDate: '2024-12-31T00:00:00.000Z',
    position: 1,
    assigneeId: 'user1',
    assigneeName: 'John Doe',
    listId: 'list1',
    projectId: 'project1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockTasks: Task[] = [
    mockTask,
    {
      ...mockTask,
      id: '2',
      title: 'Second Task',
      status: TaskStatus.InProgress,
      priority: TaskPriority.High
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
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
      expect(service['baseUrl']).toBe(`${environment.apiUrl}/cards`);
    });
  });

  describe('getTasks', () => {
    it('should send GET request to cards endpoint', () => {
      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });

    it('should return empty array on error', () => {
      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle empty response', () => {
      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.flush([]);
    });

    it('should handle server error gracefully', () => {
      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getTasksByStatus', () => {
    beforeEach(() => {
      // Mock getTasks call that getTasksByStatus depends on
      service.getTasks = jasmine.createSpy('getTasks').and.returnValue(
        new Promise(resolve => resolve(mockTasks)) as any
      );
    });

    it('should filter tasks by Todo status', () => {
      const todoTasks = mockTasks.filter(task => task.status === TaskStatus.Todo);
      
      service.getTasks = jasmine.createSpy('getTasks').and.returnValue({
        pipe: jasmine.createSpy('pipe').and.returnValue({
          subscribe: (callback: any) => callback(todoTasks)
        })
      }) as any;

      service.getTasksByStatus(TaskStatus.Todo).subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].status).toBe(TaskStatus.Todo);
      });
    });

    it('should filter tasks by InProgress status', () => {
      const inProgressTasks = mockTasks.filter(task => task.status === TaskStatus.InProgress);
      
      service.getTasks = jasmine.createSpy('getTasks').and.returnValue({
        pipe: jasmine.createSpy('pipe').and.returnValue({
          subscribe: (callback: any) => callback(inProgressTasks)
        })
      }) as any;

      service.getTasksByStatus(TaskStatus.InProgress).subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].status).toBe(TaskStatus.InProgress);
      });
    });

    it('should return empty array for status with no tasks', () => {
      service.getTasks = jasmine.createSpy('getTasks').and.returnValue({
        pipe: jasmine.createSpy('pipe').and.returnValue({
          subscribe: (callback: any) => callback([])
        })
      }) as any;

      service.getTasksByStatus(TaskStatus.Done).subscribe(tasks => {
        expect(tasks).toEqual([]);
      });
    });
  });

  describe('getTasksByListId', () => {
    const listId = 'list1';

    it('should send GET request to by-list endpoint', () => {
      const listTasks = [mockTask];

      service.getTasksByListId(listId).subscribe(tasks => {
        expect(tasks).toEqual(listTasks);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/by-list/${listId}`);
      expect(req.request.method).toBe('GET');
      req.flush(listTasks);
    });

    it('should handle empty list', () => {
      service.getTasksByListId(listId).subscribe(tasks => {
        expect(tasks).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/by-list/${listId}`);
      req.flush([]);
    });

    it('should handle non-existent list', () => {
      service.getTasksByListId('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/by-list/nonexistent`);
      req.flush('List not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createTask', () => {
    const createRequest: CreateTaskRequest = {
      title: 'New Task',
      description: 'New task description',
      status: TaskStatus.Todo,
      priority: TaskPriority.Medium,
      dueDate: '2024-12-31T00:00:00.000Z',
      position: 1,
      assigneeId: 'user1',
      listId: 'list1',
      projectId: 'project1'
    };

    it('should send POST request to create task', () => {
      service.createTask(createRequest).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockTask);
    });

    it('should handle minimal task creation', () => {
      const minimalRequest: CreateTaskRequest = {
        title: 'Minimal Task',
        status: TaskStatus.Todo,
        priority: TaskPriority.Low,
        position: 1,
        listId: 'list1'
      };

      const minimalTask = {
        ...mockTask,
        title: 'Minimal Task',
        description: undefined,
        priority: TaskPriority.Low
      };

      service.createTask(minimalRequest).subscribe(task => {
        expect(task.title).toBe('Minimal Task');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.flush(minimalTask);
    });

    it('should handle validation errors', () => {
      const invalidRequest: CreateTaskRequest = {
        title: '',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        position: 1,
        listId: 'list1'
      };

      service.createTask(invalidRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.flush('Title is required', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('updateTask', () => {
    const updateRequest: UpdateTaskRequest = {
      title: 'Updated Task',
      description: 'Updated description',
      status: TaskStatus.InProgress,
      priority: TaskPriority.High,
      position: 2,
      listId: 'list1'
    };

    it('should send PUT request to update task', () => {
      const updatedTask = { ...mockTask, ...updateRequest };

      service.updateTask('1', updateRequest).subscribe(task => {
        expect(task).toEqual(updatedTask);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(updatedTask);
    });

    it('should handle non-existent task', () => {
      service.updateTask('nonexistent', updateRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/nonexistent`);
      req.flush('Task not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle partial updates', () => {
      const partialUpdate: Partial<UpdateTaskRequest> = {
        title: 'Partially Updated Task'
      };

      service.updateTask('1', partialUpdate as UpdateTaskRequest).subscribe(task => {
        expect(task.title).toBe('Partially Updated Task');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      req.flush({ ...mockTask, title: 'Partially Updated Task' });
    });
  });

  describe('moveTask', () => {
    const moveRequest: MoveTaskRequest = {
      listId: 'list2',
      position: 3
    };

    it('should send PUT request to move task', () => {
      service.moveTask('1', moveRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1/move`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(moveRequest);
      req.flush(null);
    });

    it('should handle move to same position', () => {
      const samePositionMove: MoveTaskRequest = {
        listId: 'list1', // Same list
        position: 1       // Same position
      };

      service.moveTask('1', samePositionMove).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1/move`);
      req.flush(null);
    });

    it('should handle invalid move', () => {
      service.moveTask('1', moveRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1/move`);
      req.flush('Invalid move', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteTask', () => {
    it('should send DELETE request', () => {
      service.deleteTask('1').subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle non-existent task deletion', () => {
      service.deleteTask('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/nonexistent`);
      req.flush('Task not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle successful deletion', () => {
      let completed = false;

      service.deleteTask('1').subscribe({
        complete: () => {
          completed = true;
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      req.flush(null);

      expect(completed).toBe(true);
    });
  });

  describe('updateTaskStatus', () => {
    beforeEach(() => {
      // Mock getTasks for updateTaskStatus dependency
      service.getTasks = jasmine.createSpy('getTasks').and.returnValue({
        pipe: jasmine.createSpy('pipe').and.returnValue({
          subscribe: (callback: any) => callback(mockTasks)
        })
      }) as any;
    });

    it('should update task status while preserving other fields', () => {
      const updatedTask = { ...mockTask, status: TaskStatus.InProgress };

      service.updateTaskStatus('1', TaskStatus.InProgress).subscribe(task => {
        expect(task.status).toBe(TaskStatus.InProgress);
        expect(task.title).toBe(mockTask.title); // Preserved
      });

      // Should call getTasks first
      expect(service.getTasks).toHaveBeenCalled();

      // Then call updateTask
      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.status).toBe(TaskStatus.InProgress);
      expect(req.request.body.title).toBe(mockTask.title);
      req.flush(updatedTask);
    });

    it('should handle task not found during status update', () => {
      service.getTasks = jasmine.createSpy('getTasks').and.returnValue({
        pipe: jasmine.createSpy('pipe').and.returnValue({
          subscribe: (callback: any) => callback([]) // Empty tasks array
        })
      }) as any;

      service.updateTaskStatus('nonexistent', TaskStatus.Done).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.message).toBe('Task not found');
        }
      });
    });
  });

  describe('Priority Utility Methods', () => {
    describe('getPriorityClass', () => {
      it('should return correct class for Low priority', () => {
        expect(service.getPriorityClass(TaskPriority.Low)).toBe('bg-gray-100 text-gray-600');
      });

      it('should return correct class for Medium priority', () => {
        expect(service.getPriorityClass(TaskPriority.Medium)).toBe('bg-blue-100 text-blue-600');
      });

      it('should return correct class for High priority', () => {
        expect(service.getPriorityClass(TaskPriority.High)).toBe('bg-orange-100 text-orange-600');
      });

      it('should return correct class for Critical priority', () => {
        expect(service.getPriorityClass(TaskPriority.Critical)).toBe('bg-red-100 text-red-600');
      });

      it('should return default class for unknown priority', () => {
        expect(service.getPriorityClass(99 as TaskPriority)).toBe('bg-gray-100 text-gray-600');
      });
    });

    describe('getPriorityDotClass', () => {
      it('should return correct dot class for Low priority', () => {
        expect(service.getPriorityDotClass(TaskPriority.Low)).toBe('bg-gray-400');
      });

      it('should return correct dot class for Medium priority', () => {
        expect(service.getPriorityDotClass(TaskPriority.Medium)).toBe('bg-blue-400');
      });

      it('should return correct dot class for High priority', () => {
        expect(service.getPriorityDotClass(TaskPriority.High)).toBe('bg-orange-400');
      });

      it('should return correct dot class for Critical priority', () => {
        expect(service.getPriorityDotClass(TaskPriority.Critical)).toBe('bg-red-400');
      });

      it('should return default dot class for unknown priority', () => {
        expect(service.getPriorityDotClass(99 as TaskPriority)).toBe('bg-gray-400');
      });
    });

    describe('getPriorityDisplayName', () => {
      it('should return correct display name for Low priority', () => {
        expect(service.getPriorityDisplayName(TaskPriority.Low)).toBe('Low');
      });

      it('should return correct display name for Medium priority', () => {
        expect(service.getPriorityDisplayName(TaskPriority.Medium)).toBe('Medium');
      });

      it('should return correct display name for High priority', () => {
        expect(service.getPriorityDisplayName(TaskPriority.High)).toBe('High');
      });

      it('should return correct display name for Critical priority', () => {
        expect(service.getPriorityDisplayName(TaskPriority.Critical)).toBe('Critical');
      });

      it('should return "Unknown" for invalid priority', () => {
        expect(service.getPriorityDisplayName(99 as TaskPriority)).toBe('Unknown');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete task lifecycle', () => {
      // Create task
      const createRequest: CreateTaskRequest = {
        title: 'Lifecycle Task',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        position: 1,
        listId: 'list1'
      };

      service.createTask(createRequest).subscribe(task => {
        expect(task.title).toBe('Lifecycle Task');
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      const createdTask = { ...mockTask, title: 'Lifecycle Task' };
      req.flush(createdTask);

      // Update task
      const updateRequest: UpdateTaskRequest = {
        title: 'Updated Lifecycle Task',
        status: TaskStatus.InProgress,
        priority: TaskPriority.High,
        position: 1,
        listId: 'list1'
      };

      service.updateTask('1', updateRequest).subscribe(task => {
        expect(task.title).toBe('Updated Lifecycle Task');
        expect(task.status).toBe(TaskStatus.InProgress);
      });

      req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      req.flush({ ...createdTask, ...updateRequest });

      // Delete task
      service.deleteTask('1').subscribe();

      req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      req.flush(null);
    });

    it('should handle error recovery', () => {
      // First call fails
      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual([]); // Should return empty array on error
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.error(new ErrorEvent('Network error'));

      // Second call succeeds
      service.getTasks().subscribe(tasks => {
        expect(tasks).toEqual(mockTasks);
      });

      req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.flush(mockTasks);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      service.createTask({
        title: 'Test',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        position: 1,
        listId: 'list1'
      }).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should propagate server errors', () => {
      service.updateTask('1', {
        title: 'Test',
        status: TaskStatus.Todo,
        priority: TaskPriority.Medium,
        position: 1,
        listId: 'list1'
      }).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cards/1`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});