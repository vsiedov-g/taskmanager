export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  listId: string;
  position: number;
}

export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  Done = 2
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  count: number;
}