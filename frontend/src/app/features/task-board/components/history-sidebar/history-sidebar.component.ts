import { Component, Output, EventEmitter, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ActivityLog } from '../../models/activity-log.model';
import { ActivityLogActions } from '../../store/actions/activity-log.actions';
import {
  selectActivityLogsSorted,
  selectActivityLogLoading,
  selectActivityLogLoadingMore,
  selectActivityLogHasNextPage,
  selectActivityLogError
} from '../../store/selectors/activity-log.selectors';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-history-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-sidebar.component.html',
  styleUrl: './history-sidebar.component.scss'
})
export class HistorySidebarComponent implements OnInit {
  @Output() closeSidebar = new EventEmitter<void>();
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef<HTMLDivElement>;

  private store = inject(Store);
  private authService = inject(AuthService);

  // Scroll state
  isScrolledNearEnd = false;

  // Store selectors
  activityLogs$: Observable<ActivityLog[]> = this.store.select(selectActivityLogsSorted);
  loading$ = this.store.select(selectActivityLogLoading);
  loadingMore$ = this.store.select(selectActivityLogLoadingMore);
  hasNextPage$ = this.store.select(selectActivityLogHasNextPage);
  error$ = this.store.select(selectActivityLogError);

  ngOnInit(): void {
    // Load initial activity logs when component initializes
    this.store.dispatch(ActivityLogActions.loadRecentActivityLogs({ page: 1, pageSize: 20 }));
  }

  onClose(): void {
    this.closeSidebar.emit();
  }

  onShowMore(): void {
    // Load more activity logs from the API
    this.store.dispatch(ActivityLogActions.loadMoreRecentActivityLogs());
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLDivElement;
    const threshold = 100; // pixels from bottom
    const position = element.scrollTop + element.offsetHeight;
    const height = element.scrollHeight;
    
    this.isScrolledNearEnd = position >= height - threshold;
  }

  formatTimestamp(timestampStr: string): string {
    const timestamp = new Date(timestampStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const entryDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const month = months[timestamp.getMonth()];
    const day = timestamp.getDate();
    const hours = timestamp.getHours();
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    const hour12 = hours % 12 || 12;
    
    return `${month} ${day} at ${hour12}:${minutes} ${period}`;
  }

  getActivityText(activityLog: ActivityLog): string {
    // Use the description from the backend if available, otherwise fallback to action
    if (activityLog.description) {
      return activityLog.description;
    }
    
    // Fallback formatting based on action type
    switch (activityLog.action.toLowerCase()) {
      case 'create':
        return `created ${activityLog.card?.title || 'item'}`;
      case 'update':
        return `updated ${activityLog.card?.title || 'item'}`;
      case 'move':
        return `moved ${activityLog.card?.title || 'item'}`;
      case 'delete':
        return `deleted ${activityLog.card?.title || 'item'}`;
      case 'assign':
        return `assigned ${activityLog.card?.title || 'item'}`;
      default:
        return `${activityLog.action.toLowerCase()} ${activityLog.card?.title || 'item'}`;
    }
  }

  getFullActivityDescription(activityLog: ActivityLog): string {
    const userName = this.getUserFullName(activityLog);
    const activityText = this.getActivityText(activityLog);
    return `${userName} ${activityText}`;
  }

  getUserFullName(activityLog: ActivityLog): string {
    if (activityLog.user) {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && activityLog.userId === currentUser.id) {
        return 'You';
      }
      return `${activityLog.user.firstName} ${activityLog.user.lastName}`.trim();
    }
    return 'Unknown User';
  }
}