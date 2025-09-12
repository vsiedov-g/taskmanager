import type { Meta, StoryObj } from '@storybook/angular';

const meta: Meta = {
  title: 'Components/Input',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form input component with validation, icons, and various states.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Default Input',
  render: () => ({
    template: `
      <div class="w-80">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
      </div>
    `,
  }),
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  render: () => ({
    template: `
      <div class="w-80">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
          <p class="mt-1 text-xs text-gray-500">We'll never share your email with anyone else.</p>
        </div>
      </div>
    `,
  }),
};

export const WithError: Story = {
  name: 'With Error State',
  render: () => ({
    template: `
      <div class="w-80">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 focus:outline-none text-sm">
          <p class="mt-1 text-xs text-red-600">Password must be at least 8 characters long.</p>
        </div>
      </div>
    `,
  }),
};

export const Required: Story = {
  name: 'Required Field',
  render: () => ({
    template: `
      <div class="w-80">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Full Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
          <p class="mt-1 text-xs text-gray-500">This field is required.</p>
        </div>
      </div>
    `,
  }),
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => ({
    template: `
      <div class="w-80 space-y-4">
        <!-- Search with prefix icon -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="search"
              placeholder="Search tasks..."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
          </div>
        </div>

        <!-- URL with suffix icon -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Website
          </label>
          <div class="relative">
            <input
              type="url"
              placeholder="https://example.com"
              class="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
            <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `,
  }),
};

export const Disabled: Story = {
  name: 'Disabled State',
  render: () => ({
    template: `
      <div class="w-80">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-400">
            Disabled Input
          </label>
          <input
            type="text"
            placeholder="This is disabled"
            value="Cannot edit this"
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed text-sm">
        </div>
      </div>
    `,
  }),
};

export const Readonly: Story = {
  name: 'Readonly State',
  render: () => ({
    template: `
      <div class="w-80">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Readonly Input
          </label>
          <input
            type="text"
            placeholder="This is readonly"
            value="Read-only value"
            readonly
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 cursor-default text-sm">
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  name: 'Different Sizes',
  render: () => ({
    template: `
      <div class="w-80 space-y-4">
        <!-- Small -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-gray-700">
            Small Input
          </label>
          <input
            type="text"
            placeholder="Small size"
            class="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-xs">
        </div>

        <!-- Medium -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            Medium Input
          </label>
          <input
            type="text"
            placeholder="Medium size"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>

        <!-- Large -->
        <div class="space-y-2">
          <label class="block text-base font-medium text-gray-700">
            Large Input
          </label>
          <input
            type="text"
            placeholder="Large size"
            class="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-base">
        </div>
      </div>
    `,
  }),
};

export const InputTypes: Story = {
  name: 'Input Types',
  render: () => ({
    template: `
      <div class="w-80 space-y-4">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Text</label>
          <input type="text" placeholder="Text input" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" placeholder="email@example.com" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" placeholder="Password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Number</label>
          <input type="number" placeholder="123" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" placeholder="+1 (555) 123-4567" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">URL</label>
          <input type="url" placeholder="https://example.com" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-sm">
        </div>
      </div>
    `,
  }),
};