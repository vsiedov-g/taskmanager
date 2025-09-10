import type { Meta, StoryObj } from '@storybook/angular';
import { CardEditModalComponent } from './card-edit-modal.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { TaskPriority, TaskStatus } from '../../models/task.model';
import { List } from '../../models/list.model';
import { BoardMember, BoardRole } from '../../../../core/models/board.model';

// Mock data
const mockTask = {
  id: '1',
  title: 'Implement user authentication',
  description: 'Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.',
  dueDate: '2024-12-31',
  priority: TaskPriority.High,
  status: TaskStatus.InProgress,
  listId: '2',
  assigneeId: '1',
  position: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockLists: List[] = [
  { id: '1', name: 'To Do', position: 0, createdAt: '2024-12-01T10:00:00Z', updatedAt: '2024-12-01T10:00:00Z', taskCount: 3 },
  { id: '2', name: 'In Progress', position: 1, createdAt: '2024-12-02T10:00:00Z', updatedAt: '2024-12-02T10:00:00Z', taskCount: 2 },
  { id: '3', name: 'Done', position: 2, createdAt: '2024-12-03T10:00:00Z', updatedAt: '2024-12-03T10:00:00Z', taskCount: 5 },
];

const mockBoardMembers: BoardMember[] = [
  { id: '1', userId: '1', userName: 'John Doe', role: BoardRole.Admin, joinedAt: '2024-11-01T10:00:00Z' },
  { id: '2', userId: '2', userName: 'Jane Smith', role: BoardRole.Member, joinedAt: '2024-11-15T10:00:00Z' },
  { id: '3', userId: '3', userName: 'Mike Johnson', role: BoardRole.Member, joinedAt: '2024-11-20T10:00:00Z' },
];

const mockActivityLogs = [
  {
    id: '1',
    taskId: '1',
    action: 'Task Created',
    details: 'Task was created by John Doe',
    performedBy: 'John Doe',
    createdAt: '2024-12-25T10:00:00Z',
  },
  {
    id: '2',
    taskId: '1',
    action: 'Status Changed',
    details: 'Status changed from To Do to In Progress',
    performedBy: 'Jane Smith',
    createdAt: '2024-12-26T14:30:00Z',
  },
  {
    id: '3',
    taskId: '1',
    action: 'Assignee Changed',
    details: 'Assigned to John Doe',
    performedBy: 'John Doe',
    createdAt: '2024-12-27T09:15:00Z',
  },
];

const mockInitialState = {
  taskBoard: {
    lists: mockLists,
    selectedTask: mockTask,
    isUpdatingTask: false,
    error: null,
    cardActivityLogs: mockActivityLogs,
    hasMoreLogs: true,
    isLoadingMoreLogs: false,
  },
};

const meta: Meta<CardEditModalComponent> = {
  title: 'Modals/Card Edit Modal',
  component: CardEditModalComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for editing existing task cards with view/edit modes and activity tracking.',
      },
    },
  },
  decorators: [
    (story) => ({
      ...story,
      providers: [
        provideMockStore({ initialState: mockInitialState }),
        FormBuilder,
        {
          provide: 'TaskService',
          useValue: {
            getPriorityDisplayName: (priority: TaskPriority) => {
              switch (priority) {
                case TaskPriority.Low: return 'Low';
                case TaskPriority.Medium: return 'Medium';
                case TaskPriority.High: return 'High';
                case TaskPriority.Critical: return 'Critical';
                default: return 'Medium';
              }
            },
          },
        },
        {
          provide: 'BoardService',
          useValue: {
            getBoardDetails: () => of({ members: mockBoardMembers }),
          },
        },
        {
          provide: 'ActivatedRoute',
          useValue: {
            queryParams: of({ boardId: 'board1' }),
          },
        },
      ],
      moduleMetadata: {
        imports: [CommonModule, ReactiveFormsModule],
      },
    }),
  ],
};

export default meta;
type Story = StoryObj<CardEditModalComponent>;

