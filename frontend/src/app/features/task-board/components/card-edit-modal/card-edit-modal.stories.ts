import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Modals/Card Edit Modal',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for editing existing task cards with view/edit modes and activity tracking.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Card Edit Modal - View Mode',
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
              <!-- View Mode -->
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
                  <span class="text-sm text-gray-600">In Progress</span>
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

                <!-- Assignee Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">Assigned to:</span>
                  <span class="text-sm text-gray-600">John Doe</span>
                </div>
              </div>

              <!-- Description Section -->
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <div class="text-gray-600 leading-relaxed">
                  Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.
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
                        <div class="text-sm text-gray-700">
                          <span class="font-medium">John Doe</span> assigned this task to himself
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">3 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">
                          <span class="font-medium">Jane Smith</span> moved this from <span class="font-medium">To Do</span> to <span class="font-medium">In Progress</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">4 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">
                          <span class="font-medium">John Doe</span> created this task
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">5 days ago</div>
                  </div>
                  
                  <!-- Load More Button -->
                  <div class="flex justify-center pt-4">
                    <button
                      type="button"
                      class="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                      Load More Activity
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
  name: 'Card Edit Modal - Edit Mode',
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
              <!-- Edit Mode -->
              <!-- Title Section -->
              <div class="mb-6">
                <div class="flex justify-end space-x-2 mb-3">
                  <button
                    type="button"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                    <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                    Cancel
                  </button>
                </div>
                
                <input
                  type="text"
                  value="Implement user authentication"
                  class="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded w-full">
              </div>

              <!-- Card Fields Section -->
              <div class="space-y-4 mb-6">
                <!-- List Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700 w-16">List:</span>
                  <div class="relative flex-1">
                    <select class="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 pr-8">
                      <option value="1">To Do</option>
                      <option value="2" selected>In Progress</option>
                      <option value="3">Done</option>
                    </select>
                    <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                <!-- Due Date Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700 w-16">Due date:</span>
                  <input
                    type="date"
                    value="2024-12-31"
                    class="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
                </div>

                <!-- Priority Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700 w-16">Priority:</span>
                  <div class="relative flex-1">
                    <select class="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 pr-8">
                      <option value="0">Low</option>
                      <option value="1">Medium</option>
                      <option value="2" selected>High</option>
                      <option value="3">Critical</option>
                    </select>
                    <svg class="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>

                <!-- Assignee Field -->
                <div class="flex items-center space-x-3">
                  <svg class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700 w-16">Assignee:</span>
                  <div class="relative flex-1">
                    <select class="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 pr-8">
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
              </div>

              <!-- Description Section -->
              <div class="mb-6">
                <h3 class="text-lg font-bold text-gray-900 mb-3">Description</h3>
                <textarea
                  rows="4"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm">Set up JWT authentication system with login, registration, and password reset functionality. Include proper validation and security measures.</textarea>
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
                        <div class="text-sm text-gray-700">
                          <span class="font-medium">John Doe</span> assigned this task to himself
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">3 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">
                          <span class="font-medium">Jane Smith</span> moved this from <span class="font-medium">To Do</span> to <span class="font-medium">In Progress</span>
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">4 days ago</div>
                  </div>
                  
                  <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                      <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div class="flex-1">
                        <div class="text-sm text-gray-700">
                          <span class="font-medium">John Doe</span> created this task
                        </div>
                      </div>
                    </div>
                    <div class="text-xs text-gray-500 whitespace-nowrap ml-2">5 days ago</div>
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