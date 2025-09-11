import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, AuthResponse, SignInRequest, SignUpRequest, User } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    name: 'John Doe'
  };

  const mockAuthResponse: AuthResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lkb7zjG4XyHKiuWCIXHPQhOdHXmE3eOl1O5dA5n3N1k',
    user: mockUser
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize currentUser$ with null when no stored user', () => {
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });

    it('should initialize currentUser$ with stored user if exists', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      const newService = TestBed.inject(AuthService);
      
      newService.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });
  });

  describe('signIn', () => {
    it('should send POST request to signin endpoint', () => {
      const signInRequest: SignInRequest = {
        name: 'john@example.com',
        password: 'password123'
      };

      service.signIn(signInRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signInRequest);
      req.flush(mockAuthResponse);
    });

    it('should store auth data on successful signin', () => {
      const signInRequest: SignInRequest = {
        name: 'john@example.com',
        password: 'password123'
      };

      service.signIn(signInRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
      expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockUser));
    });

    it('should update currentUser$ subject on successful signin', () => {
      const signInRequest: SignInRequest = {
        name: 'john@example.com',
        password: 'password123'
      };

      service.signIn(signInRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockAuthResponse);

      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });

    it('should handle signin error', () => {
      const signInRequest: SignInRequest = {
        name: 'wrong@example.com',
        password: 'wrongpassword'
      };

      service.signIn(signInRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('signUp', () => {
    it('should send POST request to signup endpoint', () => {
      const signUpRequest: SignUpRequest = {
        name: 'john@example.com',
        password: 'password123'
      };

      service.signUp(signUpRequest).subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signUpRequest);
      req.flush(mockAuthResponse);
    });

    it('should store auth data on successful signup', () => {
      const signUpRequest: SignUpRequest = {
        name: 'john@example.com',
        password: 'password123'
      };

      service.signUp(signUpRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
      req.flush(mockAuthResponse);

      expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
      expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockUser));
    });

    it('should handle signup error', () => {
      const signUpRequest: SignUpRequest = {
        name: 'existing@example.com',
        password: 'password123'
      };

      service.signUp(signUpRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
      req.flush('User already exists', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));
    });

    it('should remove token from localStorage', () => {
      service.signOut();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should remove user from localStorage', () => {
      service.signOut();
      expect(localStorage.getItem('current_user')).toBeNull();
    });

    it('should set currentUser$ to null', () => {
      service.signOut();
      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
      });
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      const testToken = 'test-auth-token';
      localStorage.setItem('auth_token', testToken);

      expect(service.getToken()).toBe(testToken);
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null if no user exists', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('current_user', 'invalid-json');

      expect(() => service.getCurrentUser()).toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when both token and user exist and token is valid', () => {
      localStorage.setItem('auth_token', mockAuthResponse.token);
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when no user exists', () => {
      localStorage.setItem('auth_token', mockAuthResponse.token);

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false and sign out when token is expired', () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      localStorage.setItem('auth_token', expiredToken);
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
    });

    it('should return false and sign out when token is malformed', () => {
      localStorage.setItem('auth_token', 'malformed-token');
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('current_user')).toBeNull();
    });

    it('should clean up partial auth state when only token exists', () => {
      localStorage.setItem('auth_token', mockAuthResponse.token);

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should clean up partial auth state when only user exists', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));

      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('current_user')).toBeNull();
    });
  });

  describe('setAuthData (private method behavior)', () => {
    it('should store both token and user data and update subject', () => {
      const signInRequest: SignInRequest = {
        name: 'test@example.com',
        password: 'password'
      };

      service.signIn(signInRequest).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockAuthResponse);

      // Verify all three actions happened
      expect(localStorage.getItem('auth_token')).toBe(mockAuthResponse.token);
      expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockUser));
      
      service.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });
  });

  describe('Error Handling', () => {
    it('should propagate HTTP errors in signIn', () => {
      const signInRequest: SignInRequest = {
        name: 'test@example.com',
        password: 'password'
      };

      service.signIn(signInRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should propagate HTTP errors in signUp', () => {
      const signUpRequest: SignUpRequest = {
        name: 'test@example.com',
        password: 'password'
      };

      service.signUp(signUpRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signup`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete auth flow: signin -> check auth -> signout', () => {
      // Step 1: Sign in
      const signInRequest: SignInRequest = {
        name: 'test@example.com',
        password: 'password'
      };

      service.signIn(signInRequest).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockAuthResponse);

      // Step 2: Verify authenticated
      expect(service.isAuthenticated()).toBe(true);

      // Step 3: Sign out
      service.signOut();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should maintain currentUser$ state across operations', () => {
      let currentUserChanges: (User | null)[] = [];
      
      service.currentUser$.subscribe(user => {
        currentUserChanges.push(user);
      });

      // Initial state should be null
      expect(currentUserChanges).toEqual([null]);

      // Sign in
      service.signIn({ name: 'test', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/auth/signin`);
      req.flush(mockAuthResponse);

      // Should now have user
      expect(currentUserChanges).toEqual([null, mockUser]);

      // Sign out
      service.signOut();

      // Should be null again
      expect(currentUserChanges).toEqual([null, mockUser, null]);
    });
  });
});