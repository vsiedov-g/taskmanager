import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Components/Button',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const AllVariants: Story = {
  name: 'Button Variants',
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <!-- Primary Button -->
        <button class="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Primary
        </button>
        
        <!-- Secondary Button (White) -->
        <button class="px-4 py-2 bg-white text-gray-900 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
          Secondary
        </button>
        
        <!-- Danger Button -->
        <button class="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-md border border-gray-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
          Danger
        </button>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  name: 'Button Sizes',
  render: () => ({
    template: `
      <div class="flex flex-col gap-4 items-start">
        <!-- Extra Small -->
        <button class="px-2 py-1 bg-slate-600 text-white text-xs font-medium rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Extra Small
        </button>
        
        <!-- Small -->
        <button class="px-3 py-1.5 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Small
        </button>
        
        <!-- Medium (Default) -->
        <button class="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Medium
        </button>
        
        <!-- Large -->
        <button class="px-6 py-3 bg-slate-600 text-white text-base font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Large
        </button>
      </div>
    `,
  }),
};

export const States: Story = {
  name: 'Button States',
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        <!-- Normal -->
        <button class="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Normal
        </button>
        
        <!-- Disabled -->
        <button disabled class="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed">
          Disabled
        </button>
        
        <!-- Loading -->
        <button disabled class="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md cursor-not-allowed transition-colors">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </button>
      </div>
    `,
  }),
};

export const FullWidth: Story = {
  name: 'Full Width Button',
  render: () => ({
    template: `
      <div class="w-80">
        <button class="w-full px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors">
          Full Width Button
        </button>
      </div>
    `,
  }),
};