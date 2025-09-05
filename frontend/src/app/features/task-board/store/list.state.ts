import { EntityState } from '@ngrx/entity';
import { List } from '../models/list.model';

// List entity state
export interface ListState extends EntityState<List> {
  // Loading states
  loading: boolean;
  saving: boolean;
  deleting: string | null; // ID of list being deleted
  
  // Error states
  error: string | null;
  
  // UI state
  selectedListId: string | null;
  editingListId: string | null;
  isAddingList: boolean;
  
  // Reordering state
  isReordering: boolean;
}

// Feature state
export interface ListBoardState {
  lists: ListState;
}