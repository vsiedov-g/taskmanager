import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Features/History Sidebar',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Activity log sidebar component that displays board history with various types of activities including card creation, updates, assignments, and comments.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'History Sidebar',
  render: () => ({
    template: `
      <!-- History Sidebar -->
      <div class="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col">
        <!-- Top Bar -->
        <div class="bg-slate-600 text-white px-4 py-3 flex items-center justify-between">
          <h2 class="text-lg font-bold">History</h2>
          <button 
            type="button"
            class="text-gray-300 hover:text-white focus:outline-none transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div class="space-y-4">
            <!-- Activity Item 1 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  John Doe created card "Implement user authentication"
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  2 minutes ago
                </div>
              </div>
            </div>

            <!-- Activity Item 2 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Jane Smith updated card "Design database schema" priority to High
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  15 minutes ago
                </div>
              </div>
            </div>

            <!-- Activity Item 3 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  John Doe moved card "Setup CI/CD pipeline" from In Progress to Done
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  1 hour ago
                </div>
              </div>
            </div>

            <!-- Activity Item 4 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Mike Johnson assigned card "Write unit tests" to himself
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  2 hours ago
                </div>
              </div>
            </div>

            <!-- Activity Item 5 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Jane Smith deleted card "Deprecated feature cleanup"
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  Yesterday at 4:30 PM
                </div>
              </div>
            </div>

            <!-- Activity Item 6 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  John Doe added a comment to card "Implement user authentication"
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  Yesterday at 2:15 PM
                </div>
              </div>
            </div>

            <!-- Activity Item 7 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Mike Johnson created card "Fix responsive design issues"
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  Yesterday at 11:00 AM
                </div>
              </div>
            </div>

            <!-- Activity Item 8 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Jane Smith updated due date of card "API documentation" to Dec 15, 2024
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  2 days ago
                </div>
              </div>
            </div>

            <!-- Show More Button -->
            <div class="pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                class="w-full px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Show more</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
    `,
  }),
};

export const EmptyState: Story = {
  name: 'Empty Activity',
  render: () => ({
    template: `
      <!-- History Sidebar -->
      <div class="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col">
        <!-- Top Bar -->
        <div class="bg-slate-600 text-white px-4 py-3 flex items-center justify-between">
          <h2 class="text-lg font-bold">History</h2>
          <button 
            type="button"
            class="text-gray-300 hover:text-white focus:outline-none transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div class="text-center py-8 text-gray-500">
            <div class="text-lg mb-2">No activity yet</div>
            <div class="text-sm">Activity will appear here when you create, update, or move cards.</div>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
    `,
  }),
};

export const LoadingState: Story = {
  name: 'Loading Activity',
  render: () => ({
    template: `
      <!-- History Sidebar -->
      <div class="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col">
        <!-- Top Bar -->
        <div class="bg-slate-600 text-white px-4 py-3 flex items-center justify-between">
          <h2 class="text-lg font-bold">History</h2>
          <button 
            type="button"
            class="text-gray-300 hover:text-white focus:outline-none transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <span class="ml-2 text-gray-600">Loading activity logs...</span>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
    `,
  }),
};

export const WithLoadingMore: Story = {
  name: 'Loading More Activity',
  render: () => ({
    template: `
      <!-- History Sidebar -->
      <div class="fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 flex flex-col">
        <!-- Top Bar -->
        <div class="bg-slate-600 text-white px-4 py-3 flex items-center justify-between">
          <h2 class="text-lg font-bold">History</h2>
          <button 
            type="button"
            class="text-gray-300 hover:text-white focus:outline-none transition-colors">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-4 bg-gray-100">
          <div class="space-y-4">
            <!-- Activity Item 1 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  John Doe created card "Implement user authentication"
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  2 minutes ago
                </div>
              </div>
            </div>

            <!-- Activity Item 2 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Jane Smith updated card "Design database schema" priority to High
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  15 minutes ago
                </div>
              </div>
            </div>

            <!-- Activity Item 3 -->
            <div class="flex items-start space-x-3">
              <div class="w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
              <div class="flex-1">
                <div class="text-sm text-gray-700 leading-relaxed">
                  Mike Johnson assigned card "Write unit tests" to himself
                </div>
                <div class="text-xs text-gray-500 mt-1 italic">
                  2 hours ago
                </div>
              </div>
            </div>

            <!-- Loading More Button -->
            <div class="pt-4 border-t border-gray-200 mt-4">
              <button
                type="button"
                disabled
                class="w-full px-4 py-2 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2 opacity-50 cursor-not-allowed">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-25 z-40"></div>
    `,
  }),
};