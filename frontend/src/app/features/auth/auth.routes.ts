import { Routes } from '@angular/router';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { guestGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full'
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [guestGuard]
  }
];