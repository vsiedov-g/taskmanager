import { RouterReducerState } from '@ngrx/router-store';

// Core app state interface
export interface CoreState {
  // Global loading state
  loading: boolean;
  // Global error state
  error: string | null;
  // Current user information
  currentUser: any | null;
  // App configuration
  config: AppConfig | null;
  // UI state (sidebar, theme, etc.)
  ui: UiState;
}

export interface UiState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

export interface AppConfig {
  apiUrl: string;
  slackClientId: string;
  signalrUrl: string;
  features: {
    enableRealTimeUpdates: boolean;
    enableSlackIntegration: boolean;
    enableAnalytics: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  read: boolean;
}

// Root application state
export interface AppState {
  // Core application state
  core: CoreState;
  // Router state
  router: RouterReducerState<any>;
  // Feature states will be added here dynamically
}