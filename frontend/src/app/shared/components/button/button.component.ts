import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="buttonClasses"
      [disabled]="disabled || loading"
      [type]="type"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn-base {
      @apply inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
    }
    
    .btn-xs { @apply px-2 py-1 text-xs; }
    .btn-sm { @apply px-3 py-1.5 text-sm; }
    .btn-md { @apply px-4 py-2 text-sm; }
    .btn-lg { @apply px-6 py-3 text-base; }
    
    .btn-primary { @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500; }
    .btn-secondary { @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500; }
    .btn-danger { @apply bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 focus:ring-red-500; }
    .btn-success { @apply bg-green-600 text-white hover:bg-green-700 focus:ring-green-500; }
    .btn-outline { @apply bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500; }
    
    .spinner {
      @apply inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() fullWidth = false;
  
  @Output() clicked = new EventEmitter<Event>();

  get buttonClasses(): string {
    const classes = [
      'btn-base',
      `btn-${this.size}`,
      `btn-${this.variant}`,
    ];
    
    if (this.fullWidth) {
      classes.push('w-full');
    }
    
    return classes.join(' ');
  }

  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}