import type { Meta, StoryObj } from '@storybook/angular';
import { BehaviorSubject, of } from 'rxjs';
import { BoardSelectorComponent } from './board-selector.component';
import { Board, BoardRole, BoardDetails } from '../../../core/models/board.model';
import { BoardService } from '../../../core/services/board.service';
import { BoardRefreshService } from '../../../core/services/board-refresh.service';
import { Router, ActivatedRoute } from '@angular/router';

// Mock data
const mockBoards: Board[] = [
  {
    id: 'board-1',
    name: 'Frontend Development',
    description: 'Tasks related to frontend development',
    joinCode: 'FE2024',
    ownerId: 'user-1',
    createdAt: '2024-01-01T00:00:00Z',
    memberCount: 5,
    userRole: BoardRole.Admin,
  },
  {
    id: 'board-2',
    name: 'Backend API',
    description: 'Backend API development and maintenance',
    joinCode: 'BE2024',
    ownerId: 'user-2',
    createdAt: '2024-01-02T00:00:00Z',
    memberCount: 3,
    userRole: BoardRole.Member,
  },
];

const mockBoardDetails: BoardDetails = {
  ...mockBoards[0],
  members: [
    { id: 'member-1', userId: 'user-1', userName: 'John Doe', role: BoardRole.Admin, joinedAt: '2024-01-01T00:00:00Z' },
    { id: 'member-2', userId: 'user-2', userName: 'Jane Smith', role: BoardRole.Member, joinedAt: '2024-01-02T00:00:00Z' },
  ],
};

// Mock services
class MockBoardService {
  getUserBoards() {
    return of(mockBoards);
  }

  getBoardDetails(boardId: string) {
    const board = mockBoards.find(b => b.id === boardId);
    if (board) {
      return of({ ...mockBoardDetails, ...board });
    }
    return of(mockBoardDetails);
  }
}

class MockBoardRefreshService {
  private membershipChangedSubject = new BehaviorSubject<string | null>(null);
  boardMembershipChanged$ = this.membershipChangedSubject.asObservable();
}

class MockRouter {
  navigate(commands: any[], extras?: any) {
    console.log('Navigation:', commands, extras);
    return Promise.resolve(true);
  }
}

class MockActivatedRoute {
  queryParams = new BehaviorSubject({ boardId: 'board-1' });
}

const meta: Meta<BoardSelectorComponent> = {
  title: 'Components/BoardSelector',
  component: BoardSelectorComponent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A board selector dropdown component that allows users to switch between different project boards and navigate to board management.',
      },
    },
  },
  decorators: [
    (story) => ({
      template: `<div class="w-80 p-4">${story()}</div>`,
      moduleMetadata: {
        imports: [BoardSelectorComponent],
        providers: [
          { provide: BoardService, useClass: MockBoardService },
          { provide: BoardRefreshService, useClass: MockBoardRefreshService },
          { provide: Router, useClass: MockRouter },
          { provide: ActivatedRoute, useClass: MockActivatedRoute },
        ],
      },
    }),
  ],
  argTypes: {
    boardSelected: {
      action: 'boardSelected',
      description: 'Event emitted when a board is selected',
    },
  },
};

export default meta;
type Story = StoryObj<BoardSelectorComponent>;

export const Default: Story = {};