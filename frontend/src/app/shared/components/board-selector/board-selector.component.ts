import { Component, inject, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BoardService } from '../../../core/services/board.service';
import { BoardRefreshService } from '../../../core/services/board-refresh.service';
import { Board, BoardDetails } from '../../../core/models/board.model';

@Component({
  selector: 'app-board-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-selector.component.html',
  styleUrl: './board-selector.component.scss'
})
export class BoardSelectorComponent implements OnInit, OnDestroy {
  @Output() boardSelected = new EventEmitter<Board>();

  private boardService = inject(BoardService);
  private boardRefreshService = inject(BoardRefreshService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  boards$!: Observable<Board[]>;
  currentBoard: Board | null = null;
  isDropdownOpen = false;
  currentBoardId: string | null = null;

  ngOnInit() {
    this.loadBoards();
    this.getCurrentBoardFromRoute();
    this.subscribeToMembershipChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToMembershipChanges() {
    this.boardRefreshService.boardMembershipChanged$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((boardId) => {
      // Refresh board data if the change affects the current board or all boards
      if (!boardId || boardId === this.currentBoardId) {
        this.refreshBoardData();
      }
    });
  }

  loadBoards() {
    this.boards$ = this.boardService.getUserBoards();
  }

  getCurrentBoardFromRoute() {
    this.route.queryParams.subscribe(params => {
      this.currentBoardId = params['boardId'] || null;
      if (this.currentBoardId) {
        this.loadCurrentBoard();
      }
    });
  }

  loadCurrentBoard() {
    if (this.currentBoardId) {
      this.boardService.getBoardDetails(this.currentBoardId).subscribe({
        next: (boardDetails) => {
          this.currentBoard = {
            id: boardDetails.id,
            name: boardDetails.name,
            description: boardDetails.description,
            joinCode: boardDetails.joinCode,
            ownerId: boardDetails.ownerId,
            createdAt: boardDetails.createdAt,
            userRole: boardDetails.userRole,
            memberCount: boardDetails.members.length
          };
        },
        error: (error) => {
          console.error('Failed to load board details:', error);
        }
      });
    }
  }

  // Public method to refresh board data - can be called from parent components
  refreshBoardData() {
    this.loadBoards();
    this.loadCurrentBoard();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  onBoardSelect(board: Board) {
    this.currentBoard = board;
    this.currentBoardId = board.id;
    this.closeDropdown();
    this.boardSelected.emit(board);
    this.router.navigate(['/task-board'], { queryParams: { boardId: board.id } });
  }

  onGoToBoards() {
    this.closeDropdown();
    this.router.navigate(['/boards']);
  }

  onClickOutside(event: Event) {
    if (event.target && !(event.target as Element).closest('.board-selector')) {
      this.closeDropdown();
    }
  }

  trackByBoardId(index: number, board: Board): string {
    return board.id;
  }
}