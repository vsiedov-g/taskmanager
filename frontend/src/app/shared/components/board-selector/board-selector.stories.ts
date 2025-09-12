import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Components/BoardSelector',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A board selector dropdown component that allows users to switch between different project boards and navigate to board management.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Board Selector - Closed',
  render: () => ({
    template: `
      <div class="w-80 p-4">
        <!-- Board Selector Component - Based on actual component -->
        <div class="relative board-selector">
          <!-- Current Board Display / Dropdown Trigger -->
          <button 
            type="button"
            class="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors">
            
            <div class="flex items-center space-x-2 min-w-0">
              <svg class="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              
              <div class="min-w-0 text-left">
                <div class="font-medium text-gray-900 truncate">
                  Frontend Development
                </div>
                <div class="text-xs text-gray-500 truncate">
                  5 members
                </div>
              </div>
            </div>
            
            <svg class="h-4 w-4 text-gray-400 flex-shrink-0 transition-transform" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    `,
  }),
};

export const Expanded: Story = {
  name: 'Board Selector - Expanded',
  render: () => ({
    template: `
      <div class="w-80 p-4">
        <!-- Board Selector Component - Based on actual component -->
        <div class="relative board-selector">
          <!-- Current Board Display / Dropdown Trigger -->
          <button 
            type="button"
            class="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors">
            
            <div class="flex items-center space-x-2 min-w-0">
              <svg class="h-5 w-5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              
              <div class="min-w-0 text-left">
                <div class="font-medium text-gray-900 truncate">
                  Frontend Development
                </div>
                <div class="text-xs text-gray-500 truncate">
                  5 members
                </div>
              </div>
            </div>
            
            <svg class="h-4 w-4 text-gray-400 flex-shrink-0 transition-transform rotate-180" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div class="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96">
            
            <!-- Header -->
            <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium text-gray-900">Switch Board</h3>
                <button class="text-gray-400 hover:text-gray-600 focus:outline-none">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Board List -->
            <div class="max-h-56 overflow-y-auto">
              <!-- Current Board -->
              <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 bg-blue-50">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-sm font-medium text-gray-900 truncate">Frontend Development</h4>
                      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 truncate mt-1">
                      Tasks related to frontend development
                    </p>
                    <div class="flex items-center space-x-3 mt-1">
                      <span class="text-xs text-gray-500">5 members</span>
                      <span class="text-xs text-gray-400">12/1/2024</span>
                    </div>
                  </div>
                  <div class="ml-2 flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Admin
                    </span>
                  </div>
                </div>
              </div>

              <!-- Other Boards -->
              <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-sm font-medium text-gray-900 truncate">Backend API</h4>
                    </div>
                    <p class="text-xs text-gray-500 truncate mt-1">
                      Backend API development and maintenance
                    </p>
                    <div class="flex items-center space-x-3 mt-1">
                      <span class="text-xs text-gray-500">3 members</span>
                      <span class="text-xs text-gray-400">12/2/2024</span>
                    </div>
                  </div>
                  <div class="ml-2 flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Member
                    </span>
                  </div>
                </div>
              </div>

              <div class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                <div class="flex items-start justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-2">
                      <h4 class="text-sm font-medium text-gray-900 truncate">Mobile App</h4>
                    </div>
                    <p class="text-xs text-gray-500 truncate mt-1">
                      iOS and Android mobile application
                    </p>
                    <div class="flex items-center space-x-3 mt-1">
                      <span class="text-xs text-gray-500">8 members</span>
                      <span class="text-xs text-gray-400">11/28/2024</span>
                    </div>
                  </div>
                  <div class="ml-2 flex-shrink-0">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Member
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button class="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View All Boards
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};