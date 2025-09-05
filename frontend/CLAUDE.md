# Angular Project Structure Guide

## Overview
This Angular 20+ project follows a feature-based architecture using standalone components, NgRx for state management, and TailwindCSS for styling. The project is structured for scalability and maintainability with clean separation of concerns.

## Technology Stack
- **Angular**: 20.0.0
- **TypeScript**: 5.8.2
- **NgRx**: 19.2.1 (Store, Effects, Router Store, DevTools)
- **TailwindCSS**: 4.1.10
- **Styling**: SCSS with TailwindCSS
- **Charts**: ng2-charts, chart.js, @swimlane/ngx-charts
- **Grid**: ag-grid-angular
- **Testing**: Jasmine, Karma
- **Storybook**: Component documentation

## Root Project Structure

```
frontend/
├── src/
│   ├── app/                    # Main application code
│   ├── assets/                 # Static assets
│   ├── environments/           # Environment configurations
│   ├── styles/                 # Global styles
│   └── main.ts                 # Application bootstrap
├── public/                     # Public static assets
├── angular.json                # Angular CLI configuration
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── Dockerfile                  # Docker configuration
```

## Application Structure (`src/app/`)

### Main App Files
- `app.component.ts` - Root component (standalone)
- `app.config.ts` - Application configuration with providers
- `app.routes.ts` - Top-level routing configuration
- `main.ts` - Bootstrap application with standalone components

### Core Directory (`core/`)
Contains application-wide services, guards, interceptors, and global state management.

```
core/
├── core.config.ts              # Core providers configuration
├── guards/
│   ├── auth-guard.ts           # Authentication guard
│   └── auth-guard.spec.ts      # Guard tests
├── interceptors/
│   ├── auth.interceptor.ts     # JWT token interceptor
│   └── error.interceptor.ts    # Global error handling
├── services/
│   ├── api.service.ts          # Base HTTP service
│   ├── keycloak.service.ts     # Authentication service
│   ├── logger.service.ts       # Logging service
│   └── image.service.ts        # Image handling service
└── store/                      # Global NgRx store
    ├── index.ts                # Store providers export
    ├── actions/
    │   ├── app.actions.ts      # Application actions
    │   └── navigation.actions.ts # Navigation actions
    ├── effects/
    │   ├── app.effects.ts      # Application effects
    │   ├── navigation.effects.ts # Navigation effects
    │   └── spinner.effects.ts  # Loading spinner effects
    ├── reducers/
    │   ├── app.reducer.ts      # Application reducer
    │   └── router.reducer.ts   # Router state reducer
    └── selectors/
        ├── app.selectors.ts    # Application selectors
        └── router.selectors.ts # Router selectors
```

### Features Directory (`features/`)
Each feature follows a consistent structure with lazy-loaded modules.

#### Feature Structure Pattern
Every feature follows this structure:

```
feature-name/
├── feature-name.config.ts      # Feature providers configuration
├── feature-name.routes.ts      # Feature routing
├── components/                 # Feature-specific components
│   └── component-name/
│       ├── component-name.html
│       ├── component-name.scss
│       ├── component-name.ts   # Standalone component
│       ├── component-name.spec.ts
│       ├── models/             # Component-specific models
│       ├── services/           # Component-specific services
│       └── store/              # Component-specific state
├── pages/                      # Feature pages/containers
│   └── page-name/
│       ├── page-name.component.html
│       ├── page-name.component.scss
│       ├── page-name.component.ts
│       └── page-name.component.spec.ts
├── models/                     # Feature domain models
├── services/                   # Feature business services
└── store/                      # Feature state management
    ├── actions/
    ├── effects/
    ├── reducers/
    └── selectors/
```

### Layout Directory (`layout/`)
Contains layout components for the application shell.

```
layout/
├── main-layout.component.html  # Main layout template
├── main-layout.component.ts    # Main layout component
├── header/
│   └── header.component.ts     # Header component
└── sidebar/
    ├── sidebar.component.html  # Sidebar template
    ├── sidebar.component.scss  # Sidebar styles
    └── sidebar.component.ts    # Sidebar component
```

### Shared Directory (`shared/`)
Contains reusable components, services, and utilities.

