# Task Manager Frontend - Development Guide

## Project Overview
This is the frontend application for the Task Manager with Slack integration, built using Angular 20, Tailwind CSS, and modern frontend development practices. The application follows a feature-based architecture with clean separation of concerns.

## Tech Stack

### Framework & Platform
- **Angular 20** - Latest Angular framework with standalone components support
- **TypeScript 5.8** - Strongly typed JavaScript superset
- **RxJS 7.8** - Reactive programming for Angular
- **Zone.js 0.15** - Change detection and async operations

### UI Framework & Styling
- **Angular Material 20.2.0** - Material Design components
- **Angular CDK 20.2.0** - Component Development Kit
- **Angular Animations 20.2.1** - Animation and transition support
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **@tailwindcss/forms** - Better form styling
- **@tailwindcss/typography** - Typography utilities
- **SCSS** - Enhanced CSS with variables and mixins

### State Management & Data Flow
- **NgRx Store 20.0.1** - Centralized state management
- **NgRx Effects 20.0.1** - Side effects management
- **NgRx Entity 20.0.1** - Entity state management
- **NgRx Store DevTools 20.0.1** - Development debugging

### Real-time Communication
- **@microsoft/signalr 9.0.6** - Real-time web functionality
- **WebSocket connections** - Live updates and notifications

### Data Visualization
- **Chart.js 4.5.0** - Flexible charting library
- **ng2-charts 8.0.0** - Angular wrapper for Chart.js

### Utility Libraries
- **date-fns 4.1.0** - Modern date utility library
- **lodash-es 4.17.21** - Utility functions with ES modules
- **@types/lodash-es** - TypeScript definitions

### Development Tools
- **ESLint 9.34.0** - Code linting and quality
- **@typescript-eslint** - TypeScript-specific linting rules
- **Prettier 3.6.2** - Code formatting
- **Husky 9.1.7** - Git hooks management
- **lint-staged 16.1.5** - Run linters on staged files
- **@commitlint** - Commit message linting

### Testing Framework
- **Jasmine 5.7.0** - Testing framework
- **Karma 6.4.0** - Test runner
- **Angular Testing Utilities** - Angular-specific testing tools

### Build & Development
- **Angular CLI 20.0.2** - Command line tools
- **@angular/build 20.0.2** - Build system
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

## Architecture Overview

### Feature-Based Architecture

```
┌─────────────────────────────────────────────────────┐
│                     App Module                      │
│              (Root, Routing, Guards)                │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│                 Core Module                         │
│          (Singleton Services, Guards)               │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               Shared Module                         │
│           (Reusable Components)                     │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
┌───────▼───┐ ┌───▼───┐ ┌───▼─────┐
│  Tasks    │ │Project│ │ Slack   │
│  Feature  │ │Feature│ │Feature  │
│  Module   │ │Module │ │ Module  │
└───────────┘ └───────┘ └─────────┘
```

### Module Structure

#### 1. Core Module (Singleton)
**Purpose**: Application-wide singleton services and configurations
- **Services**: API services, authentication, configuration
- **Guards**: Route guards, authentication guards
- **Interceptors**: HTTP interceptors, error handling
- **Models**: TypeScript interfaces and types

#### 2. Shared Module (Reusable)
**Purpose**: Commonly used components, pipes, and directives
- **UI Components**: Buttons, modals, forms, loading spinners
- **Layout Components**: Headers, sidebars, footers
- **Pipes**: Date formatting, text transformation
- **Directives**: Custom DOM manipulations
- **Utils**: Helper functions and utilities

