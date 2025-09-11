import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { AppEffects } from './app.effects';
import { AppActions } from '../actions/app.actions';

describe('AppEffects', () => {
  let actions$: Observable<Action>;
  let effects: AppEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(AppEffects);
  });

  describe('loadCurrentUser$', () => {
    it('should dispatch loadCurrentUserSuccess on successful load', (done) => {
      const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
      const action = AppActions.loadCurrentUser();

      actions$ = of(action);

      effects.loadCurrentUser$.subscribe(result => {
        expect(result.type).toBe('[App] Load Current User Success');
        expect((result as any).user).toEqual(user);
        done();
      });
    });

    it('should handle effect creation', () => {
      expect(effects.loadCurrentUser$).toBeDefined();
    });
  });

  describe('loadAppConfig$', () => {
    it('should dispatch loadAppConfigSuccess on successful load', (done) => {
      const config = {
        apiUrl: 'http://localhost:5000/api',
        slackClientId: 'your-slack-client-id',
        signalrUrl: 'http://localhost:5000/hubs',
        features: {
          enableRealTimeUpdates: true,
          enableSlackIntegration: true,
          enableAnalytics: true
        }
      };
      const action = AppActions.loadAppConfig();

      actions$ = of(action);

      effects.loadAppConfig$.subscribe(result => {
        expect(result.type).toBe('[App] Load App Config Success');
        expect((result as any).config).toEqual(config);
        done();
      });
    });

    it('should handle effect creation', () => {
      expect(effects.loadAppConfig$).toBeDefined();
    });
  });

  describe('logoutUser$', () => {
    it('should dispatch logoutUserSuccess on successful logout', (done) => {
      const action = AppActions.logoutUser();

      actions$ = of(action);

      effects.logoutUser$.subscribe(result => {
        expect(result.type).toBe('[App] Logout User Success');
        done();
      });
    });

    it('should handle effect creation', () => {
      expect(effects.logoutUser$).toBeDefined();
    });
  });

  describe('Effects Integration', () => {
    it('should be created', () => {
      expect(effects).toBeTruthy();
    });

    it('should have all required effects defined', () => {
      expect(effects.loadCurrentUser$).toBeDefined();
      expect(effects.loadAppConfig$).toBeDefined();
      expect(effects.logoutUser$).toBeDefined();
    });
  });
});