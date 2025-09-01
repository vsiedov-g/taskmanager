import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/sign-in',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.authRoutes)
  },
  {
    path: 'task-board',
    loadChildren: () => import('./features/task-board/task-board.routes')
      .then(m => m.taskBoardRoutes),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/auth/sign-in'
  }
];