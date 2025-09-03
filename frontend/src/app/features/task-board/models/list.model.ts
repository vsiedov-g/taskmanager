export interface List {
  id: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
}

export interface CreateListRequest {
  title: string;
  position: number;
  boardId: string;
}

export interface UpdateListRequest {
  id: string;
  name?: string;
  position?: number;
}

export interface ListColumn {
  id: string;
  name: string;
  position: number;
  taskCount: number;
  tasks: import('./task.model').Task[];
}