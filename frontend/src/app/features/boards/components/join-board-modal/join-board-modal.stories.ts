import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Modals/Join Board Modal',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for joining boards using a 6-character join code with validation and user feedback.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Join Board Modal',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold">Join Board</h2>
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
              <!-- Join Code Field -->
              <div>
                <label for="joinCode" class="block text-sm font-medium text-gray-700 mb-2">
                  Join Code *
                </label>
                <input
                  id="joinCode"
                  name="joinCode"
                  type="text"
                  value="ABC123"
                  maxlength="6"
                  minlength="6"
                  pattern="[A-Z0-9]{6}"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-center font-mono text-xl tracking-widest font-bold"
                  placeholder="ABC123"
                  style="text-transform: uppercase">
                <p class="mt-2 text-sm text-gray-500">Enter the 6-character board join code</p>
              </div>
            </div>
            
            <!-- Help Section -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-800">
                    Ask a board admin for the join code. Once you join, you'll be able to view and manage tasks on the board.
                  </p>
                </div>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                class="px-6 py-2.5 text-sm font-medium text-white bg-slate-600 border border-transparent rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
                Join Board
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

export const WithValidationError: Story = {
  name: 'With Validation Error',
  render: () => ({
    template: `
      <!-- Modal Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal Container -->
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold">Join Board</h2>
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
              <!-- Join Code Field with Error -->
              <div>
                <label for="joinCode" class="block text-sm font-medium text-gray-700 mb-2">
                  Join Code *
                </label>
                <input
                  id="joinCode"
                  name="joinCode"
                  type="text"
                  value="ABC12"
                  maxlength="6"
                  minlength="6"
                  pattern="[A-Z0-9]{6}"
                  class="w-full px-4 py-3 border border-red-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-center font-mono text-xl tracking-widest font-bold"
                  placeholder="ABC123"
                  style="text-transform: uppercase">
                <p class="mt-2 text-sm text-red-600">Join code must be exactly 6 characters</p>
              </div>
            </div>
            
            <!-- Help Section -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-800">
                    Ask a board admin for the join code. Once you join, you'll be able to view and manage tasks on the board.
                  </p>
                </div>
              </div>
            </div>

            <!-- Modal Actions -->
            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                disabled
                class="px-6 py-2.5 text-sm font-medium text-white bg-gray-400 border border-transparent rounded-md cursor-not-allowed transition-colors">
                Join Board
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
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
          <!-- Modal Header -->
          <div class="bg-slate-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <h2 class="text-lg font-semibold">Join Board</h2>
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
              <!-- Join Code Field -->
              <div>
                <label for="joinCode" class="block text-sm font-medium text-gray-700 mb-2">
                  Join Code *
                </label>
                <input
                  id="joinCode"
                  name="joinCode"
                  type="text"
                  value="ABC123"
                  maxlength="6"
                  minlength="6"
                  pattern="[A-Z0-9]{6}"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-center font-mono text-xl tracking-widest font-bold"
                  placeholder="ABC123"
                  style="text-transform: uppercase">
                <p class="mt-2 text-sm text-gray-500">Enter the 6-character board join code</p>
              </div>
            </div>
            
            <!-- Help Section -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm text-blue-800">
                    Ask a board admin for the join code. Once you join, you'll be able to view and manage tasks on the board.
                  </p>
                </div>
              </div>
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
                Joining...
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