#### 3. Feature Modules (Lazy Loaded)
**Purpose**: Specific business functionality
- **Tasks Module**: Task management functionality
- **Projects Module**: Project organization features
- **Slack Module**: Slack integration components
- **Dashboard Module**: Analytics and overview

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                          # Singleton services
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── slack.service.ts
│   │   │   │   ├── signalr.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── loading.interceptor.ts
│   │   │   ├── models/
│   │   │   │   ├── task.model.ts
│   │   │   │   ├── project.model.ts
│   │   │   │   ├── user.model.ts
│   │   │   │   └── slack.model.ts
│   │   │   └── core.module.ts
│   │   │
│   │   ├── features/                      # Feature modules
│   │   │   ├── tasks/
│   │   │   │   ├── components/
│   │   │   │   │   ├── task-list/
│   │   │   │   │   │   ├── task-list.component.ts
│   │   │   │   │   │   ├── task-list.component.html
│   │   │   │   │   │   └── task-list.component.scss
│   │   │   │   │   ├── task-form/
│   │   │   │   │   └── task-card/
│   │   │   │   ├── services/
│   │   │   │   │   └── task.service.ts
│   │   │   │   ├── store/
│   │   │   │   │   ├── task.actions.ts
│   │   │   │   │   ├── task.reducer.ts
│   │   │   │   │   ├── task.effects.ts
│   │   │   │   │   └── task.selectors.ts
│   │   │   │   ├── pages/
│   │   │   │   │   ├── tasks-page/
│   │   │   │   │   └── task-detail-page/
│   │   │   │   └── tasks.module.ts
│   │   │   │
│   │   │   ├── projects/
│   │   │   │   ├── components/
│   │   │   │   ├── services/
│   │   │   │   ├── store/
│   │   │   │   ├── pages/
│   │   │   │   └── projects.module.ts
│   │   │   │
│   │   │   ├── slack-integration/
│   │   │   │   ├── components/
│   │   │   │   │   ├── slack-channels/
│   │   │   │   │   ├── slack-notifications/
│   │   │   │   │   └── slack-settings/
│   │   │   │   ├── services/
│   │   │   │   │   └── slack-integration.service.ts
│   │   │   │   ├── store/
│   │   │   │   ├── pages/
│   │   │   │   └── slack.module.ts
│   │   │   │
│   │   │   └── dashboard/
│   │   │       ├── components/
│   │   │       │   ├── analytics-chart/
│   │   │       │   ├── progress-summary/
│   │   │       │   └── activity-feed/
│   │   │       ├── services/
│   │   │       ├── store/
│   │   │       ├── pages/
│   │   │       └── dashboard.module.ts
│   │   │
│   │   ├── shared/                        # Reusable components
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── button/
│   │   │   │   │   │   ├── button.component.ts
│   │   │   │   │   │   ├── button.component.html
│   │   │   │   │   │   └── button.component.scss
│   │   │   │   │   ├── modal/
│   │   │   │   │   ├── loading-spinner/
│   │   │   │   │   ├── toast-notification/
│   │   │   │   │   ├── confirmation-dialog/
│   │   │   │   │   └── data-table/
│   │   │   │   └── layout/
│   │   │   │       ├── header/
│   │   │   │       ├── sidebar/
│   │   │   │       ├── footer/
│   │   │   │       └── breadcrumb/
│   │   │   ├── pipes/
│   │   │   │   ├── date-format.pipe.ts
│   │   │   │   ├── truncate.pipe.ts
│   │   │   │   └── priority-color.pipe.ts
│   │   │   ├── directives/
│   │   │   │   ├── click-outside.directive.ts
│   │   │   │   └── lazy-load.directive.ts
│   │   │   ├── utils/
│   │   │   │   ├── validation.utils.ts
│   │   │   │   ├── date.utils.ts
│   │   │   │   └── storage.utils.ts
│   │   │   └── shared.module.ts
│   │   │
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   └── app.module.ts
│   │
│   ├── assets/                            # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── environments/                      # Environment configs
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── styles.scss                        # Global styles
│   ├── index.html                         # Main HTML file
│   └── main.ts                           # Bootstrap file
│
├── angular.json                          # Angular CLI config
├── package.json                          # Dependencies
├── tailwind.config.js                    # Tailwind config
├── postcss.config.js                     # PostCSS config
├── tsconfig.json                         # TypeScript config
├── .eslintrc.json                       # ESLint config
├── .prettierrc                          # Prettier config
├── commitlint.config.js                 # Commit lint config
└── karma.conf.js                        # Test config
```

## Key Features & Requirements

### Core Task Management UI
- Task creation, editing, and deletion forms
- Task list with filtering, sorting, and pagination
- Task cards with priority indicators and status badges
- Drag-and-drop functionality for status updates
- Bulk actions for multiple task operations
- Advanced search and filtering capabilities

### Project Management Interface
- Project creation and configuration
- Project dashboard with progress visualization
- Team member assignment and management
- Project templates and workflows
- Milestone tracking and deadline management

### Slack Integration UI
- Slack workspace connection flow
- Channel selection and configuration
- Real-time notification settings
- Slack user mapping interface
- Interactive Slack command responses
- Webhook status monitoring

### Dashboard & Analytics
- Interactive charts and graphs using Chart.js
- Task completion metrics and trends
- Team productivity analytics
- Project progress visualization
- Real-time activity feed
- Customizable dashboard widgets

### Real-time Features
- SignalR integration for live updates
- Real-time task status changes
- Live notification system
- Online user presence indicators
- Instant messaging and comments

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Adaptive layouts for tablet and desktop
- Touch-friendly interface elements
- Progressive Web App (PWA) capabilities
- Offline functionality support

## Development Commands

### Development Server
```bash
# Start development server
npm start
# or
ng serve

