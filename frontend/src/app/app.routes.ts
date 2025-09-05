import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/boards',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.authRoutes)
  },
  {
    path: 'boards',
    loadChildren: () => import('./features/boards/boards.routes')
      .then(m => m.boardRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'task-board',
    loadChildren: () => import('./features/task-board/task-board.routes')
      .then(m => m.taskBoardRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'task/:id',
    loadChildren: () => import('./features/task-board/task-board.routes')
      .then(m => m.taskBoardRoutes),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/boards'
  }
];