import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { AppActions } from '../actions/app.actions';

@Injectable()
export class AppEffects {

  private actions$ = inject(Actions);

  // Load current user effect
  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadCurrentUser),
      exhaustMap(() =>
        // TODO: Replace with actual service call
        of({ user: { id: '1', name: 'John Doe', email: 'john@example.com' } }).pipe(
          map(({ user }) => AppActions.loadCurrentUserSuccess({ user })),
          catchError((error) => of(AppActions.loadCurrentUserFailure({ error: error.message })))
        )
      )
    )
  );

  // Load app config effect
  loadAppConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadAppConfig),
      exhaustMap(() =>
        // TODO: Replace with actual service call
        of({
          config: {
            apiUrl: 'http://localhost:5000/api',
            slackClientId: 'your-slack-client-id',
            signalrUrl: 'http://localhost:5000/hubs',
            features: {
              enableRealTimeUpdates: true,
              enableSlackIntegration: true,
              enableAnalytics: true
            }
          }
        }).pipe(
          map(({ config }) => AppActions.loadAppConfigSuccess({ config })),
          catchError((error) => of(AppActions.loadAppConfigFailure({ error: error.message })))
        )
      )
    )
  );

  // Logout user effect
  logoutUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.logoutUser),
      exhaustMap(() =>
        // TODO: Replace with actual service call
        of(null).pipe(
          map(() => AppActions.logoutUserSuccess()),
          catchError((error) => of(AppActions.setError({ error: error.message })))
        )
      )
    )
  );
}