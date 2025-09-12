import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Features/List Component',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Kanban list component that contains task cards and supports drag-and-drop operations, card creation, and list management.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'List with Tasks',
  render: () => ({
    template: `
      <div class="w-80 h-96 p-4 bg-gray-50">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          
          <!-- Column Header -->
          <div class="p-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-semibold text-gray-900">In Progress</h2>
              <div class="flex items-center space-x-2">
                <span class="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">3</span>
                <!-- Context Menu Button -->
                <button class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Card Button -->
          <div class="p-4 border-b border-gray-100 flex-shrink-0">
            <button class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add new card
            </button>
          </div>

          <!-- Task Cards -->
          <div class="p-4 space-y-3 flex-1 overflow-y-auto">
            <!-- Task Card 1 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900">Implement user authentication</h3>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-3">Add login and signup functionality with proper validation and security measures</p>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dec 31, 2024
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <span class="w-1.5 h-1.5 rounded-full mr-1 bg-orange-400"></span>
                  High
                </span>
              </div>
              <div class="mt-3">
                <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                  <option value="">Move to:</option>
                  <option value="list-1">To Do</option>
                  <option value="list-3">Done</option>
                </select>
              </div>
            </div>

            <!-- Task Card 2 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900">Design database schema</h3>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-3">Create ERD and define database tables for the application</p>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Jan 5, 2025
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <span class="w-1.5 h-1.5 rounded-full mr-1 bg-yellow-400"></span>
                  Medium
                </span>
              </div>
              <div class="mt-3">
                <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                  <option value="">Move to:</option>
                  <option value="list-1">To Do</option>
                  <option value="list-3">Done</option>
                </select>
              </div>
            </div>

            <!-- Task Card 3 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900">Setup development environment</h3>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-3">Configure Docker containers and development tools</p>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dec 20, 2024
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <span class="w-1.5 h-1.5 rounded-full mr-1 bg-gray-400"></span>
                  Low
                </span>
              </div>
              <div class="mt-3">
                <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                  <option value="">Move to:</option>
                  <option value="list-1">To Do</option>
                  <option value="list-3">Done</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const EmptyList: Story = {
  name: 'Empty List',
  render: () => ({
    template: `
      <div class="w-80 h-96 p-4 bg-gray-50">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          
          <!-- Column Header -->
          <div class="p-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-semibold text-gray-900">To Do</h2>
              <div class="flex items-center space-x-2">
                <span class="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">0</span>
                <!-- Context Menu Button -->
                <button class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Card Button -->
          <div class="p-4 border-b border-gray-100 flex-shrink-0">
            <button class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add new card
            </button>
          </div>

          <!-- Empty State -->
          <div class="p-4 flex-1 overflow-y-auto flex items-center justify-center">
            <div class="text-center text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-sm">No tasks in this list</p>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const EditingListName: Story = {
  name: 'Editing List Name',
  render: () => ({
    template: `
      <div class="w-80 h-96 p-4 bg-gray-50">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          
          <!-- Column Header - Edit Mode -->
          <div class="p-4 border-b border-gray-200 flex-shrink-0">
            <div class="mb-2">
              <input
                type="text"
                value="In Progress"
                class="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 font-semibold text-gray-900"
                style="box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);">
              <div class="flex space-x-2 mt-2">
                <button class="text-xs px-2 py-1 bg-slate-600 text-white rounded hover:bg-slate-700">
                  Save
                </button>
                <button class="text-xs px-2 py-1 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Add New Card Button -->
          <div class="p-4 border-b border-gray-100 flex-shrink-0">
            <button class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add new card
            </button>
          </div>

          <!-- Task Cards -->
          <div class="p-4 space-y-3 flex-1 overflow-y-auto">
            <!-- Task Card 1 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900">Write unit tests</h3>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-3">Add comprehensive test coverage for the authentication module</p>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Jan 10, 2025
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <span class="w-1.5 h-1.5 rounded-full mr-1 bg-yellow-400"></span>
                  Medium
                </span>
              </div>
              <div class="mt-3">
                <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                  <option value="">Move to:</option>
                  <option value="list-1">To Do</option>
                  <option value="list-3">Done</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithContextMenu: Story = {
  name: 'List with Context Menu',
  render: () => ({
    template: `
      <div class="w-80 h-96 p-4 bg-gray-50">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
          
          <!-- Column Header -->
          <div class="p-4 border-b border-gray-200 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
              <h2 class="font-semibold text-gray-900">Done</h2>
              <div class="flex items-center space-x-2">
                <span class="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">2</span>
                <!-- Context Menu Button -->
                <div class="relative">
                  <button class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  <!-- Context Menu -->
                  <div class="absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg">
                      Edit
                    </button>
                    <button class="w-full text-left px-4 py-2 text-sm text-red-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-b-lg">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Add New Card Button -->
          <div class="p-4 border-b border-gray-100 flex-shrink-0">
            <button class="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors">
              <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add new card
            </button>
          </div>

          <!-- Task Cards -->
          <div class="p-4 space-y-3 flex-1 overflow-y-auto">
            <!-- Task Card 1 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900">Project setup complete</h3>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-3">Initial project structure and configuration completed</p>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dec 15, 2024
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 rounded-full mr-1 bg-green-400"></span>
                  Completed
                </span>
              </div>
            </div>

            <!-- Task Card 2 -->
            <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900">Basic UI components</h3>
                <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              <p class="text-sm text-gray-600 mb-3 line-clamp-3">Created reusable button, input, and modal components</p>
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center text-sm text-gray-500">
                  <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Dec 18, 2024
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span class="w-1.5 h-1.5 rounded-full mr-1 bg-green-400"></span>
                  Completed
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const AddListPlaceholder: Story = {
  name: 'Add List Placeholder',
  render: () => ({
    template: `
      <div class="w-80 h-96 p-4 bg-gray-50 flex items-center justify-center">
        <!-- Add List Button -->
        <button class="w-full h-16 bg-white bg-opacity-60 hover:bg-opacity-80 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center justify-center transition-colors text-gray-600 hover:text-gray-800">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="font-medium">Add another list</span>
        </button>
      </div>
    `,
  }),
};

export const AddListForm: Story = {
  name: 'Add List Form',
  render: () => ({
    template: `
      <div class="w-80 h-96 p-4 bg-gray-50 flex items-center justify-center">
        <!-- Add List Form -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <input
            type="text"
            placeholder="Enter list title..."
            value="New List"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent mb-3"
            style="box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);">
          
          <div class="flex space-x-2">
            <button class="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-colors">
              Add list
            </button>
            <button class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `,
  }),
};