import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Features/TaskCard',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A task card component displaying task information with drag and drop functionality, status management, and priority indicators.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Task Card',
  render: () => ({
    template: `
      <div class="w-80 p-4 bg-gray-50">
        <!-- Task Card - Based on actual component -->
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-medium text-gray-900">Implement user authentication</h3>
            <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
          
          <!-- Card Description -->
          <p class="text-sm text-gray-600 mb-3 line-clamp-3">Add login and signup functionality with proper validation and security measures</p>
          
          <!-- Card Footer -->
          <div class="flex items-center justify-between mb-3">
            <!-- Due Date -->
            <div class="flex items-center text-sm text-gray-500">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Dec 31, 2024
            </div>
            
            <!-- Priority Badge -->
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <span class="w-1.5 h-1.5 rounded-full mr-1 bg-orange-400"></span>
              High
            </span>
          </div>
          
          <!-- Move To Dropdown -->
          <div class="mt-3">
            <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
              <option value="">Move to:</option>
              <option value="list-1">To Do</option>
              <option value="list-2">In Progress</option>
              <option value="list-3">Done</option>
            </select>
          </div>
        </div>
      </div>
    `,
  }),
};

export const LowPriority: Story = {
  name: 'Low Priority Task',
  render: () => ({
    template: `
      <div class="w-80 p-4 bg-gray-50">
        <!-- Task Card - Based on actual component -->
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-medium text-gray-900">Update documentation</h3>
            <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
          
          <!-- Card Description -->
          <p class="text-sm text-gray-600 mb-3 line-clamp-3">Review and update project documentation for new features</p>
          
          <!-- Card Footer -->
          <div class="flex items-center justify-between mb-3">
            <!-- Due Date -->
            <div class="flex items-center text-sm text-gray-500">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Jan 15, 2025
            </div>
            
            <!-- Priority Badge -->
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <span class="w-1.5 h-1.5 rounded-full mr-1 bg-gray-400"></span>
              Low
            </span>
          </div>
          
          <!-- Move To Dropdown -->
          <div class="mt-3">
            <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
              <option value="">Move to:</option>
              <option value="list-1">To Do</option>
              <option value="list-3">Done</option>
            </select>
          </div>
        </div>
      </div>
    `,
  }),
};

export const CriticalPriority: Story = {
  name: 'Critical Priority Task',
  render: () => ({
    template: `
      <div class="w-80 p-4 bg-gray-50">
        <!-- Task Card - Based on actual component -->
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-medium text-gray-900">Fix critical security vulnerability</h3>
            <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
          
          <!-- Card Description -->
          <p class="text-sm text-gray-600 mb-3 line-clamp-3">Urgent: Address SQL injection vulnerability in user authentication system</p>
          
          <!-- Card Footer -->
          <div class="flex items-center justify-between mb-3">
            <!-- Due Date -->
            <div class="flex items-center text-sm text-red-600">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Today
            </div>
            
            <!-- Priority Badge -->
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <span class="w-1.5 h-1.5 rounded-full mr-1 bg-red-400"></span>
              Critical
            </span>
          </div>
          
          <!-- Move To Dropdown -->
          <div class="mt-3">
            <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
              <option value="">Move to:</option>
              <option value="list-2">In Progress</option>
              <option value="list-3">Done</option>
            </select>
          </div>
        </div>
      </div>
    `,
  }),
};

export const WithoutDescription: Story = {
  name: 'Task Without Description',
  render: () => ({
    template: `
      <div class="w-80 p-4 bg-gray-50">
        <!-- Task Card - Based on actual component -->
        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
          <!-- Card Header -->
          <div class="flex items-start justify-between mb-3">
            <h3 class="font-medium text-gray-900">Quick bug fix</h3>
            <button class="text-gray-400 hover:text-gray-600 flex-shrink-0">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
          
          <!-- Card Footer -->
          <div class="flex items-center justify-between mb-3">
            <!-- Due Date -->
            <div class="flex items-center text-sm text-gray-500">
              <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tomorrow
            </div>
            
            <!-- Priority Badge -->
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <span class="w-1.5 h-1.5 rounded-full mr-1 bg-yellow-400"></span>
              Medium
            </span>
          </div>
          
          <!-- Move To Dropdown -->
          <div class="mt-3">
            <select class="w-full text-sm border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-slate-500 focus:border-slate-500">
              <option value="">Move to:</option>
              <option value="list-1">To Do</option>
              <option value="list-3">Done</option>
            </select>
          </div>
        </div>
      </div>
    `,
  }),
};

