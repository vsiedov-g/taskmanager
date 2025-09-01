import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';

import { TaskEffects } from './store/effects/task.effects';
import { taskReducer, TaskFeatureKey } from './store/reducers/task.reducer';
import { ListEffects } from './store/effects/list.effects';
import { listReducer, ListFeatureKey } from './store/reducers/list.reducer';
import { ActivityLogEffects } from './store/effects/activity-log.effects';
import { activityLogReducer, ActivityLogFeatureKey } from './store/reducers/activity-log.reducer';

export const TASK_BOARD_PROVIDERS = [
  provideState(TaskFeatureKey, taskReducer),
  provideState(ListFeatureKey, listReducer),
  provideState(ActivityLogFeatureKey, activityLogReducer),
  provideEffects([TaskEffects, ListEffects, ActivityLogEffects]),
];