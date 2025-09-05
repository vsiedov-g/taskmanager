import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AppConfig, Notification } from '../app.state';

export const AppActions = createActionGroup({
  source: 'App',
  events: {
    // Loading actions
    'Set Loading': props<{ loading: boolean }>(),
    
    // Error actions
    'Set Error': props<{ error: string }>(),
    'Clear Error': emptyProps(),
    
    // User actions
    'Load Current User': emptyProps(),
    'Load Current User Success': props<{ user: any }>(),
    'Load Current User Failure': props<{ error: string }>(),
    'Logout User': emptyProps(),
    'Logout User Success': emptyProps(),
    
    // Config actions
    'Load App Config': emptyProps(),
    'Load App Config Success': props<{ config: AppConfig }>(),
    'Load App Config Failure': props<{ error: string }>(),
    
    // UI actions
    'Toggle Sidebar': emptyProps(),
    'Set Theme': props<{ theme: 'light' | 'dark' }>(),
    
    // Notification actions
    'Add Notification': props<{ notification: Omit<Notification, 'id' | 'timestamp' | 'read'> }>(),
    'Remove Notification': props<{ id: string }>(),
    'Mark Notification Read': props<{ id: string }>(),
    'Clear All Notifications': emptyProps(),
  }
});