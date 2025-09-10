import type { Meta, StoryObj } from '@storybook/angular';
import { CardCreationModalComponent } from './card-creation-modal.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { TaskPriority } from '../../models/task.model';
import { List } from '../../models/list.model';
import { BoardMember, BoardRole } from '../../../../core/models/board.model';

// Mock data
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

const mockInitialState = {
  taskBoard: {
    lists: mockLists,
    isCreatingTask: false,
    error: null,
    createCardModalListId: '1',
  },
};

const meta: Meta<CardCreationModalComponent> = {
  title: 'Modals/Card Creation Modal',
  component: CardCreationModalComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for creating new task cards with form validation and real-time feedback.',
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
type Story = StoryObj<CardCreationModalComponent>;

export const Default: Story = {
  name: 'Card Creation Modal',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold">New card</h2>
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- Title/Name Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Name</span>
                <div class="flex-1">
                  <input
                    type="text"
                    placeholder="Enter card name"
                    value="Implement user authentication"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                </div>
              </div>

              <!-- List Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">List</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="1" selected>To Do</option>
                    <option value="2">In Progress</option>
                    <option value="3">Done</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <!-- Assignee Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Assignee</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="">Unassigned</option>
                    <option value="1" selected>John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <!-- Due Date Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Due date</span>
                <div class="flex-1">
                  <input
                    type="date"
                    value="2024-12-31"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                </div>
              </div>

              <!-- Priority Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Priority</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="0">Low</option>
                    <option value="1" selected>Medium</option>
                    <option value="2">High</option>
                    <option value="3">Critical</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <textarea
                placeholder="Write some information..."
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors resize-none text-sm">Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.</textarea>
            </div>

            <!-- Modal Actions -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                Save
              </button>
              <button
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithValidationErrors: Story = {
  name: 'With Validation Errors',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold">New card</h2>
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- Title/Name Field with Error -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Name</span>
                <div class="flex-1">
                  <input
                    type="text"
                    placeholder="Enter card name"
                    value=""
                    class="w-full px-3 py-2 text-sm border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <p class="mt-1 text-sm text-red-600">Card name is required</p>
                </div>
              </div>

              <!-- List Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">List</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="" disabled selected>Planned</option>
                    <option value="1">To Do</option>
                    <option value="2">In Progress</option>
                    <option value="3">Done</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <!-- Assignee Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Assignee</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="">Unassigned</option>
                    <option value="1">John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <!-- Due Date Field with Error -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Due date</span>
                <div class="flex-1">
                  <input
                    type="date"
                    value=""
                    class="w-full px-3 py-2 text-sm border border-red-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <p class="mt-1 text-sm text-red-600">Due date is required</p>
                </div>
              </div>

              <!-- Priority Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Priority</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="" disabled selected>Select priority</option>
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                    <option value="3">Critical</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Description Section with Error -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <textarea
                placeholder="Write some information..."
                rows="4"
                class="w-full px-4 py-3 border border-red-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none text-sm"></textarea>
              <p class="mt-1 text-sm text-red-600">Description is required</p>
            </div>

            <!-- Error Display -->
            <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-700">Please fix the errors above before submitting.</p>
            </div>

            <!-- Modal Actions -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                disabled
                class="px-6 py-2.5 text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md cursor-not-allowed transition-colors">
                Save
              </button>
              <button
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Loading: Story = {
  name: 'Loading State',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold">New card</h2>
            <button
              type="button"
              class="text-gray-300 hover:text-white focus:outline-none transition-colors">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- Title/Name Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Name</span>
                <div class="flex-1">
                  <input
                    type="text"
                    placeholder="Enter card name"
                    value="Implement user authentication"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                </div>
              </div>

              <!-- List Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">List</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="1" selected>To Do</option>
                    <option value="2">In Progress</option>
                    <option value="3">Done</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <!-- Assignee Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Assignee</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="">Unassigned</option>
                    <option value="1" selected>John Doe</option>
                    <option value="2">Jane Smith</option>
                    <option value="3">Mike Johnson</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>

              <!-- Due Date Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Due date</span>
                <div class="flex-1">
                  <input
                    type="date"
                    value="2024-12-31"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                </div>
              </div>

              <!-- Priority Field -->
              <div class="flex items-center space-x-3">
                <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700 w-16">Priority</span>
                <div class="flex-1 relative">
                  <select class="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white appearance-none pr-8">
                    <option value="0">Low</option>
                    <option value="1" selected>Medium</option>
                    <option value="2">High</option>
                    <option value="3">Critical</option>
                  </select>
                  <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Description</h3>
              <textarea
                placeholder="Write some information..."
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors resize-none text-sm">Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.</textarea>
            </div>

            <!-- Modal Actions -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                disabled
                class="px-6 py-2.5 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md cursor-not-allowed transition-colors">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </button>
              <button
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};