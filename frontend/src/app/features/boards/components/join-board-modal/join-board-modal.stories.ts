import type { Meta, StoryObj } from '@storybook/angular';
import { JoinBoardModalComponent } from './join-board-modal.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const meta: Meta<JoinBoardModalComponent> = {
  title: 'Modals/Join Board Modal',
  component: JoinBoardModalComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Modal for joining boards using a 6-character join code with validation and user feedback.',
      },
    },
  },
  decorators: [
    (story) => ({
      ...story,
      moduleMetadata: {
        imports: [CommonModule, FormsModule],
      },
    }),
  ],
};

export default meta;
type Story = StoryObj<JoinBoardModalComponent>;

export const Default: Story = {
  name: 'Join Board Modal',
  render: () => ({
    template: `
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Join Board
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="joinCode" class="block text-sm font-medium text-gray-700">
                        Join Code *
                      </label>
                      <input
                        id="joinCode"
                        name="joinCode"
                        type="text"
                        value=""
                        maxlength="6"
                        minlength="6"
                        pattern="[A-Z0-9]{6}"
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-center font-mono text-lg tracking-widest"
                        placeholder="ABC123"
                        style="text-transform: uppercase">
                      <p class="mt-1 text-sm text-gray-500">Enter the 6-character board join code</p>
                    </div>
                  </div>
                  
                  <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
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
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm">
                Join Board
              </button>
              
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithJoinCode: Story = {
  name: 'With Join Code Entered',
  render: () => ({
    template: `
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Join Board
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="joinCode" class="block text-sm font-medium text-gray-700">
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
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-center font-mono text-lg tracking-widest"
                        placeholder="ABC123"
                        style="text-transform: uppercase">
                      <p class="mt-1 text-sm text-gray-500">Enter the 6-character board join code</p>
                    </div>
                  </div>
                  
                  <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
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
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm">
                Join Board
              </button>
              
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Join Board
                  </h3>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="joinCode" class="block text-sm font-medium text-gray-700">
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
                        class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 text-center font-mono text-lg tracking-widest"
                        placeholder="ABC123"
                        style="text-transform: uppercase"
                        disabled>
                      <p class="mt-1 text-sm text-gray-500">Enter the 6-character board join code</p>
                    </div>
                  </div>
                  
                  <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
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
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                disabled
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm opacity-50 cursor-not-allowed">
                <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></span>
                Joining...
              </button>
              
              <button
                type="button"
                disabled
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm opacity-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithError: Story = {
  name: 'With Error Message',
  render: () => ({
    template: `
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Join Board
                  </h3>
                  
                  <div class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    Invalid join code. Please check and try again.
                  </div>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="joinCode" class="block text-sm font-medium text-gray-700">
                        Join Code *
                      </label>
                      <input
                        id="joinCode"
                        name="joinCode"
                        type="text"
                        value="XYZ999"
                        maxlength="6"
                        minlength="6"
                        pattern="[A-Z0-9]{6}"
                        class="mt-1 block w-full border border-red-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 text-center font-mono text-lg tracking-widest"
                        placeholder="ABC123"
                        style="text-transform: uppercase">
                      <p class="mt-1 text-sm text-gray-500">Enter the 6-character board join code</p>
                    </div>
                  </div>
                  
                  <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
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
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm">
                Join Board
              </button>
              
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithSuccess: Story = {
  name: 'With Success Message',
  render: () => ({
    template: `
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Join Board
                  </h3>
                  
                  <div class="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                    Successfully joined "Project Alpha" board! Redirecting...
                  </div>
                  
                  <div class="space-y-4">
                    <div>
                      <label for="joinCode" class="block text-sm font-medium text-gray-700">
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
                        class="mt-1 block w-full border border-green-300 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 text-center font-mono text-lg tracking-widest"
                        placeholder="ABC123"
                        style="text-transform: uppercase"
                        disabled>
                      <p class="mt-1 text-sm text-gray-500">Enter the 6-character board join code</p>
                    </div>
                  </div>
                  
                  <div class="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
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
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                disabled
                class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm opacity-50 cursor-not-allowed">
                Join Board
              </button>
              
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};