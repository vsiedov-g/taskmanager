import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/task-board',
    pathMatch: 'full'
  },
  {
    path: 'task-board',
    loadChildren: () => import('./features/task-board/task-board.routes')
      .then(m => m.taskBoardRoutes)
  },
  {
    path: '**',
    redirectTo: '/task-board'
  }
];