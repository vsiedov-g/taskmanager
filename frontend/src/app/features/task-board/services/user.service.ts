import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable({ 
  providedIn: 'root' 
})
export class UserService {
  private http = inject(HttpClient);
  private usersSubject = new BehaviorSubject<User[]>([]);
  
  users$ = this.usersSubject.asObservable();

  loadUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`).pipe(
      tap(users => this.usersSubject.next(users))
    );
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  getUserInitials(user: User): string {
    const firstName = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastName = user.lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstName}${lastName}`;
  }
}