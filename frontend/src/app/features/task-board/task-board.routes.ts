import { Routes } from '@angular/router';

import { TaskBoardComponent } from './pages/task-board/task-board.component';
import { TASK_BOARD_PROVIDERS } from './task-board.config';

export const taskBoardRoutes: Routes = [
  {
    path: '',
    component: TaskBoardComponent,
    providers: [...TASK_BOARD_PROVIDERS],
  },
];