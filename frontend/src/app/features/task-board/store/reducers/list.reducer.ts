import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { List } from '../../models/list.model';
import { ListState } from '../list.state';
import { ListActions } from '../actions/list.actions';

// Feature key for the list state
export const ListFeatureKey = 'lists';

// Entity adapter
export const listAdapter: EntityAdapter<List> = createEntityAdapter<List>({
  selectId: (list) => list.id,
  sortComparer: (a, b) => a.position - b.position
});

// Initial state
export const initialListState: ListState = listAdapter.getInitialState({
  loading: false,
  saving: false,
  deleting: null,
  error: null,
  selectedListId: null,
  editingListId: null,
  isAddingList: false,
  isReordering: false
});

// Reducer
export const listReducer = createReducer(
  initialListState,
  
  // Load lists
  on(ListActions.loadLists, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(ListActions.loadListsSuccess, (state, { lists }) =>
    listAdapter.setAll(lists, {
      ...state,
      loading: false,
      error: null
    })
  ),
  
  on(ListActions.loadListsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create list
  on(ListActions.createList, (state) => ({
    ...state,
    saving: true,
    error: null
  })),
  
  on(ListActions.createListSuccess, (state, { list }) =>
    listAdapter.addOne(list, {
      ...state,
      saving: false,
      error: null,
      isAddingList: false
    })
  ),
  
  on(ListActions.createListFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),
  
  // Update list
  on(ListActions.updateList, (state) => ({
    ...state,
    saving: true,
    error: null
  })),
  
  on(ListActions.updateListSuccess, (state, { list }) =>
    listAdapter.updateOne(
      { id: list.id, changes: list },
      {
        ...state,
        saving: false,
        error: null,
        editingListId: null
      }
    )
  ),
  
  on(ListActions.updateListFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error
  })),
  
  // Delete list
  on(ListActions.deleteList, (state, { id }) => ({
    ...state,
    deleting: id,
    error: null
  })),
  
  on(ListActions.deleteListSuccess, (state, { id }) =>
    listAdapter.removeOne(id, {
      ...state,
      deleting: null,
      selectedListId: state.selectedListId === id ? null : state.selectedListId,
      editingListId: state.editingListId === id ? null : state.editingListId
    })
  ),
  
  on(ListActions.deleteListFailure, (state, { error }) => ({
    ...state,
    deleting: null,
    error
  })),
  
  // Reorder lists
  on(ListActions.reorderLists, (state) => ({
    ...state,
    isReordering: true,
    error: null
  })),
  
  on(ListActions.reorderListsSuccess, (state, { lists }) =>
    listAdapter.setAll(lists, {
      ...state,
      isReordering: false,
      error: null
    })
  ),
  
  on(ListActions.reorderListsFailure, (state, { error }) => ({
    ...state,
    isReordering: false,
    error
  })),
  
  // Selection
  on(ListActions.selectList, (state, { id }) => ({
    ...state,
    selectedListId: id
  })),
  
  on(ListActions.deselectList, (state) => ({
    ...state,
    selectedListId: null
  })),
  
  // UI State
  on(ListActions.startEditingList, (state, { id }) => ({
    ...state,
    editingListId: id
  })),
  
  on(ListActions.cancelEditingList, (state) => ({
    ...state,
    editingListId: null
  })),
  
  on(ListActions.startAddingList, (state) => ({
    ...state,
    isAddingList: true
  })),
  
  on(ListActions.cancelAddingList, (state) => ({
    ...state,
    isAddingList: false
  })),
  
  // Real-time updates
  on(ListActions.listCreatedRealTime, (state, { list }) =>
    listAdapter.addOne(list, state)
  ),
  
  on(ListActions.listUpdatedRealTime, (state, { list }) =>
    listAdapter.updateOne(
      { id: list.id, changes: list },
      state
    )
  ),
  
  on(ListActions.listDeletedRealTime, (state, { id }) =>
    listAdapter.removeOne(id, {
      ...state,
      selectedListId: state.selectedListId === id ? null : state.selectedListId,
      editingListId: state.editingListId === id ? null : state.editingListId
    })
  ),
  
  // Cache management
  on(ListActions.clearListCache, (state) =>
    listAdapter.removeAll({
      ...state,
      selectedListId: null,
      editingListId: null
    })
  )
);

// Export entity selectors
export const {
  selectIds: selectListIds,
  selectEntities: selectListEntities,
  selectAll: selectAllLists,
  selectTotal: selectTotalLists
} = listAdapter.getSelectors();