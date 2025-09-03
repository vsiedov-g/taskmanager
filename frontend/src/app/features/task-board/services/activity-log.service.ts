import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ActivityLog, ActivityLogFilters } from '../models/activity-log.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/activitylogs`;

  getActivityLogs(page: number = 1, pageSize: number = 20): Observable<ActivityLog[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ActivityLog[]>(this.baseUrl, { params });
  }

  getActivityLogById(id: string): Observable<ActivityLog> {
    return this.http.get<ActivityLog>(`${this.baseUrl}/${id}`);
  }

  getActivityLogsByCard(cardId: string, page: number = 1, pageSize: number = 20): Observable<ActivityLog[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/by-card/${cardId}`, { params });
  }

  getActivityLogsByUser(userId: string): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/by-user/${userId}`);
  }

  getRecentActivityLogs(page: number = 1, pageSize: number = 20): Observable<ActivityLog[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ActivityLog[]>(this.baseUrl, { params });
  }

  createActivityLog(activityLog: Omit<ActivityLog, 'id' | 'createdAt' | 'user' | 'card'>): Observable<ActivityLog> {
    return this.http.post<ActivityLog>(this.baseUrl, activityLog);
  }

  updateActivityLog(id: string, activityLog: Partial<ActivityLog>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, activityLog);
  }

  deleteActivityLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getFilteredActivityLogs(filters: ActivityLogFilters, page: number = 1, pageSize: number = 20): Observable<ActivityLog[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters.cardId) {
      return this.getActivityLogsByCard(filters.cardId);
    }

    if (filters.userId) {
      return this.getActivityLogsByUser(filters.userId);
    }

    // For other filters, we'd need to extend the backend API
    // For now, just return the regular paginated results
    return this.getActivityLogs(page, pageSize);
  }
}