```
shared/
├── shared.config.ts            # Shared providers
├── components/                 # Reusable UI components
│   ├── button/
│   │   ├── button.component.ts # Standalone button
│   │   └── button.stories.ts   # Storybook stories
│   ├── input/
│   │   ├── input.component.ts  # Form input with validation
│   │   └── input.stories.ts
│   ├── checkbox/
│   ├── radio-button/
│   ├── select/
│   ├── dropdown/
│   ├── modal/                  # Modal components
│   │   ├── modal-container.component.ts
│   │   ├── confirmation-modal.component.ts
│   │   ├── success-modal.component.ts
│   │   └── error-modal.component.ts
│   └── spinner/
├── directives/                 # Custom directives
├── effects/                    # Shared effects
│   ├── modal.effects.ts        # Modal state effects
│   └── modal-actions.ts        # Modal actions
├── models/                     # Shared models
│   └── modal-data.ts
└── utils/                      # Utility functions
    └── constants.ts
```

## Configuration Patterns

### App Configuration (`app.config.ts`)
Centralized application configuration using functional approach:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    provideMarkdown(),
    ...CORE_PROVIDERS,
    ...AUTH_PROVIDERS,
    ...SHARED_PROVIDERS,
    ...FEATURE_PROVIDERS,
  ],
};
```

### Feature Configuration Pattern
Each feature exports providers for dependency injection:

```typescript
// dashboard.config.ts
export const DASHBOARD_PROVIDERS = [
  provideState(DashboardFeatureKey, dashboardReducer),
  provideState(InsightFeatureKey, insightReducer),
  provideEffects(DashboardEffects, InsightEffects),
];
```

### Core Configuration (`core.config.ts`)
Global services and interceptors:

```typescript
export const CORE_PROVIDERS = [
  provideHttpClient(withInterceptorsFromDi()),
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  provideStore(),
  provideEffects(),
  provideRouterStore(),
  ...ROOT_STORE_PROVIDERS,
  ...(isDevMode() ? [provideStoreDevtools()] : []),
];
```

## NgRx Store Structure

### Global Store (`core/store/`)
- **App State**: Application-wide state (user, theme, loading)
- **Router State**: Navigation and route parameters
- **Navigation Effects**: Programmatic navigation

### Feature Store Pattern
Each feature can have multiple store slices:

```typescript
// Feature store providers
export const INCOME_EXPENSES_PROVIDERS = [
  provideState('incomeExpensesGrid', incomeExpensesGridReducer),
  provideState('SubmitTransactionModalState', submitTransactionModalReducer),
  provideState('InvoicePreviewModalState', invoicePreviewModalReducer),
  provideState('PNLCharts', pnlChartsReducer),
  provideState('forecast', IncomeExpensesForecastReducer),
  provideState('aiInsightsGrid', aiInsightsGridReducer),
  provideEffects([
    IncomeExpensesGridEffects,
    AiInsightsGridEffects,
    PNLChartsEffects,
    IncomeExpensesForecastEffects,
    SubmitTransactionModalEffects,
    InvoicePreviewModalEffects
  ]),
];
```

### Store File Organization
```
store/
├── actions/          # Action creators
├── effects/          # Side effects
├── reducers/         # State reducers
├── selectors/        # State selectors
└── index.ts          # Store exports
```

## Component Structure

### Standalone Components
All components use Angular's standalone approach:

```typescript
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private store = inject(Store);
  // Component logic
}
```

### Component Features
- **Separate HTML files**: All templates in `.html` files
- **SCSS styling**: Component-specific styles
- **Dependency injection**: Using `inject()` function
- **State management**: Connected to NgRx store
- **Type safety**: Strongly typed with interfaces

### Shared Components
Reusable UI components with:
- **Storybook integration**: Documentation and testing
- **Form integration**: ControlValueAccessor implementation
- **Flexible styling**: TailwindCSS with custom classes
- **Input validation**: Built-in error handling

## Routing Structure

### Lazy Loading Pattern
```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes')
          .then(m => m.dashboardRoutes),
      },
      {
        path: 'expenses',
        loadChildren: () => import('./features/income-expenses/income-expenses.routes')
          .then(ie => ie.incomeExpensesRoutes),
      },
    ],
  },
];
```

### Feature Routes with Providers
```typescript
export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    providers: [...DASHBOARD_PROVIDERS],
  },
  {
    path: 'insight',
    component: InsightComponent,
    providers: [...DASHBOARD_PROVIDERS],
  },
];
```

## Styling Architecture

### TailwindCSS Integration
- **Utility-first**: TailwindCSS for rapid development
- **Custom tokens**: Design system in `_tokens.scss`
- **Component styles**: SCSS for component-specific styling
- **Responsive design**: Mobile-first approach

### Styling Files
```
styles/
├── _tokens.scss      # Design system tokens
├── styles.scss       # Global styles
└── tailwind.css      # TailwindCSS imports
```

## Service Architecture

### API Service Pattern
Base service for HTTP operations:

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = environment.apiUrl;
  
  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, options);
  }
  // Other HTTP methods
}
```

