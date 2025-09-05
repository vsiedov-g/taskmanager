import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { CORE_PROVIDERS } from './core/core.config';
import { SHARED_PROVIDERS } from './shared/shared.config';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Core Angular providers
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    
    // Feature providers
    ...CORE_PROVIDERS,
    ...SHARED_PROVIDERS,
  ],
};