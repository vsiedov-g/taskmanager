import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListState } from '../list.state';
import { selectAllLists, selectListEntities, ListFeatureKey } from '../reducers/list.reducer';

// Feature selector
export const selectListState = createFeatureSelector<ListState>(ListFeatureKey);

// Entity selectors
export const selectLists = createSelector(
  selectListState,
  selectAllLists
);

export const selectListsEntities = createSelector(
  selectListState,
  selectListEntities
);

// Loading selectors
export const selectListsLoading = createSelector(
  selectListState,
  (state) => state.loading
);

export const selectListsSaving = createSelector(
  selectListState,
  (state) => state.saving
);

export const selectListsDeleting = createSelector(
  selectListState,
  (state) => state.deleting
);

// Error selectors
export const selectListsError = createSelector(
  selectListState,
  (state) => state.error
);

// UI state selectors
export const selectSelectedListId = createSelector(
  selectListState,
  (state) => state.selectedListId
);

export const selectEditingListId = createSelector(
  selectListState,
  (state) => state.editingListId
);

export const selectIsAddingList = createSelector(
  selectListState,
  (state) => state.isAddingList
);

export const selectIsReorderingLists = createSelector(
  selectListState,
  (state) => state.isReordering
);

// Computed selectors
export const selectSelectedList = createSelector(
  selectListsEntities,
  selectSelectedListId,
  (entities, selectedId) => selectedId ? entities[selectedId] : null
);

export const selectEditingList = createSelector(
  selectListsEntities,
  selectEditingListId,
  (entities, editingId) => editingId ? entities[editingId] : null
);

export const selectListById = (id: string) => createSelector(
  selectListsEntities,
  (entities) => entities[id]
);

// Sorted lists by position
export const selectSortedLists = createSelector(
  selectLists,
  (lists) => [...lists].sort((a, b) => a.position - b.position)
);

