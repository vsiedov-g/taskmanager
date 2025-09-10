import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success', 'outline'],
      description: 'Visual variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take full width',
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type',
    },
    clicked: {
      action: 'clicked',
      description: 'Event emitted when button is clicked',
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    fullWidth: false,
    type: 'button',
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const AllVariants: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ButtonComponent],
    },
    template: `
      <div class="flex flex-col gap-4">
        <app-button variant="primary">Primary (Gray)</app-button>
        <app-button variant="secondary">Secondary (Blue)</app-button>
        <app-button variant="danger">Danger (White with Red Text)</app-button>
        <app-button variant="success">Success</app-button>
        <app-button variant="outline">Outline</app-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together.',
      },
    },
  },
};