export const ViewMode: Story = {
  name: 'View Mode',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 h-[70vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-end">
            <!-- Close Button -->
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body - Two Column Layout -->
          <div class="flex h-full">
            <!-- Left Column - Main Content -->
            <div class="flex-1 px-6 py-6 overflow-y-auto">
              <!-- Title Section -->
              <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Implement user authentication</h1>
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit card
                </button>
              </div>

              <!-- Card Fields Section -->
              <div class="space-y-4 mb-6">
                <!-- List Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">List:</span>
                  <div class="relative">
                    <select class="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                      <option value="1">To Do</option>
                      <option value="2" selected>In Progress</option>
                      <option value="3">Done</option>
                    </select>
                  </div>
                </div>

                <!-- Due Date Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Due date:</span>
                  <span class="text-sm text-gray-600">Dec 31, 2024</span>
                </div>

                <!-- Priority Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Priority:</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    High
                  </span>
                </div>
              </div>

              <!-- Description Section -->
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <div class="text-gray-600 leading-relaxed">
                  Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.
                </div>
              </div>

              <!-- Delete Button -->
              <div class="flex justify-start">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Card
                </button>
              </div>
            </div>
            
            <!-- Right Column - Activity Section -->
            <div class="w-80 border-l border-gray-200 bg-white overflow-y-auto">
              <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Activity</h3>
                
                <!-- Activity Feed -->
                <div class="space-y-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">Assigned to John Doe</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">3 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">Status changed from To Do to In Progress</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">4 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">Task was created by John Doe</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">5 days ago</div>
                  </div>
                  
                  <!-- Load More Button -->
                  <div class="flex justify-center pt-4">
                    <button
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                      Load More (20)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const EditMode: Story = {
  name: 'Edit Mode',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 h-[70vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-end">
            <!-- Close Button -->
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body - Two Column Layout -->
          <div class="flex h-full">
            <!-- Left Column - Main Content -->
            <div class="flex-1 px-6 py-6 overflow-y-auto">
              <!-- Edit Mode Header -->
              <div class="flex items-center justify-between mb-6">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Go back
                </button>
                <h2 class="text-lg font-bold text-gray-900">Edit Card</h2>
              </div>
              
              <!-- Edit Form -->
              <div class="space-y-5">
                <!-- Card Name -->
                <div>
                  <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-2">
                    Card name *
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    placeholder="Enter card name"
                    value="Implement user authentication"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm">
                </div>

                <!-- Description -->
                <div>
                  <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="edit-description"
                    placeholder="Enter card description"
                    rows="4"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors resize-none text-sm">Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.</textarea>
                </div>

                <!-- Due Date and Priority Row -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- Due Date -->
                  <div>
                    <label for="edit-dueDate" class="block text-sm font-medium text-gray-700 mb-2">
                      Due date *
                    </label>
                    <input
                      id="edit-dueDate"
                      type="date"
                      value="2024-12-31"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm">
                  </div>

                  <!-- Priority -->
                  <div>
                    <label for="edit-priority" class="block text-sm font-medium text-gray-700 mb-2">
                      Priority *
                    </label>
                    <select
                      id="edit-priority"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm bg-white">
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2" selected>High</option>
                      <option value="3">Critical</option>
                    </select>
                  </div>
                </div>

                <!-- List and Assignee Row -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- List Selection -->
                  <div>
                    <label for="edit-listId" class="block text-sm font-medium text-gray-700 mb-2">
                      List *
                    </label>
                    <select
                      id="edit-listId"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm bg-white">
                      <option value="1">To Do</option>
                      <option value="2" selected>In Progress</option>
                      <option value="3">Done</option>
                    </select>
                  </div>

                  <!-- Assignee -->
                  <div>
                    <label for="edit-assigneeId" class="block text-sm font-medium text-gray-700 mb-2">
                      Assignee
                    </label>
                    <select
                      id="edit-assigneeId"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm bg-white">
                      <option value="">Unassigned</option>
                      <option value="1" selected>John Doe</option>
                      <option value="2">Jane Smith</option>
                      <option value="3">Mike Johnson</option>
                    </select>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="px-6 py-3 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors min-w-[120px]">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            
            <!-- Right Column - Activity Section -->
            <div class="w-80 border-l border-gray-200 bg-white overflow-y-auto">
              <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Activity</h3>
                
                <!-- Activity Feed -->
                <div class="space-y-4">
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">Assigned to John Doe</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">3 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">Status changed from To Do to In Progress</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">4 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">Task was created by John Doe</div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">5 days ago</div>
                  </div>
                  
                  <!-- Load More Button -->
                  <div class="flex justify-center pt-4">
                    <button
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                      Load More (20)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const LoadingActivity: Story = {
  name: 'Loading Activity',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 h-[70vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-end">
            <!-- Close Button -->
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body - Two Column Layout -->
          <div class="flex h-full">
            <!-- Left Column - Main Content -->
            <div class="flex-1 px-6 py-6 overflow-y-auto">
              <!-- Title Section -->
              <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Implement user authentication</h1>
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit card
                </button>
              </div>

              <!-- Card Fields Section -->
              <div class="space-y-4 mb-6">
                <!-- List Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">List:</span>
                  <div class="relative">
                    <select class="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                      <option value="1">To Do</option>
                      <option value="2" selected>In Progress</option>
                      <option value="3">Done</option>
                    </select>
                  </div>
                </div>

                <!-- Due Date Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Due date:</span>
                  <span class="text-sm text-gray-600">Dec 31, 2024</span>
                </div>

                <!-- Priority Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Priority:</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                    High
                  </span>
                </div>
              </div>

              <!-- Description Section -->
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <div class="text-gray-600 leading-relaxed">
                  Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.
                </div>
              </div>

              <!-- Delete Button -->
              <div class="flex justify-start">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Card
                </button>
              </div>
            </div>
            
            <!-- Right Column - Activity Section -->
            <div class="w-80 border-l border-gray-200 bg-white overflow-y-auto">
              <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Activity</h3>
                
                <!-- Loading state -->
                <div class="space-y-4">
                  <div class="flex items-start space-x-3 animate-pulse">
                    <div class="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div class="flex-1">
                      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div class="w-12 h-3 bg-gray-300 rounded"></div>
                  </div>
                  
                  <div class="flex items-start space-x-3 animate-pulse">
                    <div class="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div class="flex-1">
                      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div class="w-12 h-3 bg-gray-300 rounded"></div>
                  </div>
                  
                  <div class="flex items-start space-x-3 animate-pulse">
                    <div class="w-2 h-2 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                    <div class="flex-1">
                      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div class="w-12 h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const NoActivity: Story = {
  name: 'No Activity',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 h-[70vh] overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-end">
            <!-- Close Button -->
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body - Two Column Layout -->
          <div class="flex h-full">
            <!-- Left Column - Main Content -->
            <div class="flex-1 px-6 py-6 overflow-y-auto">
              <!-- Title Section -->
              <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-gray-900">New task with no activity</h1>
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit card
                </button>
              </div>

              <!-- Card Fields Section -->
              <div class="space-y-4 mb-6">
                <!-- List Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">List:</span>
                  <div class="relative">
                    <select class="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                      <option value="1" selected>To Do</option>
                      <option value="2">In Progress</option>
                      <option value="3">Done</option>
                    </select>
                  </div>
                </div>

                <!-- Due Date Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Due date:</span>
                  <span class="text-sm text-gray-600">No due date</span>
                </div>

                <!-- Priority Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Priority:</span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    Medium
                  </span>
                </div>
              </div>

              <!-- Description Section -->
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <div class="text-gray-600 leading-relaxed">
                  This is a brand new task that hasn't been worked on yet.
                </div>
              </div>

              <!-- Delete Button -->
              <div class="flex justify-start">
                <button
                  type="button"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Card
                </button>
              </div>
            </div>
            
            <!-- Right Column - Activity Section -->
            <div class="w-80 border-l border-gray-200 bg-white overflow-y-auto">
              <div class="p-6">
                <h3 class="text-lg font-bold text-gray-900 mb-4">Activity</h3>
                
                <!-- No Activity -->
                <div class="text-sm text-gray-500 text-center py-8">
                  No activity yet
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};