# Start with specific port
ng serve --port 4300

# Start with host binding
ng serve --host 0.0.0.0

# Start with SSL
ng serve --ssl
```

### Building
```bash
# Development build
npm run build
# or
ng build

# Production build
npm run build:prod
# or
ng build --configuration production

# Build with stats for analysis
npm run analyze
```

### Testing
```bash
# Run unit tests
npm test
# or
ng test

# Run tests in CI mode
npm run test:ci

# Run e2e tests
npm run e2e

# Run e2e tests in CI mode
npm run e2e:ci
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is formatted
npm run format:check
```

### Generation Commands
```bash
# Generate component
ng generate component features/tasks/components/task-item

# Generate service
ng generate service core/services/notification

# Generate module
ng generate module features/reports --routing

# Generate guard
ng generate guard core/guards/admin

# Generate pipe
ng generate pipe shared/pipes/relative-time
```

## State Management with NgRx

### Store Structure
```typescript
interface AppState {
  auth: AuthState;
  tasks: TaskState;
  projects: ProjectState;
  slack: SlackState;
  ui: UiState;
}
```

### Feature State Example (Tasks)
```typescript
interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: Pagination;
}
```

### Actions, Reducers, Effects Pattern
- **Actions**: Define what happened
- **Reducers**: Define how state changes
- **Effects**: Handle side effects (API calls, navigation)
- **Selectors**: Query state data

## Styling Architecture

### Tailwind CSS Configuration
- **Custom color palette** for branding
- **Extended spacing** for consistent layouts
- **Custom animations** for micro-interactions
- **Component utilities** for task priorities and statuses
- **Dark mode** support with class strategy

### SCSS Organization
- **Global styles** in `styles.scss`
- **Component styles** co-located with components
- **Utility mixins** for common patterns
- **Theme variables** for consistency

### Component Styling Strategy
```scss
// Component-specific styles
.task-card {
  @apply bg-white rounded-lg shadow-md p-4 border border-gray-200;
  
  &--priority-high {
    @apply border-orange-400 bg-orange-50;
  }
  
  &--selected {
    @apply ring-2 ring-blue-500;
  }
}
```

## Environment Configuration

### Development Environment
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:5001/api',
  slackClientId: 'dev-slack-client-id',
  signalrUrl: 'https://localhost:5001/hubs',
  enableDevTools: true,
  logLevel: 'debug'
};
```

### Production Environment
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.taskmanager.com/api',
  slackClientId: 'prod-slack-client-id',
  signalrUrl: 'https://api.taskmanager.com/hubs',
  enableDevTools: false,
  logLevel: 'error'
};
```

## API Integration

### HTTP Client Configuration
```typescript
@Injectable()
export class ApiService {
  constructor(private http: HttpClient) {}
  
  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>('/api/tasks');
  }
}
```

### Error Handling
- Global error interceptor for HTTP errors
- User-friendly error messages
- Retry mechanisms for failed requests
- Loading states and error boundaries

## Testing Strategy

### Unit Testing
- Component testing with TestBed
- Service testing with mocks
- Pipe and directive testing
- NgRx testing (actions, reducers, effects)

### Integration Testing
- Component integration testing
- Service integration with HTTP client
- Store integration testing
- Route testing

### E2E Testing
- User workflow testing
- Cross-browser compatibility
- Mobile device testing
- Performance testing

## Performance Optimization

### Lazy Loading
```typescript
const routes: Routes = [
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then(m => m.TasksModule)
  }
];
```

### Change Detection Strategy
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {}
```

### Bundle Optimization
- Code splitting with lazy modules
- Tree shaking for unused code
- Bundle analysis and optimization
- Service worker for caching

## Security Considerations

### Authentication & Authorization
- JWT token management
- Route guards for protected areas
- Role-based access control
- Session timeout handling

### XSS Prevention
- Angular's built-in sanitization
- Content Security Policy (CSP)
- Input validation and sanitization

### Data Protection
- Sensitive data encryption
- Secure local storage
- HTTPS-only cookies
- API rate limiting

## Accessibility (a11y)

### Angular CDK A11y
- Focus management
- Live announcer for screen readers
- Keyboard navigation support
- ARIA attributes

### WCAG 2.1 Compliance
- Semantic HTML structure
- Color contrast requirements
- Keyboard accessibility
- Screen reader compatibility

This frontend application provides a modern, scalable, and maintainable foundation for the Task Manager with comprehensive Slack integration, following Angular best practices and industry standards.