### Feature Services
Business logic services per feature:

```typescript
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly endpoint = 'finance/dashboard';
  
  constructor(private apiService: ApiService) {}
  
  getFinancialOverview(): Observable<IFinancialOverview> {
    return this.apiService.get<IFinancialOverview>(`${this.endpoint}/company/overview`);
  }
}
```

## Environment Configuration

### Environment Files
```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/',
  keycloakBaseUrl: 'http://localhost:8080/',
  keycloakUserId: 'api-frontend',
  stripePublishableKey: 'pk_test_...',
};
```

## Testing Structure

### Testing Files
- `*.spec.ts` - Unit tests for components, services
- `karma.conf.js` - Test runner configuration
- Jasmine framework for testing

## Key Architectural Patterns

1. **Feature-based organization**: Each feature is self-contained
2. **Standalone components**: No NgModules, using standalone components
3. **Functional configuration**: Using provider functions for setup
4. **Lazy loading**: Code splitting by features
5. **State management**: NgRx for complex state management
6. **Separation of concerns**: Clear separation of components, services, models
7. **Type safety**: Strong TypeScript typing throughout
8. **Responsive design**: Mobile-first with TailwindCSS
9. **Testing**: Unit tests for all components and services
10. **Documentation**: Storybook for component library

## Dependency Injection Requirements

### **MANDATORY: Always use `inject()` function**
- **NEVER use constructor dependency injection**
- **ALWAYS use the `inject()` function for all service dependencies**
- This applies to components, services, guards, effects, and all other Angular classes

#### ✅ Correct Pattern:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  private store = inject(Store);
  private router = inject(Router);
  private apiService = inject(ApiService);
  
  // Component logic here
}
```

#### ❌ Incorrect Pattern (DO NOT USE):
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  constructor(
    private store: Store,
    private router: Router,
    private apiService: ApiService
  ) {} // NEVER use constructor injection
}
```

#### Service Example:
```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  private http = inject(HttpClient);
  private config = inject(CONFIG_TOKEN);
  
  // Service methods here
}
```

#### Effects Example:
```typescript
@Injectable()
export class ExampleEffects {
  private actions$ = inject(Actions);
  private service = inject(ExampleService);
  private store = inject(Store);
  
  // Effects here
}
```

### Benefits of `inject()`:
- **Cleaner code**: No constructor boilerplate
- **Better tree-shaking**: More efficient bundling
- **Conditional injection**: Can be used conditionally
- **Modern Angular**: Aligns with latest Angular patterns
- **Functional style**: Supports functional programming approaches

## List Management Requirements

### List Creation and Management
- Users can create, edit, and delete Lists
- When the board is empty, show a placeholder column with header "Add another list" and a "+" button
- Clicking "+" creates a new List with the ability to enter its Name
- Lists can be edited via a context menu; the Name becomes editable with Save/Cancel buttons
- When a List is deleted, all Cards within that List must also be deleted
- A placeholder "Add another list" with a "+" button should always be present at the end

### List Display and Ordering
- Each List header should display the number of Cards it contains
- Cards inside a List should be ordered primarily by:
  1. Due Date (descending, nulls last)
  2. Priority (High → Low) 
  3. CreatedAt (descending)

This structure provides a scalable, maintainable, and modern Angular application architecture suitable for enterprise-level applications.