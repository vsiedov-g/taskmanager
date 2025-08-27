import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { List, CreateListRequest, UpdateListRequest } from '../../models/list.model';

export const ListActions = createActionGroup({
  source: 'List',
  events: {
    // Load lists
    'Load Lists': emptyProps(),
    'Load Lists Success': props<{ lists: List[] }>(),
    'Load Lists Failure': props<{ error: string }>(),

    // Create list
    'Create List': props<{ listData: CreateListRequest }>(),
    'Create List Success': props<{ list: List }>(),
    'Create List Failure': props<{ error: string }>(),

    // Update list
    'Update List': props<{ listData: UpdateListRequest }>(),
    'Update List Success': props<{ list: List }>(),
    'Update List Failure': props<{ error: string }>(),

    // Delete list
    'Delete List': props<{ id: string }>(),
    'Delete List Success': props<{ id: string }>(),
    'Delete List Failure': props<{ error: string }>(),

    // Reorder lists
    'Reorder Lists': props<{ listIds: string[] }>(),
    'Reorder Lists Success': props<{ lists: List[] }>(),
    'Reorder Lists Failure': props<{ error: string }>(),

    // Selection
    'Select List': props<{ id: string | null }>(),
    'Deselect List': emptyProps(),

    // UI State
    'Start Editing List': props<{ id: string }>(),
    'Cancel Editing List': emptyProps(),
    'Start Adding List': emptyProps(),
    'Cancel Adding List': emptyProps(),

    // Real-time updates
    'List Created Real Time': props<{ list: List }>(),
    'List Updated Real Time': props<{ list: List }>(),
    'List Deleted Real Time': props<{ id: string }>(),

    // Cache management
    'Clear List Cache': emptyProps(),
    'Refresh Lists': emptyProps()
  }
});