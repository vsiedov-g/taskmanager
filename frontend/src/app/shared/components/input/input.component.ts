import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-wrapper">
      <label *ngIf="label" [for]="inputId" [class]="labelClasses">
        {{ label }}
        <span *ngIf="required" class="text-red-500 ml-1">*</span>
      </label>
      
      <div class="relative">
        <div *ngIf="prefixIcon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i [class]="prefixIcon" class="text-gray-400"></i>
        </div>
        
        <input
          [id]="inputId"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [value]="value"
          [class]="inputClasses"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
        />
        
        <div *ngIf="suffixIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <i [class]="suffixIcon" class="text-gray-400"></i>
        </div>
      </div>
      
      <div *ngIf="helperText || errorMessage" class="mt-1">
        <p *ngIf="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
        <p *ngIf="helperText && !errorMessage" class="text-sm text-gray-500">{{ helperText }}</p>
      </div>
    </div>
  `,
  styles: [`
    .input-base {
      @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500;
    }
    
    .input-sm { @apply px-3 py-1.5 text-sm; }
    .input-md { @apply px-3 py-2 text-sm; }
    .input-lg { @apply px-4 py-3 text-base; }
    
    .input-error {
      @apply border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500;
    }
    
    .input-prefix { @apply pl-10; }
    .input-suffix { @apply pr-10; }
    
    .label-base {
      @apply block text-sm font-medium text-gray-700 mb-1;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() errorMessage = '';
  @Input() helperText = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  @Output() inputChange = new EventEmitter<string>();
  @Output() inputFocus = new EventEmitter<void>();
  @Output() inputBlur = new EventEmitter<void>();

  value = '';
  
  private onChange = (value: string) => {};
  private onTouched = () => {};

  get inputClasses(): string {
    const classes = ['input-base', `input-${this.size}`];
    
    if (this.errorMessage) {
      classes.push('input-error');
    }
    
    if (this.prefixIcon) {
      classes.push('input-prefix');
    }
    
    if (this.suffixIcon) {
      classes.push('input-suffix');
    }
    
    return classes.join(' ');
  }

  get labelClasses(): string {
    return 'label-base';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}