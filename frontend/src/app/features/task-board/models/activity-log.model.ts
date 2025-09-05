export interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string | null;
  createdAt: string;
  userId: string;
  cardId: string | null;
  user: User;
  card: Card | null;
}

export interface User {
  id: string;
  name: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  position: number;
  assigneeId: string | null;
  listId: string;
}

export enum CardStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2
}

export interface ActivityLogFilters {
  cardId?: string;
  userId?: string;
  actionType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ActivityLogResponse {
  items: ActivityLog[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}