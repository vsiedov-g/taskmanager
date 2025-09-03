export interface Board {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  ownerId: string;
  createdAt: string;
  memberCount: number;
  userRole: BoardRole;
}

export interface BoardDetails {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  ownerId: string;
  createdAt: string;
  userRole: BoardRole;
  members: BoardMember[];
}

export interface BoardMember {
  id: string;
  userId: string;
  userName: string;
  role: BoardRole;
  joinedAt: string;
}

export interface CreateBoardRequest {
  name: string;
  description: string;
}

export interface CreateBoardResponse {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  createdAt: string;
}

export interface JoinBoardRequest {
  joinCode: string;
}

export interface JoinBoardResponse {
  success: boolean;
  message: string;
  boardId?: string;
}

export enum BoardRole {
  Admin = 0,
  Member = 1
}