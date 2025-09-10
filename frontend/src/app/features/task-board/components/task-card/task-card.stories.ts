import type { Meta, StoryObj } from '@storybook/angular';
import { TaskCardComponent } from './task-card.component';
import { Task, TaskStatus, TaskPriority } from '../../models/task.model';
import { List } from '../../models/list.model';
import { TaskService } from '../../services/task.service';

// Mock TaskService
class MockTaskService {
  getPriorityClass(priority: TaskPriority): string {
    const classes = {
      [TaskPriority.Low]: 'bg-gray-100 text-gray-800',
      [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800',
      [TaskPriority.High]: 'bg-orange-100 text-orange-800',
      [TaskPriority.Critical]: 'bg-red-100 text-red-800',
    };
    return classes[priority] || classes[TaskPriority.Low];
  }

  getPriorityDotClass(priority: TaskPriority): string {
    const classes = {
      [TaskPriority.Low]: 'bg-gray-400',
      [TaskPriority.Medium]: 'bg-yellow-400',
      [TaskPriority.High]: 'bg-orange-400',
      [TaskPriority.Critical]: 'bg-red-400',
    };
    return classes[priority] || classes[TaskPriority.Low];
  }

  getPriorityDisplayName(priority: TaskPriority): string {
    const names = {
      [TaskPriority.Low]: 'Low',
      [TaskPriority.Medium]: 'Medium',
      [TaskPriority.High]: 'High',
      [TaskPriority.Critical]: 'Critical',
    };
    return names[priority] || 'Unknown';
  }
}

const mockTask: Task = {
  id: '1',
  title: 'Implement user authentication',
  description: 'Add login and signup functionality with proper validation',
  status: TaskStatus.InProgress,
  priority: TaskPriority.High,
  dueDate: '2024-12-31',
  assigneeId: 'user-1',
  assigneeName: 'John Doe',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-16T14:30:00Z',
  projectId: 'project-1',
  listId: 'list-1',
  position: 1,
};

const mockLists: List[] = [
  { id: 'list-1', name: 'Backlog', position: 0, taskCount: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'list-2', name: 'In Progress', position: 1, taskCount: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'list-3', name: 'Done', position: 2, taskCount: 0, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

const meta: Meta<TaskCardComponent> = {
  title: 'Features/TaskCard',
  component: TaskCardComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A task card component displaying task information with drag and drop functionality, status management, and priority indicators.',
      },
    },
  },
  decorators: [
    (story) => ({
      template: `<div class="w-80 p-4 bg-gray-50">${story()}</div>`,
      moduleMetadata: {
        imports: [TaskCardComponent],
        providers: [
          { provide: TaskService, useClass: MockTaskService },
        ],
      },
    }),
  ],
  argTypes: {
    task: {
      description: 'The task object to display',
    },
    availableStatuses: {
      description: 'Available statuses for status change dropdown',
    },
    availableLists: {
      description: 'Available lists for moving tasks',
    },
    statusChanged: {
      action: 'statusChanged',
      description: 'Event emitted when task status changes',
    },
    listChanged: {
      action: 'listChanged',
      description: 'Event emitted when task is moved to different list',
    },
    cardClicked: {
      action: 'cardClicked',
      description: 'Event emitted when task card is clicked',
    },
    dragStart: {
      action: 'dragStart',
      description: 'Event emitted when drag operation starts',
    },
    dragEnd: {
      action: 'dragEnd',
      description: 'Event emitted when drag operation ends',
    },
  },
  args: {
    task: mockTask,
    availableStatuses: [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done],
    availableLists: mockLists,
  },
};

export default meta;
type Story = StoryObj<TaskCardComponent>;

export const Default: Story = {
  args: {
    task: mockTask,
  },
};

