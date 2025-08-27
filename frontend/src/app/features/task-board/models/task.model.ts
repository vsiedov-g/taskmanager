export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  listId?: string;
}

export enum TaskStatus {
  TODO = 'todo',
  PLANNED = 'planned',
  IN_PROGRESS = 'inprogress',
  CLOSED = 'closed'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  count: number;
}