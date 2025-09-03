import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../core/services/board.service';
import { CreateBoardRequest } from '../../../../core/models/board.model';

@Component({
  selector: 'app-create-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-board-modal.component.html',
  styleUrl: './create-board-modal.component.scss'
})
export class CreateBoardModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() boardCreated = new EventEmitter<void>();

  private boardService = inject(BoardService);

  isVisible = false;
  isLoading = false;
  errorMessage = '';

  formData: CreateBoardRequest = {
    name: '',
    description: ''
  };

  show() {
    this.isVisible = true;
    this.resetForm();
  }

  hide() {
    this.isVisible = false;
    this.close.emit();
  }

  resetForm() {
    this.formData = {
      name: '',
      description: ''
    };
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.formData.name.trim()) {
      this.errorMessage = 'Board name is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.boardService.createBoard(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.boardCreated.emit();
        this.hide();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create board';
      }
    });
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.hide();
    }
  }
}