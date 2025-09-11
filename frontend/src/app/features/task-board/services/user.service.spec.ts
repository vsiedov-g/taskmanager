import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, User } from './user.service';
import { environment } from '../../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  const mockUsers: User[] = [
    mockUser,
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    },
    {
      id: '3',
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty users observable', (done) => {
      service.users$.subscribe(users => {
        expect(users).toEqual([]);
        done();
      });
    });

    it('should have users$ observable defined', () => {
      expect(service.users$).toBeDefined();
    });
  });

  describe('loadUsers', () => {
    it('should send GET request and update users observable', () => {
      let usersFromObservable: User[] = [];

      // Subscribe to users$ to capture the updated values
      service.users$.subscribe(users => {
        usersFromObservable = users;
      });

      service.loadUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(usersFromObservable).toEqual(mockUsers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle empty users array', () => {
      let usersFromObservable: User[] = [];

      service.users$.subscribe(users => {
        usersFromObservable = users;
      });

      service.loadUsers().subscribe(users => {
        expect(users).toEqual([]);
        expect(usersFromObservable).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush([]);
    });

    it('should handle HTTP error', () => {
      service.loadUsers().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized access', () => {
      service.loadUsers().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should update users observable on subsequent calls', () => {
      const updatedUsers: User[] = [
        { ...mockUser, firstName: 'Updated John' }
      ];

      let callCount = 0;
      const receivedUserArrays: User[][] = [];

      service.users$.subscribe(users => {
        receivedUserArrays.push([...users]);
        callCount++;
      });

      // First call
      service.loadUsers().subscribe();
      let req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(mockUsers);

      // Second call with updated data
      service.loadUsers().subscribe();
      req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(updatedUsers);

      expect(callCount).toBe(3); // Initial empty, first load, second load
      expect(receivedUserArrays[0]).toEqual([]); // Initial
      expect(receivedUserArrays[1]).toEqual(mockUsers); // First load
      expect(receivedUserArrays[2]).toEqual(updatedUsers); // Second load
    });
  });

  describe('getUsers', () => {
    it('should send GET request to users endpoint', () => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual(mockUsers);
        expect(users.length).toBe(3);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUsers);
    });

    it('should handle empty users array', () => {
      service.getUsers().subscribe(users => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush([]);
    });

    it('should not update users observable', () => {
      let usersFromObservable: User[] = [];
      let observableCallCount = 0;

      service.users$.subscribe(users => {
        usersFromObservable = users;
        observableCallCount++;
      });

      service.getUsers().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(mockUsers);

      // Should only have initial empty value, no update from getUsers
      expect(observableCallCount).toBe(1);
      expect(usersFromObservable).toEqual([]);
    });

    it('should handle server errors', () => {
      service.getUsers().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush('Database error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network errors', () => {
      service.getUsers().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.error(new ErrorEvent('Network error'));
    });
  });

  describe('getUserById', () => {
    const userId = '1';

    it('should send GET request to user by ID endpoint', () => {
      service.getUserById(userId).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle user not found', () => {
      service.getUserById('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/nonexistent`);
      req.flush('User not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle server error', () => {
      service.getUserById(userId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized access', () => {
      service.getUserById(userId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle forbidden access', () => {
      service.getUserById(userId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/${userId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('getUserDisplayName', () => {
    it('should return full name for user with both first and last name', () => {
      const displayName = service.getUserDisplayName(mockUser);
      expect(displayName).toBe('John Doe');
    });

    it('should return first name only when last name is empty', () => {
      const userWithFirstNameOnly: User = {
        id: '1',
        firstName: 'John',
        lastName: '',
        email: 'john@example.com'
      };

      const displayName = service.getUserDisplayName(userWithFirstNameOnly);
      expect(displayName).toBe('John');
    });

    it('should return last name only when first name is empty', () => {
      const userWithLastNameOnly: User = {
        id: '1',
        firstName: '',
        lastName: 'Doe',
        email: 'doe@example.com'
      };

      const displayName = service.getUserDisplayName(userWithLastNameOnly);
      expect(displayName).toBe('Doe');
    });

    it('should return empty string when both names are empty', () => {
      const userWithNoName: User = {
        id: '1',
        firstName: '',
        lastName: '',
        email: 'user@example.com'
      };

      const displayName = service.getUserDisplayName(userWithNoName);
      expect(displayName).toBe('');
    });

    it('should handle names with extra whitespace', () => {
      const userWithWhitespace: User = {
        id: '1',
        firstName: '  John  ',
        lastName: '  Doe  ',
        email: 'john@example.com'
      };

      const displayName = service.getUserDisplayName(userWithWhitespace);
      expect(displayName).toBe('John   Doe');
    });

    it('should handle undefined names gracefully', () => {
      const userWithUndefinedNames: User = {
        id: '1',
        firstName: undefined as any,
        lastName: undefined as any,
        email: 'user@example.com'
      };

      const displayName = service.getUserDisplayName(userWithUndefinedNames);
      expect(displayName).toBe('');
    });

    it('should handle single character names', () => {
      const userWithSingleCharNames: User = {
        id: '1',
        firstName: 'J',
        lastName: 'D',
        email: 'jd@example.com'
      };

      const displayName = service.getUserDisplayName(userWithSingleCharNames);
      expect(displayName).toBe('J D');
    });
  });

  describe('getUserInitials', () => {
    it('should return initials for user with both first and last name', () => {
      const initials = service.getUserInitials(mockUser);
      expect(initials).toBe('JD');
    });

    it('should return first name initial only when last name is empty', () => {
      const userWithFirstNameOnly: User = {
        id: '1',
        firstName: 'John',
        lastName: '',
        email: 'john@example.com'
      };

      const initials = service.getUserInitials(userWithFirstNameOnly);
      expect(initials).toBe('J');
    });

    it('should return last name initial only when first name is empty', () => {
      const userWithLastNameOnly: User = {
        id: '1',
        firstName: '',
        lastName: 'Doe',
        email: 'doe@example.com'
      };

      const initials = service.getUserInitials(userWithLastNameOnly);
      expect(initials).toBe('D');
    });

    it('should return empty string when both names are empty', () => {
      const userWithNoName: User = {
        id: '1',
        firstName: '',
        lastName: '',
        email: 'user@example.com'
      };

      const initials = service.getUserInitials(userWithNoName);
      expect(initials).toBe('');
    });

    it('should handle lowercase names and convert to uppercase', () => {
      const userWithLowercaseNames: User = {
        id: '1',
        firstName: 'john',
        lastName: 'doe',
        email: 'john@example.com'
      };

      const initials = service.getUserInitials(userWithLowercaseNames);
      expect(initials).toBe('JD');
    });

    it('should handle mixed case names', () => {
      const userWithMixedCaseNames: User = {
        id: '1',
        firstName: 'jOhN',
        lastName: 'dOe',
        email: 'john@example.com'
      };

      const initials = service.getUserInitials(userWithMixedCaseNames);
      expect(initials).toBe('JD');
    });

    it('should handle undefined names gracefully', () => {
      const userWithUndefinedNames: User = {
        id: '1',
        firstName: undefined as any,
        lastName: undefined as any,
        email: 'user@example.com'
      };

      const initials = service.getUserInitials(userWithUndefinedNames);
      expect(initials).toBe('');
    });

    it('should handle null names gracefully', () => {
      const userWithNullNames: User = {
        id: '1',
        firstName: null as any,
        lastName: null as any,
        email: 'user@example.com'
      };

      const initials = service.getUserInitials(userWithNullNames);
      expect(initials).toBe('');
    });

    it('should handle names with special characters', () => {
      const userWithSpecialChars: User = {
        id: '1',
        firstName: 'José',
        lastName: 'María',
        email: 'jose@example.com'
      };

      const initials = service.getUserInitials(userWithSpecialChars);
      expect(initials).toBe('JM');
    });

    it('should handle names with numbers', () => {
      const userWithNumbers: User = {
        id: '1',
        firstName: '2John',
        lastName: '3Doe',
        email: 'john@example.com'
      };

      const initials = service.getUserInitials(userWithNumbers);
      expect(initials).toBe('23');
    });

    it('should handle very long names', () => {
      const userWithLongNames: User = {
        id: '1',
        firstName: 'VeryLongFirstNameThatExceedsNormalLength',
        lastName: 'VeryLongLastNameThatExceedsNormalLength',
        email: 'long@example.com'
      };

      const initials = service.getUserInitials(userWithLongNames);
      expect(initials).toBe('VV');
    });
  });

  describe('BehaviorSubject Behavior', () => {
    it('should emit current value to new subscribers', () => {
      // Load some users first
      service.loadUsers().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(mockUsers);

      // New subscriber should immediately get the current value
      service.users$.subscribe(users => {
        expect(users).toEqual(mockUsers);
      });
    });

    it('should support multiple subscribers', () => {
      let subscriber1Users: User[] = [];
      let subscriber2Users: User[] = [];

      const sub1 = service.users$.subscribe(users => {
        subscriber1Users = users;
      });

      const sub2 = service.users$.subscribe(users => {
        subscriber2Users = users;
      });

      service.loadUsers().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(mockUsers);

      expect(subscriber1Users).toEqual(mockUsers);
      expect(subscriber2Users).toEqual(mockUsers);

      sub1.unsubscribe();
      sub2.unsubscribe();
    });

    it('should continue working after one subscriber unsubscribes', () => {
      let sub1Users: User[] = [];
      let sub2Users: User[] = [];

      const sub1 = service.users$.subscribe(users => {
        sub1Users = users;
      });

      const sub2 = service.users$.subscribe(users => {
        sub2Users = users;
      });

      service.loadUsers().subscribe();
      let req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(mockUsers);

      expect(sub1Users).toEqual(mockUsers);
      expect(sub2Users).toEqual(mockUsers);

      sub1.unsubscribe();

      // Load new data
      service.loadUsers().subscribe();
      req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush([mockUser]); // Different data

      expect(sub1Users).toEqual(mockUsers); // Should not change
      expect(sub2Users).toEqual([mockUser]); // Should update

      sub2.unsubscribe();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user workflow: load users -> get specific user -> display name/initials', () => {
      // Step 1: Load all users
      service.loadUsers().subscribe(users => {
        expect(users.length).toBe(3);
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(mockUsers);

      // Step 2: Get specific user
      service.getUserById('1').subscribe(user => {
        expect(user).toEqual(mockUser);

        // Step 3: Get display name and initials
        const displayName = service.getUserDisplayName(user);
        const initials = service.getUserInitials(user);

        expect(displayName).toBe('John Doe');
        expect(initials).toBe('JD');
      });

      req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush(mockUser);
    });

    it('should handle user data updates through loadUsers', () => {
      const initialUsers = [mockUser];
      const updatedUsers = [...mockUsers];

      // Initial load
      service.loadUsers().subscribe();
      let req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(initialUsers);

      // Verify initial state
      service.users$.subscribe(users => {
        if (users.length === 1) {
          expect(users).toEqual(initialUsers);
        } else if (users.length === 3) {
          expect(users).toEqual(updatedUsers);
        }
      });

      // Updated load
      service.loadUsers().subscribe();
      req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush(updatedUsers);
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors from loadUsers', () => {
      service.loadUsers().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      service.getUsers().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(408);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users`);
      req.flush('Request timeout', { status: 408, statusText: 'Request Timeout' });
    });

    it('should handle rate limiting errors', () => {
      service.getUserById('1').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(429);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/1`);
      req.flush('Too many requests', { status: 429, statusText: 'Too Many Requests' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', () => {
      service.getUserById('').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/users/`);
      req.flush('Invalid user ID', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle user with only spaces in names', () => {
      const userWithSpaces: User = {
        id: '1',
        firstName: '   ',
        lastName: '   ',
        email: 'user@example.com'
      };

      const displayName = service.getUserDisplayName(userWithSpaces);
      const initials = service.getUserInitials(userWithSpaces);

      expect(displayName).toBe('');
      expect(initials).toBe('');
    });

    it('should handle concurrent loadUsers calls', () => {
      // Start two concurrent loads
      service.loadUsers().subscribe();
      service.loadUsers().subscribe();

      // Should make two separate HTTP requests
      const req1 = httpMock.expectOne(`${environment.apiUrl}/users`);
      const req2 = httpMock.expectOne(`${environment.apiUrl}/users`);

      req1.flush(mockUsers);
      req2.flush([mockUser]); // Different response

      // The BehaviorSubject should emit the last received value
      service.users$.subscribe(users => {
        // Could be either mockUsers or [mockUser] depending on response order
        expect(users.length).toBeGreaterThan(0);
      });
    });
  });
});