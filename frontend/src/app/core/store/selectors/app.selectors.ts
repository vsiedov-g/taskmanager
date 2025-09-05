import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoreState } from '../app.state';

// Feature selector
export const selectCoreState = createFeatureSelector<CoreState>('core');

// Loading selectors
export const selectLoading = createSelector(
  selectCoreState,
  (state) => state.loading
);

// Error selectors
export const selectError = createSelector(
  selectCoreState,
  (state) => state.error
);

export const selectHasError = createSelector(
  selectError,
  (error) => !!error
);

// User selectors
export const selectCurrentUser = createSelector(
  selectCoreState,
  (state) => state.currentUser
);

export const selectIsAuthenticated = createSelector(
  selectCurrentUser,
  (user) => !!user
);

export const selectUserName = createSelector(
  selectCurrentUser,
  (user) => user?.name || null
);

export const selectUserEmail = createSelector(
  selectCurrentUser,
  (user) => user?.email || null
);

// Config selectors
export const selectAppConfig = createSelector(
  selectCoreState,
  (state) => state.config
);

export const selectApiUrl = createSelector(
  selectAppConfig,
  (config) => config?.apiUrl || null
);

export const selectSlackClientId = createSelector(
  selectAppConfig,
  (config) => config?.slackClientId || null
);

export const selectFeatureFlags = createSelector(
  selectAppConfig,
  (config) => config?.features || null
);

// UI selectors
export const selectUiState = createSelector(
  selectCoreState,
  (state) => state.ui
);

export const selectSidebarOpen = createSelector(
  selectUiState,
  (ui) => ui.sidebarOpen
);

export const selectTheme = createSelector(
  selectUiState,
  (ui) => ui.theme
);

export const selectIsDarkMode = createSelector(
  selectTheme,
  (theme) => theme === 'dark'
);

// Notification selectors
export const selectNotifications = createSelector(
  selectUiState,
  (ui) => ui.notifications
);

export const selectUnreadNotifications = createSelector(
  selectNotifications,
  (notifications) => notifications.filter(n => !n.read)
);

export const selectUnreadNotificationCount = createSelector(
  selectUnreadNotifications,
  (unreadNotifications) => unreadNotifications.length
);

export const selectRecentNotifications = createSelector(
  selectNotifications,
  (notifications) => notifications.slice(0, 5)
);