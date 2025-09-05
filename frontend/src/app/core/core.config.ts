import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import * as fromApp from './store/reducers/app.reducer';
import { routerReducer } from './store/reducers/router.reducer';
import { AppEffects } from './store/effects/app.effects';

export const CORE_PROVIDERS = [
  // NgRx Store providers
  provideStore({
    core: fromApp.coreReducer,
    router: routerReducer
  }),
  provideEffects([AppEffects]),
  provideRouterStore(),

  // Development tools
  ...(isDevMode() ? [
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75
    })
  ] : []),

  // HTTP Interceptors will be added here
  // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
];