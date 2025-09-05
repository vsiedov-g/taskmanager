import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoardRefreshService {
  private boardMembershipChangedSubject = new Subject<string>();
  
  // Observable that components can subscribe to
  boardMembershipChanged$ = this.boardMembershipChangedSubject.asObservable();

  // Method to notify all subscribers that board membership has changed
  notifyBoardMembershipChanged(boardId: string): void {
    this.boardMembershipChangedSubject.next(boardId);
  }
}