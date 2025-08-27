import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { TaskEffects } from './store/effects/task.effects';
import { taskReducer, TaskFeatureKey } from './store/reducers/task.reducer';

export const TASK_BOARD_PROVIDERS = [
  provideState(TaskFeatureKey, taskReducer),
  provideEffects([TaskEffects]),
];