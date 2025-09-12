import type { Preview } from '@storybook/angular';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../src/app/features/task-board/services/task.service';
import { BoardService } from '../src/app/core/services/board.service';
import { ActivityLogService } from '../src/app/features/task-board/services/activity-log.service';
import { ListService } from '../src/app/features/task-board/services/list.service';
import { of } from 'rxjs';
import { applicationConfig } from '@storybook/angular';

// Mock initial state for NgRx store
const mockInitialState = {
  taskBoard: {
    lists: [],
    tasks: [],
    selectedTask: null,
    isUpdatingTask: false,
    error: null,
    cardActivityLogs: [],
    hasMoreLogs: false,
    isLoadingMoreLogs: false,
  },
  app: {
    loading: false,
    user: null,
    theme: 'light',
  },
};

// Global application configuration for Storybook
const globalProviders = [
  // HTTP Client
  provideHttpClient(withInterceptorsFromDi()),
  
  // NgRx Store
  provideMockStore({ initialState: mockInitialState }),
  
  // Router (needed for some components)
  provideRouter([]),
  
  // Animations
  importProvidersFrom(BrowserAnimationsModule),
  
  // Forms
  importProvidersFrom(ReactiveFormsModule),
  
  // Mock services that components might need
  {
    provide: TaskService,
    useValue: {
      getTasks: () => of([]),
      getPriorityClass: (priority: any) => 'bg-gray-100 text-gray-800',
      getPriorityDotClass: (priority: any) => 'bg-gray-400',
      getPriorityDisplayName: (priority: any) => 'Medium',
      createTask: () => of({}),
      updateTask: () => of({}),
      deleteTask: () => of({}),
      moveTask: () => of({}),
      getTasksByListId: () => of([]),
      updateTaskStatus: () => of({}),
    },
  },
  {
    provide: BoardService,
    useValue: {
      getBoardDetails: () => of({ members: [] }),
      getUserBoards: () => of([]),
      createBoard: () => of({}),
      joinBoard: () => of({}),
    },
  },
  {
    provide: ActivityLogService,
    useValue: {
      getActivityLogs: () => of([]),
      getTaskActivityLogs: () => of({}),
    },
  },
  {
    provide: ListService,
    useValue: {
      getLists: () => of([]),
      createList: () => of({}),
      updateList: () => of({}),
      deleteList: () => of({}),
    },
  },
  {
    provide: ActivatedRoute,
    useValue: {
      queryParams: of({}),
      params: of({}),
    },
  },
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      inlineStories: true,
    },
  },
  decorators: [
    applicationConfig({
      providers: globalProviders,
    }),
  ],
};

export default preview;