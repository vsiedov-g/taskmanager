import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal.component';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<ModalComponent> = {
  title: 'Components/Modal',
  component: ModalComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A flexible modal component with different sizes, animations, and accessibility features.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Whether to show the close button',
    },
    showFooter: {
      control: 'boolean',
      description: 'Whether to show the footer section',
    },
    closeOnBackdrop: {
      control: 'boolean',
      description: 'Whether clicking backdrop closes modal',
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Whether pressing Escape closes modal',
    },
    closed: {
      action: 'closed',
      description: 'Event emitted when modal is closed',
    },
    opened: {
      action: 'opened',
      description: 'Event emitted when modal is opened',
    },
  },
  args: {
    isOpen: true,
    title: 'Modal Title',
    size: 'md',
    showCloseButton: true,
    showFooter: false,
    closeOnBackdrop: true,
    closeOnEscape: true,
  },
};

export default meta;
type Story = StoryObj<ModalComponent>;

export const FormModal: Story = {
  args: {
    title: 'Create New Task',
    isOpen: true,
    showFooter: true,
    size: 'lg',
  },
  render: (args) => ({
    props: args,
    moduleMetadata: {
      imports: [ModalComponent, ButtonComponent],
    },
    template: `
      <app-modal 
        [isOpen]="isOpen"
        [title]="title"
        [size]="size"
        [showCloseButton]="showCloseButton"
        [showFooter]="showFooter"
        [closeOnBackdrop]="closeOnBackdrop"
        [closeOnEscape]="closeOnEscape"
        (closed)="closed($event)"
        (opened)="opened($event)">
        
        <form class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Enter task title">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Enter task description"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
        </form>
        
        <div slot="footer">
          <app-button variant="outline" (clicked)="closed($event)">Cancel</app-button>
          <app-button variant="primary" (clicked)="closed($event)">Create Task</app-button>
        </div>
      </app-modal>
    `,
  }),
};