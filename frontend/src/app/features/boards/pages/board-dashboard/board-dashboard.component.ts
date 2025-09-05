import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { BoardService } from '../../../../core/services/board.service';
import { AuthService } from '../../../../core/services/auth.service';
import { BoardRefreshService } from '../../../../core/services/board-refresh.service';
import { Board } from '../../../../core/models/board.model';
import { CreateBoardModalComponent } from '../../components/create-board-modal/create-board-modal.component';
import { JoinBoardModalComponent } from '../../components/join-board-modal/join-board-modal.component';

@Component({
  selector: 'app-board-dashboard',
  standalone: true,
  imports: [CommonModule, CreateBoardModalComponent, JoinBoardModalComponent],
  templateUrl: './board-dashboard.component.html',
  styleUrl: './board-dashboard.component.scss'
})
export class BoardDashboardComponent implements OnInit {
  @ViewChild('createModal') createModal!: CreateBoardModalComponent;
  @ViewChild('joinModal') joinModal!: JoinBoardModalComponent;

  private boardService = inject(BoardService);
  private authService = inject(AuthService);
  private boardRefreshService = inject(BoardRefreshService);
  private router = inject(Router);
  
  boards$!: Observable<Board[]>;
  isLoading = false;
  copiedBoardIds = new Set<string>();

  ngOnInit() {
    this.loadBoards();
  }

  loadBoards() {
    this.isLoading = true;
    this.boards$ = this.boardService.getUserBoards();
    this.boards$.subscribe(() => {
      this.isLoading = false;
    });
  }

  onBoardSelect(board: Board) {
    this.router.navigate(['/task-board'], { queryParams: { boardId: board.id } });
  }

  onCreateBoard() {
    this.createModal.show();
  }

  onJoinBoard() {
    this.joinModal.show();
  }

  onBoardCreated() {
    this.loadBoards();
  }

  onBoardJoined() {
    this.loadBoards();
    // Notify all components that board membership has changed
    this.boardRefreshService.notifyBoardMembershipChanged('');
  }

  onSignOut() {
    this.authService.signOut();
    this.router.navigate(['/auth/sign-in']);
  }

  async copyJoinCode(joinCode: string, boardId: string) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(joinCode);
      } else {
        this.fallbackCopyText(joinCode);
      }
      
      // Add visual feedback
      this.copiedBoardIds.add(boardId);
      setTimeout(() => {
        this.copiedBoardIds.delete(boardId);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy join code:', err);
      this.fallbackCopyText(joinCode);
      
      // Add visual feedback even for fallback
      this.copiedBoardIds.add(boardId);
      setTimeout(() => {
        this.copiedBoardIds.delete(boardId);
      }, 2000);
    }
  }

  isCopied(boardId: string): boolean {
    return this.copiedBoardIds.has(boardId);
  }

  private fallbackCopyText(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      console.log('Join code copied to clipboard (fallback)');
    } catch (err) {
      console.error('Failed to copy join code', err);
    }
    
    document.body.removeChild(textArea);
  }
}