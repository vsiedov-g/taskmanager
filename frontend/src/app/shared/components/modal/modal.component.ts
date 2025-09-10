import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isOpen" 
      class="fixed inset-0 z-50 overflow-y-auto"
      [attr.aria-labelledby]="modalId + '-title'"
      [attr.aria-describedby]="modalId + '-description'"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        [class.opacity-100]="showBackdrop"
        [class.opacity-0]="!showBackdrop"
        (click)="onBackdropClick()"
      ></div>
      
      <!-- Modal -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div 
          [class]="modalClasses"
          [class.scale-100]="showModal"
          [class.opacity-100]="showModal"
          [class.scale-95]="!showModal"
          [class.opacity-0]="!showModal"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200" *ngIf="title || showCloseButton">
            <h3 [id]="modalId + '-title'" class="text-lg font-semibold text-gray-900">
              {{ title }}
            </h3>
            <button 
              *ngIf="showCloseButton"
              type="button"
              class="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              (click)="close()"
              aria-label="Close modal"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-6" [id]="modalId + '-description'">
            <ng-content></ng-content>
          </div>
          
          <!-- Footer -->
          <div class="flex justify-end space-x-3 p-6 border-t border-gray-200" *ngIf="showFooter">
            <ng-content select="[slot=footer]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-base {
      @apply relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all duration-300 ease-in-out;
    }
    
    .modal-sm { @apply max-w-sm; }
    .modal-md { @apply max-w-md; }
    .modal-lg { @apply max-w-lg; }
    .modal-xl { @apply max-w-4xl; }
    .modal-full { @apply max-w-full mx-4; }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: ModalSize = 'md';
  @Input() showCloseButton = true;
  @Input() showFooter = false;
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() modalId = `modal-${Math.random().toString(36).substr(2, 9)}`;

  @Output() closed = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  showBackdrop = false;
  showModal = false;

  private keydownListener?: (event: KeyboardEvent) => void;

  ngOnInit(): void {
    if (this.isOpen) {
      this.open();
    }

    if (this.closeOnEscape) {
      this.keydownListener = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.keydownListener);
    }
  }

  ngOnDestroy(): void {
    if (this.keydownListener) {
      document.removeEventListener('keydown', this.keydownListener);
    }
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  }

  get modalClasses(): string {
    return `modal-base modal-${this.size} w-full transition-all duration-300 ease-in-out`;
  }

  open(): void {
    setTimeout(() => {
      this.showBackdrop = true;
      setTimeout(() => {
        this.showModal = true;
        this.opened.emit();
      }, 50);
    }, 10);
  }

  close(): void {
    this.showModal = false;
    setTimeout(() => {
      this.showBackdrop = false;
      setTimeout(() => {
        this.isOpen = false;
        this.closed.emit();
      }, 150);
    }, 150);
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop) {
      this.close();
    }
  }
}