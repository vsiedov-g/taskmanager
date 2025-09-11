import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BoardService } from './board.service';
import {
  Board,
  BoardDetails,
  CreateBoardRequest,
  CreateBoardResponse,
  JoinBoardRequest,
  JoinBoardResponse,
  BoardRole,
  BoardMember
} from '../models/board.model';
import { environment } from '../../../environments/environment';

describe('BoardService', () => {
  let service: BoardService;
  let httpMock: HttpTestingController;

  const mockBoard: Board = {
    id: '1',
    name: 'Test Board',
    description: 'Test Description',
    joinCode: 'JOIN123',
    ownerId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    memberCount: 5,
    userRole: BoardRole.Admin
  };

  const mockBoardMember: BoardMember = {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    role: BoardRole.Admin,
    joinedAt: '2024-01-01T00:00:00.000Z'
  };

  const mockBoardDetails: BoardDetails = {
    id: '1',
    name: 'Test Board',
    description: 'Test Description',
    joinCode: 'JOIN123',
    ownerId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    userRole: BoardRole.Admin,
    members: [mockBoardMember]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BoardService]
    });
    service = TestBed.inject(BoardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct API URL', () => {
      expect(service['apiUrl']).toBe(`${environment.apiUrl}/boards`);
    });
  });

  describe('getUserBoards', () => {
    it('should send GET request to boards endpoint', () => {
      const mockBoards: Board[] = [mockBoard];

      service.getUserBoards().subscribe(boards => {
        expect(boards).toEqual(mockBoards);
        expect(boards.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBoards);
    });

    it('should handle empty boards array', () => {
      const emptyBoards: Board[] = [];

      service.getUserBoards().subscribe(boards => {
        expect(boards).toEqual([]);
        expect(boards.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush(emptyBoards);
    });

    it('should handle multiple boards', () => {
      const multipleBoards: Board[] = [
        mockBoard,
        {
          ...mockBoard,
          id: '2',
          name: 'Another Board',
          userRole: BoardRole.Member,
          memberCount: 3
        }
      ];

      service.getUserBoards().subscribe(boards => {
        expect(boards).toEqual(multipleBoards);
        expect(boards.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush(multipleBoards);
    });

    it('should handle HTTP error', () => {
      service.getUserBoards().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized access', () => {
      service.getUserBoards().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getBoardDetails', () => {
    const boardId = '1';

    it('should send GET request to board details endpoint', () => {
      service.getBoardDetails(boardId).subscribe(details => {
        expect(details).toEqual(mockBoardDetails);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/${boardId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockBoardDetails);
    });

    it('should handle board not found', () => {
      service.getBoardDetails('nonexistent').subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/nonexistent`);
      req.flush('Board not found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle board with no members', () => {
      const detailsWithNoMembers: BoardDetails = {
        ...mockBoardDetails,
        members: []
      };

      service.getBoardDetails(boardId).subscribe(details => {
        expect(details.members).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/${boardId}`);
      req.flush(detailsWithNoMembers);
    });

    it('should handle board with multiple members', () => {
      const multipleMembers: BoardMember[] = [
        mockBoardMember,
        {
          id: '2',
          userId: 'user2',
          userName: 'Jane Doe',
          role: BoardRole.Member,
          joinedAt: '2024-01-02T00:00:00.000Z'
        }
      ];

      const detailsWithMultipleMembers: BoardDetails = {
        ...mockBoardDetails,
        members: multipleMembers
      };

      service.getBoardDetails(boardId).subscribe(details => {
        expect(details.members.length).toBe(2);
        expect(details.members).toEqual(multipleMembers);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/${boardId}`);
      req.flush(detailsWithMultipleMembers);
    });

    it('should handle forbidden access to board', () => {
      service.getBoardDetails(boardId).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(403);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/${boardId}`);
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('createBoard', () => {
    const createRequest: CreateBoardRequest = {
      name: 'New Board',
      description: 'New board description'
    };

    const createResponse: CreateBoardResponse = {
      id: '2',
      name: 'New Board',
      description: 'New board description',
      joinCode: 'JOIN456',
      createdAt: '2024-01-01T00:00:00.000Z'
    };

    it('should send POST request to boards endpoint', () => {
      service.createBoard(createRequest).subscribe(response => {
        expect(response).toEqual(createResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(createResponse);
    });

    it('should handle board creation with minimal data', () => {
      const minimalRequest: CreateBoardRequest = {
        name: 'Minimal Board',
        description: ''
      };

      const minimalResponse: CreateBoardResponse = {
        id: '3',
        name: 'Minimal Board',
        description: '',
        joinCode: 'JOIN789',
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      service.createBoard(minimalRequest).subscribe(response => {
        expect(response).toEqual(minimalResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      expect(req.request.body).toEqual(minimalRequest);
      req.flush(minimalResponse);
    });

    it('should handle validation errors', () => {
      const invalidRequest: CreateBoardRequest = {
        name: '',
        description: 'Description without name'
      };

      service.createBoard(invalidRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush('Board name is required', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server errors during creation', () => {
      service.createBoard(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush('Database error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized creation', () => {
      service.createBoard(createRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('joinBoard', () => {
    const joinRequest: JoinBoardRequest = {
      joinCode: 'JOIN123'
    };

    const successResponse: JoinBoardResponse = {
      success: true,
      message: 'Successfully joined board',
      boardId: '1'
    };

    const failureResponse: JoinBoardResponse = {
      success: false,
      message: 'Invalid join code'
    };

    it('should send POST request to join endpoint', () => {
      service.joinBoard(joinRequest).subscribe(response => {
        expect(response).toEqual(successResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(joinRequest);
      req.flush(successResponse);
    });

    it('should handle successful board join', () => {
      service.joinBoard(joinRequest).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.boardId).toBe('1');
        expect(response.message).toBe('Successfully joined board');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush(successResponse);
    });

    it('should handle invalid join code', () => {
      const invalidRequest: JoinBoardRequest = {
        joinCode: 'INVALID'
      };

      service.joinBoard(invalidRequest).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Invalid join code');
        expect(response.boardId).toBeUndefined();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush(failureResponse);
    });

    it('should handle already member scenario', () => {
      const alreadyMemberResponse: JoinBoardResponse = {
        success: false,
        message: 'Already a member of this board',
        boardId: '1'
      };

      service.joinBoard(joinRequest).subscribe(response => {
        expect(response.success).toBe(false);
        expect(response.message).toBe('Already a member of this board');
        expect(response.boardId).toBe('1');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush(alreadyMemberResponse);
    });

    it('should handle HTTP errors during join', () => {
      service.joinBoard(joinRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle unauthorized join attempt', () => {
      service.joinBoard(joinRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle empty join code', () => {
      const emptyRequest: JoinBoardRequest = {
        joinCode: ''
      };

      service.joinBoard(emptyRequest).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush('Join code is required', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Error Handling', () => {
    it('should propagate network errors', () => {
      service.getUserBoards().subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error).toBeDefined();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle timeout errors', () => {
      service.createBoard({ name: 'Test', description: 'Test' }).subscribe({
        next: () => fail('Expected error'),
        error: (error) => {
          expect(error.status).toBe(408);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush('Request timeout', { status: 408, statusText: 'Request Timeout' });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete board workflow: get boards -> create board -> get details', () => {
      // Step 1: Get initial boards (empty)
      service.getUserBoards().subscribe(boards => {
        expect(boards).toEqual([]);
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush([]);

      // Step 2: Create new board
      const createRequest: CreateBoardRequest = {
        name: 'New Board',
        description: 'Test Description'
      };

      service.createBoard(createRequest).subscribe(response => {
        expect(response.name).toBe('New Board');
      });

      req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      expect(req.request.method).toBe('POST');
      req.flush({
        id: '1',
        name: 'New Board',
        description: 'Test Description',
        joinCode: 'JOIN123',
        createdAt: '2024-01-01T00:00:00.000Z'
      });

      // Step 3: Get board details
      service.getBoardDetails('1').subscribe(details => {
        expect(details.name).toBe('New Board');
      });

      req = httpMock.expectOne(`${environment.apiUrl}/boards/1`);
      req.flush(mockBoardDetails);
    });

    it('should handle board join workflow', () => {
      // Step 1: Join board
      service.joinBoard({ joinCode: 'JOIN123' }).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.boardId).toBe('1');
      });

      let req = httpMock.expectOne(`${environment.apiUrl}/boards/join`);
      req.flush({
        success: true,
        message: 'Successfully joined board',
        boardId: '1'
      });

      // Step 2: Get updated boards list
      service.getUserBoards().subscribe(boards => {
        expect(boards.length).toBe(1);
        expect(boards[0].id).toBe('1');
      });

      req = httpMock.expectOne(`${environment.apiUrl}/boards`);
      req.flush([mockBoard]);
    });
  });
});