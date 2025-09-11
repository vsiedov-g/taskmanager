import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskCardComponent } from './task-card.component';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { List } from '../../models/list.model';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockLists: List[] = [
    {
      id: 'list1',
      name: 'To Do',
      position: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 0
    },
    {
      id: 'list2',
      name: 'In Progress',
      position: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 0
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getPriorityClass',
      'getPriorityDotClass',
      'getPriorityDisplayName'
    ]);

    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;

    // Set up default spy returns
    taskService.getPriorityClass.and.returnValue('priority-medium');
    taskService.getPriorityDotClass.and.returnValue('dot-medium');
    taskService.getPriorityDisplayName.and.returnValue('Medium');

    // Set required inputs
    component.task = mockTask;
    component.availableStatuses = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];
    component.availableLists = mockLists;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.TaskStatus).toBe(TaskStatus);
      expect(component.isDragging).toBe(false);
    });

    it('should require task input', () => {
      expect(component.task).toBe(mockTask);
    });

    it('should have default empty arrays for optional inputs', () => {
      const newComponent = new TaskCardComponent();
      expect(newComponent.availableStatuses).toEqual([]);
      expect(newComponent.availableLists).toEqual([]);
    });
  });

  describe('Priority Methods', () => {
    it('should call taskService.getPriorityClass', () => {
      const result = component.getPriorityClass(TaskPriority.High);
      
      expect(taskService.getPriorityClass).toHaveBeenCalledWith(TaskPriority.High);
      expect(result).toBe('priority-medium');
    });

    it('should call taskService.getPriorityDotClass', () => {
      const result = component.getPriorityDotClass(TaskPriority.Low);
      
      expect(taskService.getPriorityDotClass).toHaveBeenCalledWith(TaskPriority.Low);
      expect(result).toBe('dot-medium');
    });

    it('should call taskService.getPriorityDisplayName', () => {
      const result = component.getPriorityDisplayName(TaskPriority.Critical);
      
      expect(taskService.getPriorityDisplayName).toHaveBeenCalledWith(TaskPriority.Critical);
      expect(result).toBe('Medium');
    });
  });

  describe('Status Change', () => {
    let selectElement: HTMLSelectElement;

    beforeEach(() => {
      selectElement = document.createElement('select');
    });

    it('should emit statusChanged when status changes', () => {
      spyOn(component.statusChanged, 'emit');
      selectElement.value = TaskStatus.InProgress.toString();
      
      const event = { target: selectElement } as any;
      component.onStatusChange(event);
      
      expect(component.statusChanged.emit).toHaveBeenCalledWith({
        taskId: '1',
        newStatus: TaskStatus.InProgress
      });
    });

    it('should not emit statusChanged when status is same', () => {
      spyOn(component.statusChanged, 'emit');
      selectElement.value = TaskStatus.Todo.toString(); // Same as current status
      
      const event = { target: selectElement } as any;
      component.onStatusChange(event);
      
      expect(component.statusChanged.emit).not.toHaveBeenCalled();
    });

    it('should reset dropdown value after change', () => {
      selectElement.value = TaskStatus.InProgress.toString();
      
      const event = { target: selectElement } as any;
      component.onStatusChange(event);
      
      expect(selectElement.value).toBe('');
    });

    it('should handle invalid status values', () => {
      spyOn(component.statusChanged, 'emit');
      selectElement.value = 'invalid';
      
      const event = { target: selectElement } as any;
      component.onStatusChange(event);
      
      expect(component.statusChanged.emit).not.toHaveBeenCalled();
    });
  });

  describe('List Change', () => {
    let selectElement: HTMLSelectElement;

    beforeEach(() => {
      selectElement = document.createElement('select');
    });

    it('should emit listChanged when list changes', () => {
      spyOn(component.listChanged, 'emit');
      selectElement.value = 'list2';
      
      const event = { target: selectElement } as any;
      component.onListChange(event);
      
      expect(component.listChanged.emit).toHaveBeenCalledWith({
        taskId: '1',
        newListId: 'list2'
      });
    });

    it('should not emit listChanged when list is same', () => {
      spyOn(component.listChanged, 'emit');
      selectElement.value = 'list1'; // Same as current list
      
      const event = { target: selectElement } as any;
      component.onListChange(event);
      
      expect(component.listChanged.emit).not.toHaveBeenCalled();
    });

    it('should not emit listChanged when value is empty', () => {
      spyOn(component.listChanged, 'emit');
      selectElement.value = '';
      
      const event = { target: selectElement } as any;
      component.onListChange(event);
      
      expect(component.listChanged.emit).not.toHaveBeenCalled();
    });

    it('should reset dropdown value after change', () => {
      selectElement.value = 'list2';
      
      const event = { target: selectElement } as any;
      component.onListChange(event);
      
      expect(selectElement.value).toBe('');
    });
  });

  describe('Status Options', () => {
    it('should return statuses excluding current task status', () => {
      const options = component.getStatusOptions();
      
      expect(options).toEqual([TaskStatus.InProgress, TaskStatus.Done]);
      expect(options).not.toContain(TaskStatus.Todo);
    });

    it('should return empty array if no available statuses', () => {
      component.availableStatuses = [];
      
      const options = component.getStatusOptions();
      
      expect(options).toEqual([]);
    });

    it('should handle different current statuses', () => {
      component.task = { ...mockTask, status: TaskStatus.InProgress };
      
      const options = component.getStatusOptions();
      
      expect(options).toEqual([TaskStatus.Todo, TaskStatus.Done]);
      expect(options).not.toContain(TaskStatus.InProgress);
    });
  });

  describe('Status Display Names', () => {
    it('should return correct display name for Todo', () => {
      expect(component.getStatusDisplayName(TaskStatus.Todo)).toBe('To Do');
    });

    it('should return correct display name for InProgress', () => {
      expect(component.getStatusDisplayName(TaskStatus.InProgress)).toBe('In Progress');
    });

    it('should return correct display name for Done', () => {
      expect(component.getStatusDisplayName(TaskStatus.Done)).toBe('Done');
    });

    it('should return string representation for unknown status', () => {
      const unknownStatus = 999 as TaskStatus;
      expect(component.getStatusDisplayName(unknownStatus)).toBe('999');
    });
  });

  describe('Card Click', () => {
    it('should emit cardClicked when card is clicked', () => {
      spyOn(component.cardClicked, 'emit');
      
      const event = { target: document.createElement('div') } as any;
      component.onCardClick(event);
      
      expect(component.cardClicked.emit).toHaveBeenCalledWith(mockTask);
    });

    it('should not emit cardClicked when clicking on select element', () => {
      spyOn(component.cardClicked, 'emit');
      
      const selectElement = document.createElement('select');
      const event = { target: selectElement } as any;
      component.onCardClick(event);
      
      expect(component.cardClicked.emit).not.toHaveBeenCalled();
    });

    it('should not emit cardClicked when clicking inside select element', () => {
      spyOn(component.cardClicked, 'emit');
      
      const selectElement = document.createElement('select');
      const optionElement = document.createElement('option');
      selectElement.appendChild(optionElement);
      
      // Mock closest method
      optionElement.closest = jasmine.createSpy('closest').and.returnValue(selectElement);
      
      const event = { target: optionElement } as any;
      component.onCardClick(event);
      
      expect(component.cardClicked.emit).not.toHaveBeenCalled();
    });

    it('should not emit cardClicked when dragging', () => {
      spyOn(component.cardClicked, 'emit');
      component.isDragging = true;
      
      const event = { target: document.createElement('div') } as any;
      component.onCardClick(event);
      
      expect(component.cardClicked.emit).not.toHaveBeenCalled();
    });
  });

  describe('Drag Operations', () => {
    let mockDataTransfer: jasmine.SpyObj<DataTransfer>;

    beforeEach(() => {
      mockDataTransfer = jasmine.createSpyObj('DataTransfer', ['setData'], {
        effectAllowed: ''
      });
    });

    describe('Drag Start', () => {
      it('should set isDragging to true', () => {
        const event = { dataTransfer: mockDataTransfer } as any;
        
        component.onDragStart(event);
        
        expect(component.isDragging).toBe(true);
      });

      it('should set drag data', () => {
        const event = { dataTransfer: mockDataTransfer } as any;
        
        component.onDragStart(event);
        
        expect(mockDataTransfer.effectAllowed).toBe('move');
        expect(mockDataTransfer.setData).toHaveBeenCalledWith(
          'text/plain',
          JSON.stringify({
            taskId: '1',
            fromListId: 'list1'
          })
        );
      });

      it('should emit dragStart event', () => {
        spyOn(component.dragStart, 'emit');
        const event = { dataTransfer: mockDataTransfer } as any;
        
        component.onDragStart(event);
        
        expect(component.dragStart.emit).toHaveBeenCalledWith({
          task: mockTask,
          event
        });
      });

      it('should handle missing dataTransfer', () => {
        const event = { dataTransfer: null } as any;
        
        expect(() => component.onDragStart(event)).not.toThrow();
        expect(component.isDragging).toBe(true);
      });
    });

    describe('Drag End', () => {
      it('should set isDragging to false', () => {
        component.isDragging = true;
        const event = {} as any;
        
        component.onDragEnd(event);
        
        expect(component.isDragging).toBe(false);
      });

      it('should emit dragEnd event', () => {
        spyOn(component.dragEnd, 'emit');
        const event = {} as any;
        
        component.onDragEnd(event);
        
        expect(component.dragEnd.emit).toHaveBeenCalledWith({
          task: mockTask,
          event
        });
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format date correctly', () => {
      const result = component.formatDueDate('2024-12-31T00:00:00.000Z');
      
      expect(result).toMatch(/\w{3}, \d{1,2} \w{3}/); // Format: "Tue, 31 Dec"
    });

    it('should return empty string for undefined date', () => {
      const result = component.formatDueDate(undefined);
      
      expect(result).toBe('');
    });

    it('should return empty string for null date', () => {
      const result = component.formatDueDate(null as any);
      
      expect(result).toBe('');
    });

    it('should return original string for invalid date', () => {
      const invalidDate = 'invalid-date';
      const result = component.formatDueDate(invalidDate);
      
      expect(result).toBe(invalidDate);
    });

    it('should handle different date formats', () => {
      const dateString = '2024-06-15';
      const result = component.formatDueDate(dateString);
      
      expect(result).toBeTruthy();
      expect(result).not.toBe('');
    });
  });

  describe('Event Emitters', () => {
    it('should have all required event emitters', () => {
      expect(component.statusChanged).toBeDefined();
      expect(component.listChanged).toBeDefined();
      expect(component.cardClicked).toBeDefined();
      expect(component.dragStart).toBeDefined();
      expect(component.dragEnd).toBeDefined();
    });

    it('should emit events with correct types', () => {
      spyOn(component.statusChanged, 'emit');
      spyOn(component.listChanged, 'emit');
      spyOn(component.cardClicked, 'emit');
      spyOn(component.dragStart, 'emit');
      spyOn(component.dragEnd, 'emit');

      const selectElement = document.createElement('select');
      selectElement.value = TaskStatus.InProgress.toString();
      component.onStatusChange({ target: selectElement } as any);

      selectElement.value = 'list2';
      component.onListChange({ target: selectElement } as any);

      component.onCardClick({ target: document.createElement('div') } as any);

      const dragEvent = { dataTransfer: jasmine.createSpyObj('DataTransfer', ['setData']) } as any;
      component.onDragStart(dragEvent);
      component.onDragEnd(dragEvent);

      expect(component.statusChanged.emit).toHaveBeenCalled();
      expect(component.listChanged.emit).toHaveBeenCalled();
      expect(component.cardClicked.emit).toHaveBeenCalled();
      expect(component.dragStart.emit).toHaveBeenCalled();
      expect(component.dragEnd.emit).toHaveBeenCalled();
    });
  });

  describe('Template Integration', () => {
    it('should display task title', () => {
      const titleElement = fixture.debugElement.query(By.css('.task-title'));
      if (titleElement) {
        expect(titleElement.nativeElement.textContent).toContain('Test Task');
      }
    });

    it('should be draggable', () => {
      const cardElement = fixture.debugElement.query(By.css('[draggable]'));
      expect(cardElement?.nativeElement.draggable).toBe(true);
    });
  });

  describe('Input Validation', () => {
    it('should handle task with minimal properties', () => {
      const minimalTask: Task = {
        id: '2',
        title: 'Minimal Task',
        description: '',
        status: TaskStatus.Todo,
        priority: TaskPriority.Low,
        dueDate: undefined,
        position: 1,
        assigneeId: undefined,
        listId: 'list1',
        projectId: 'project1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      component.task = minimalTask;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty lists array', () => {
      component.availableLists = [];
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle empty statuses array', () => {
      component.availableStatuses = [];
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.getStatusOptions()).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle drag operations without data transfer', () => {
      const event = { dataTransfer: undefined } as any;
      
      expect(() => component.onDragStart(event)).not.toThrow();
    });

    it('should handle select elements without closest method', () => {
      const element = { tagName: 'DIV' } as any;
      const event = { target: element } as any;
      
      expect(() => component.onCardClick(event)).not.toThrow();
    });

    it('should handle date formatting with edge case dates', () => {
      expect(component.formatDueDate('1970-01-01T00:00:00.000Z')).toBeTruthy();
      expect(component.formatDueDate('2100-12-31T23:59:59.999Z')).toBeTruthy();
    });
  });
});