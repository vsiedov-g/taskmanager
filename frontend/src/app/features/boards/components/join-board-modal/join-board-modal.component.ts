import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BoardService } from '../../../../core/services/board.service';
import { JoinBoardRequest } from '../../../../core/models/board.model';

@Component({
  selector: 'app-join-board-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './join-board-modal.component.html',
  styleUrl: './join-board-modal.component.scss'
})
export class JoinBoardModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() boardJoined = new EventEmitter<void>();

  private boardService = inject(BoardService);
  private router = inject(Router);

  isVisible = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  formData: JoinBoardRequest = {
    joinCode: ''
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
      joinCode: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    if (!this.formData.joinCode.trim()) {
      this.errorMessage = 'Join code is required';
      return;
    }

    if (this.formData.joinCode.length !== 6) {
      this.errorMessage = 'Join code must be 6 characters long';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.boardService.joinBoard(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.boardId) {
          this.successMessage = 'Successfully joined the board!';
          this.boardJoined.emit();
          setTimeout(() => {
            this.router.navigate(['/task-board'], { queryParams: { boardId: response.boardId } });
            this.hide();
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Failed to join board';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to join board';
      }
    });
  }

  onJoinCodeChange() {
    this.formData.joinCode = this.formData.joinCode.toUpperCase();
    if (this.errorMessage) {
      this.errorMessage = '';
    }
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.hide();
    }
  }
}