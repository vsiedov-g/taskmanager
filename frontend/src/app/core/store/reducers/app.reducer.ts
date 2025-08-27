import { createReducer, on } from '@ngrx/store';
import { CoreState, Notification } from '../app.state';
import { AppActions } from '../actions/app.actions';

export const initialState: CoreState = {
  loading: false,
  error: null,
  currentUser: null,
  config: null,
  ui: {
    sidebarOpen: true,
    theme: 'light',
    notifications: []
  }
};

export const coreReducer = createReducer(
  initialState,
  
  // Loading actions
  on(AppActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  
  // Error actions
  on(AppActions.setError, (state, { error }) => ({
    ...state,
    error
  })),
  
  on(AppActions.clearError, (state) => ({
    ...state,
    error: null
  })),
  
  // User actions
  on(AppActions.loadCurrentUser, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(AppActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    loading: false,
    currentUser: user,
    error: null
  })),
  
  on(AppActions.loadCurrentUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  on(AppActions.logoutUserSuccess, (state) => ({
    ...state,
    currentUser: null
  })),
  
  // Config actions
  on(AppActions.loadAppConfig, (state) => ({
    ...state,
    loading: true
  })),
  
  on(AppActions.loadAppConfigSuccess, (state, { config }) => ({
    ...state,
    loading: false,
    config,
    error: null
  })),
  
  on(AppActions.loadAppConfigFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // UI actions
  on(AppActions.toggleSidebar, (state) => ({
    ...state,
    ui: {
      ...state.ui,
      sidebarOpen: !state.ui.sidebarOpen
    }
  })),
  
  on(AppActions.setTheme, (state, { theme }) => ({
    ...state,
    ui: {
      ...state.ui,
      theme
    }
  })),
  
  // Notification actions
  on(AppActions.addNotification, (state, { notification }) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    return {
      ...state,
      ui: {
        ...state.ui,
        notifications: [newNotification, ...state.ui.notifications]
      }
    };
  }),
  
  on(AppActions.removeNotification, (state, { id }) => ({
    ...state,
    ui: {
      ...state.ui,
      notifications: state.ui.notifications.filter(n => n.id !== id)
    }
  })),
  
  on(AppActions.markNotificationRead, (state, { id }) => ({
    ...state,
    ui: {
      ...state.ui,
      notifications: state.ui.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }
  })),
  
  on(AppActions.clearAllNotifications, (state) => ({
    ...state,
    ui: {
      ...state.ui,
      notifications: []
    }
  }))
);