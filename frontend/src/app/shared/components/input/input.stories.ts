import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from './input.component';

const meta: Meta<InputComponent> = {
  title: 'Components/Input',
  component: InputComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A form input component with validation, icons, and various states.',
      },
    },
  },
  decorators: [
    (story) => ({
      template: `<div class="w-80">${story()}</div>`,
      moduleMetadata: {
        imports: [InputComponent],
      },
    }),
  ],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'Input type',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the input is readonly',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    label: {
      control: 'text',
      description: 'Input label',
    },
    placeholder: {
      control: 'text',
      description: 'Input placeholder text',
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below input',
    },
    errorMessage: {
      control: 'text',
      description: 'Error message displayed below input',
    },
    prefixIcon: {
      control: 'text',
      description: 'Icon displayed on the left side',
    },
    suffixIcon: {
      control: 'text',
      description: 'Icon displayed on the right side',
    },
    inputChange: {
      action: 'inputChange',
      description: 'Event emitted when input value changes',
    },
    inputFocus: {
      action: 'inputFocus',
      description: 'Event emitted when input receives focus',
    },
    inputBlur: {
      action: 'inputBlur',
      description: 'Event emitted when input loses focus',
    },
  },
  args: {
    label: 'Input Label',
    placeholder: 'Enter text...',
    type: 'text',
    size: 'md',
    disabled: false,
    readonly: false,
    required: false,
    helperText: '',
    errorMessage: '',
    prefixIcon: '',
    suffixIcon: '',
  },
};

export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    type: 'email',
    helperText: 'We\'ll never share your email with anyone else.',
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    errorMessage: 'Password must be at least 8 characters long.',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    helperText: 'This field is required.',
  },
};

export const WithPrefixIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search tasks...',
    type: 'search',
    prefixIcon: 'fas fa-search',
  },
};

export const WithSuffixIcon: Story = {
  args: {
    label: 'Website',
    placeholder: 'https://example.com',
    type: 'url',
    suffixIcon: 'fas fa-external-link-alt',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This is disabled',
    disabled: true,
    value: 'Cannot edit this',
  },
};

export const Readonly: Story = {
  args: {
    label: 'Readonly Input',
    placeholder: 'This is readonly',
    readonly: true,
    value: 'Read-only value',
  },
};

export const Sizes: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [InputComponent],
    },
    template: `
      <div class="space-y-4">
        <app-input label="Small Input" placeholder="Small size" size="sm"></app-input>
        <app-input label="Medium Input" placeholder="Medium size" size="md"></app-input>
        <app-input label="Large Input" placeholder="Large size" size="lg"></app-input>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Different input sizes available.',
      },
    },
  },
};

export const InputTypes: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [InputComponent],
    },
    template: `
      <div class="space-y-4">
        <app-input label="Text" placeholder="Text input" type="text"></app-input>
        <app-input label="Email" placeholder="email@example.com" type="email"></app-input>
        <app-input label="Password" placeholder="Password" type="password"></app-input>
        <app-input label="Number" placeholder="123" type="number"></app-input>
        <app-input label="Phone" placeholder="+1 (555) 123-4567" type="tel"></app-input>
        <app-input label="URL" placeholder="https://example.com" type="url"></app-input>
        <app-input label="Search" placeholder="Search..." type="search"></app-input>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Different HTML input types supported.',
      },
    },
  },
};

export const FormIntegration: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputComponent],
    },
    props: {
      emailControl: new FormControl(''),
      onSubmit: () => console.log('Form submitted'),
    },
    template: `
      <form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
        <div class="space-y-4">
          <app-input 
            label="Email" 
            placeholder="Enter your email"
            type="email"
            [formControl]="emailControl"
            helperText="Enter a valid email address">
          </app-input>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md">Submit</button>
        </div>
      </form>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Input component integrated with Angular Reactive Forms.',
      },
    },
  },
};

export const ValidationStates: Story = {
  render: () => ({
    moduleMetadata: {
      imports: [InputComponent],
    },
    template: `
      <div class="space-y-4">
        <app-input 
          label="Valid Input" 
          placeholder="This looks good"
          helperText="Great! This input is valid.">
        </app-input>
        <app-input 
          label="Invalid Input" 
          placeholder="This has an error"
          errorMessage="This field is required and cannot be empty.">
        </app-input>
        <app-input 
          label="Required Field" 
          placeholder="Required field"
          required="true"
          helperText="This field is required.">
        </app-input>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'Different validation states of the input component.',
      },
    },
  },
};