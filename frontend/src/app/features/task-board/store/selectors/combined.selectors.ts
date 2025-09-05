import { createSelector } from '@ngrx/store';
import { selectSortedLists } from './list.selectors';
import { selectAllTasksFromState } from './task.selectors';
import { ListColumn } from '../../models/list.model';
import { Task, TaskPriority } from '../../models/task.model';

// Combined selector for list columns with tasks and proper sorting
export const selectListColumns = createSelector(
  selectSortedLists,
  selectAllTasksFromState,
  (lists, tasks): ListColumn[] => {
    return lists.map(list => {
      // Filter tasks for this list
      const listTasks = tasks.filter(task => task.listId === list.id);
      
      // Sort tasks according to the specification:
      // 1. Due Date (descending, nulls last)
      // 2. Priority (High → Low) 
      // 3. CreatedAt (descending)
      const sortedTasks = sortTasks(listTasks);

      return {
        id: list.id,
        name: list.name,
        position: list.position,
        taskCount: listTasks.length,
        tasks: sortedTasks
      };
    });
  }
);

// Helper function to sort tasks according to specifications
function sortTasks(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    [TaskPriority.Critical]: 4,
    [TaskPriority.High]: 3,
    [TaskPriority.Medium]: 2,
    [TaskPriority.Low]: 1
  };

  return [...tasks].sort((a, b) => {
    // 1. Due Date (descending, nulls last)
    if (a.dueDate && b.dueDate) {
      const dateComparison = new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      if (dateComparison !== 0) return dateComparison;
    } else if (a.dueDate && !b.dueDate) {
      return -1; // a has date, b doesn't - a comes first
    } else if (!a.dueDate && b.dueDate) {
      return 1; // b has date, a doesn't - b comes first
    }

    // 2. Priority (High → Low)
    const priorityComparison = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityComparison !== 0) return priorityComparison;

    // 3. CreatedAt (descending)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// Selector for checking if board is empty (no lists)
export const selectIsBoardEmpty = createSelector(
  selectSortedLists,
  (lists) => lists.length === 0
);