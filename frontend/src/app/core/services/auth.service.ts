import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignInRequest {
  name: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  password: string;
}

@Injectable({ 
  providedIn: 'root' 
})
export class AuthService {
  private http = inject(HttpClient);
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  
  currentUser$ = this.currentUserSubject.asObservable();

  signIn(request: SignInRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signin`, request).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      })
    );
  }

  signUp(request: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, request).pipe(
      tap(response => {
        this.setAuthData(response.token, response.user);
      })
    );
  }

  signOut(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    // Check if both token and user exist
    if (!token || !user) {
      this.signOut(); // Clean up any partial auth state
      return false;
    }
    
    // Basic JWT expiration check (optional - the server will validate)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp && (Date.now() >= payload.exp * 1000);
      if (isExpired) {
        this.signOut();
        return false;
      }
    } catch (e) {
      // If token is malformed, sign out
      this.signOut();
      return false;
    }
    
    return true;
  }

  private setAuthData(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }
}