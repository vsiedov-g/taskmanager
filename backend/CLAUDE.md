# Task Manager Backend - Clean Architecture Implementation Guide

## Project Overview
This is the backend API for the Task Manager application with Slack integration, built using Clean Architecture principles and modern .NET technologies. This implementation follows enterprise-level patterns for managing domain entities, business logic, external integrations, and API endpoints in a scalable, maintainable architecture.

## Tech Stack

### Framework & Platform
- **.NET 9.0** - Latest LTS framework
- **ASP.NET Core Web API** - RESTful API development
- **C# 12** - Programming language with nullable reference types enabled

### Database & ORM
- **PostgreSQL** - Primary database for all environments
- **Entity Framework Core 9.0.8** - ORM and database migrations
- **Npgsql.EntityFrameworkCore.PostgreSQL** - PostgreSQL provider
- **In-Memory Database** - Available for testing scenarios

### Architecture & Patterns
- **Clean Architecture** - Separation of concerns with dependency inversion
- **CQRS Pattern** - Command Query Responsibility Segregation
- **MediatR 13.0.0** - In-process messaging for CQRS implementation
- **Repository Pattern** - Data access abstraction
- **Unit of Work Pattern** - Transaction management

### Validation & Mapping
- **FluentValidation 12.0.0** - Input validation and business rules
- **AutoMapper 15.0.1** - Object-to-object mapping
- **AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.1** - DI integration

### Authentication & Security
- **JWT Bearer Authentication** - Stateless authentication
- **Microsoft.AspNetCore.Authentication.JwtBearer 9.0.8**
- **Microsoft.IdentityModel.Tokens 8.14.0**
- **System.IdentityModel.Tokens.Jwt 8.14.0**

### Communication & Messaging
- **gRPC** - High-performance inter-service communication
- **RabbitMQ + MassTransit** - Asynchronous messaging (planned)
- **HTTP Clients** - External API integrations

### External Integrations
- **SlackAPI 1.1.14** - Slack workspace integration
- **OAuth 2.0** - Slack authentication flow
- **Webhooks** - Real-time event handling
- **Payment Providers** - Payment processing and subscription management (planned)
- **Identity Provider Integration** - External authentication services (planned)

### Logging & Monitoring
- **Serilog 4.3.0** - Structured logging
- **Serilog.AspNetCore 9.0.0** - ASP.NET Core integration
- **Serilog.Sinks.Console 6.0.0** - Console output
- **Serilog.Sinks.File 7.0.0** - File logging

### Real-time Communication
- **Microsoft.AspNetCore.SignalR 1.2.0** - WebSocket-based real-time updates
- **Real-time notifications** - Task updates, assignments, completions

### API Documentation
- **Swashbuckle.AspNetCore 9.0.3** - OpenAPI/Swagger documentation
- **Microsoft.AspNetCore.Cors 2.3.0** - Cross-origin resource sharing

### Testing Framework
- **xUnit** - Unit and integration testing
- **Microsoft.AspNetCore.Mvc.Testing 9.0.8** - Integration testing

## Architecture Overview

### Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│              TaskManager.API            │
│         (Controllers, Middleware)       │
└─────────────────┬───────────────────────┘
                  │ depends on
┌─────────────────▼───────────────────────┐
│        TaskManager.Infrastructure       │
│    (Data, External Services, Slack)     │
└─────────────────┬───────────────────────┘
                  │ depends on
┌─────────────────▼───────────────────────┐
│        TaskManager.Application          │
│      (Use Cases, CQRS, Validation)     │
└─────────────────┬───────────────────────┘
                  │ depends on
┌─────────────────▼───────────────────────┐
│         TaskManager.Domain              │
│     (Entities, Interfaces, Events)     │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. Domain Layer (`TaskManager.Domain`)
**Purpose**: Core business logic and domain entities
- **Entities**: Task, Project, User, SlackWorkspace
- **Value Objects**: Priority, Status, etc.
- **Domain Events**: TaskCreated, TaskCompleted, etc.
- **Interfaces**: Repository contracts (ITaskRepository, ISlackService)
- **Business Rules**: Domain-specific validation and logic

#### 2. Application Layer (`TaskManager.Application`)
**Purpose**: Application business rules and use cases
- **Commands**: CreateTaskCommand, UpdateTaskCommand, etc.
- **Queries**: GetTasksQuery, GetTaskByIdQuery, etc.
- **Handlers**: MediatR request handlers for commands and queries
- **DTOs**: Data transfer objects for API communication
- **Validation**: FluentValidation validators
- **Mappings**: AutoMapper profiles

#### 3. Infrastructure Layer (`TaskManager.Infrastructure`)
**Purpose**: External dependencies and data persistence
- **Data**: Entity Framework DbContext, configurations, repositories
- **Services**: SlackApiService, NotificationService, EmailService
- **External**: Third-party integrations (Slack SDK)
- **Persistence**: Database implementations of domain interfaces

#### 4. API Layer (`TaskManager.API`)
**Purpose**: HTTP API endpoints and web concerns
- **Controllers**: TasksController, ProjectsController, SlackController, AuthController
- **gRPC Services**: Inter-service communication (planned)
- **Middleware**: Authentication metadata middleware, error handling
- **Filters**: API exception handling, cross-cutting concerns
- **Configuration**: Dependency injection, services registration

## Key Architectural Features

### 1. **Authentication & Authorization**
- JWT token-based authentication with custom user management
- Role-based access control (RBAC) - Admin, Manager, Member
- User registration and profile management
- Multi-tenant support (planned)
- Slack OAuth integration (planned)

### 2. **Task Management System**
- Complete CRUD operations for tasks, lists, and users
- Task lifecycle management with status transitions
- Priority-based task organization and filtering
- Due date tracking and alerts
- Assignment and ownership tracking
- Bulk operations for efficiency

### 3. **External Service Integration**
- Slack workspace integration with OAuth 2.0
- Real-time notifications in Slack channels
- Slash commands and interactive components
- Webhook handling for external events
- Multiple service provider support (planned)

### 4. **Real-time Features**
- SignalR hubs for live updates (planned)
- Task status change notifications
- Assignment notifications
- Project progress updates
- Cross-client synchronization

### 5. **Data Management**
- PostgreSQL database with Entity Framework Core
- Entity Framework Core with migrations
- Repository pattern with Unit of Work
- Audit trail and change tracking
- Data validation and business rules

### 6. **Security & Performance**
- JWT token validation and expiration
- Input validation and sanitization
- SQL injection prevention through EF Core
- CORS configuration for frontend integration
- Connection pooling and query optimization

## Project Structure

```
backend/
├── src/
│   ├── TaskManager.Domain/
│   │   ├── Entities/
│   │   │   ├── Task.cs
│   │   │   ├── Project.cs
│   │   │   ├── User.cs
│   │   │   └── SlackWorkspace.cs
│   │   ├── ValueObjects/
│   │   ├── Interfaces/
│   │   │   ├── ITaskRepository.cs
│   │   │   ├── ISlackService.cs
│   │   │   └── IUnitOfWork.cs
│   │   └── Events/
│   │       ├── TaskCreatedEvent.cs
│   │       └── TaskCompletedEvent.cs
│   │
│   ├── TaskManager.Application/
│   │   ├── Tasks/
│   │   │   ├── Commands/
│   │   │   │   ├── CreateTaskCommand.cs
│   │   │   │   └── UpdateTaskCommand.cs
│   │   │   ├── Queries/
│   │   │   │   ├── GetTasksQuery.cs
│   │   │   │   └── GetTaskByIdQuery.cs
│   │   │   └── Handlers/
│   │   ├── Slack/
│   │   │   ├── Commands/
│   │   │   └── Handlers/
│   │   ├── Common/
│   │   │   ├── Behaviors/
│   │   │   ├── Mappings/
│   │   │   └── Validators/
│   │   ├── DTOs/
│   │   └── ConfigureServices.cs
│   │
│   ├── TaskManager.Infrastructure/
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   └── Repositories/
│   │   ├── Services/
│   │   │   ├── SlackApiService.cs
│   │   │   ├── NotificationService.cs
│   │   │   └── EmailService.cs
│   │   ├── External/
│   │   │   └── Slack/
│   │   │       ├── SlackClient.cs
│   │   │       └── SlackModels.cs
│   │   └── ConfigureServices.cs
│   │
│   └── TaskManager.API/
│       ├── Controllers/
│       │   ├── TasksController.cs
│       │   ├── ProjectsController.cs
│       │   └── SlackController.cs
│       ├── Middleware/
│       ├── Filters/
│       ├── ConfigureServices.cs
│       ├── Program.cs
│       └── appsettings.json
│
└── tests/
    ├── TaskManager.Domain.Tests/
    ├── TaskManager.Application.Tests/
    ├── TaskManager.Infrastructure.Tests/
    └── TaskManager.API.Tests/
```

## Database Schema Patterns

### Core Entity Types
- **User Entities**: Central entities for authentication and user management
  - User profiles with authentication credentials
  - User preferences and settings
  - Multi-tenant user relationships (planned)
- **Task Management Entities**: Core business domain objects
  - Tasks with full lifecycle management
  - Lists for task organization
  - Priority and status tracking
- **Audit Entities**: Change tracking and history (planned)
  - Task change logs
  - User activity tracking
  - System audit trails
- **Integration Entities**: External service connections (planned)
  - Slack workspace configurations
  - External service credentials
  - Webhook configurations

### Common Relationships
- **One-to-Many**: User → Tasks, List → Tasks, User → Lists
- **One-to-One**: User → Profile (planned), List → Configuration (planned)
- **Many-to-Many**: Users ↔ Roles (planned), Tasks ↔ Categories (planned)
- **Self-referencing**: Task → SubTasks (planned), User → Manager (planned)

## API Endpoint Patterns

### Authentication Endpoints (`/api/auth`)
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User authentication
- `POST /api/auth/refresh` - Token refresh (planned)
- `POST /api/auth/logout` - User logout (planned)

### User Management (`/api/users`)
- `GET /api/users/profile` - Current user profile (planned)
- `PUT /api/users/profile` - Update user profile (planned)
- `GET /api/users/{id}` - Get user by ID (planned)
- `PUT /api/users/{id}` - Update user (planned)

### Task Management (`/api/tasks`)
- `GET /api/tasks` - Get all tasks (planned)
- `POST /api/tasks` - Create new task (planned)
- `GET /api/tasks/{id}` - Get task by ID (planned)
- `PUT /api/tasks/{id}` - Update task (planned)
- `DELETE /api/tasks/{id}` - Delete task (planned)

### List Management (`/api/lists`)
- `GET /api/lists` - Get all lists (planned)
- `POST /api/lists` - Create new list (planned)
- `GET /api/lists/{id}` - Get list by ID (planned)
- `PUT /api/lists/{id}` - Update list (planned)
- `DELETE /api/lists/{id}` - Delete list (planned)

### Slack Integration (`/api/slack`)
- `POST /api/slack/oauth` - Slack OAuth flow (planned)
- `POST /api/slack/webhook` - Slack webhook handler (planned)
- `GET /api/slack/workspaces` - Get connected workspaces (planned)
- `DELETE /api/slack/workspaces/{id}` - Disconnect workspace (planned)

## gRPC Service Patterns (Planned)

### Data Access Services
- Task data retrieval and manipulation
- User information access
- Real-time event broadcasting
- Cross-service communication
- Performance-critical operations

## Key Features & Requirements

### Core Task Management
- Create, read, update, delete tasks
- Task properties: title, description, priority, status, due date, assignee
- Task statuses: ToDo, InProgress, Review, Done
- Task priorities: Low, Medium, High, Critical
- Project organization and management
- User roles and permissions (Admin, Manager, Member)

### Slack Integration
- OAuth 2.0 authentication with Slack workspaces
- Real-time notifications in Slack channels
- Slash commands: `/task create`, `/task assign`, `/task status`
- Interactive buttons in Slack messages
- Channel-based project discussions
- Webhook handling for Slack events

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Slack OAuth integration
- User session management

### Real-time Features
- SignalR hubs for live updates
- Task status change notifications
- Assignment notifications
- Project progress updates

### Data Persistence
- PostgreSQL database
- Entity Framework Core migrations
- Repository pattern implementation
- Unit of Work for transactions

## Development Commands

### Database Operations
```bash
# Add migration
dotnet ef migrations add MigrationName --project src/TaskManager.Infrastructure --startup-project src/TaskManager.API

# Update database
dotnet ef database update --project src/TaskManager.Infrastructure --startup-project src/TaskManager.API

# Remove last migration
dotnet ef migrations remove --project src/TaskManager.Infrastructure --startup-project src/TaskManager.API
```

### Build & Test
```bash
# Build solution
dotnet build

# Run tests
dotnet test

# Run API
dotnet run --project src/TaskManager.API

# Watch mode (hot reload)
dotnet watch run --project src/TaskManager.API
```

### Package Management
```bash
# Restore packages
dotnet restore

# Add package to specific project
dotnet add src/TaskManager.API/TaskManager.API.csproj package PackageName

# Update all packages
dotnet list package --outdated
```

## Environment Configuration

### Required Environment Variables
```
DATABASE_URL=postgresql://username:password@localhost:5432/taskmanager
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
API_BASE_URL=https://localhost:5001
CORS_ORIGINS=https://localhost:4200
```

### Development Setup
1. Install PostgreSQL and create database
2. Configure connection string in `appsettings.Development.json`
3. Run initial migration: `dotnet ef database update`
4. Set up Slack app and configure OAuth credentials
5. Start the API: `dotnet run --project src/TaskManager.API`

## Dependency Injection Configuration

### ConfigureServices Pattern
**IMPORTANT**: All service configurations in `Program.cs` should be organized using separate `ConfigureServices.cs` files in each layer to maintain clean architecture and separation of concerns.

Each layer should have its own `ConfigureServices.cs` file with static extension methods:

#### 1. TaskManager.Application/ConfigureServices.cs
```csharp
public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // MediatR registration
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        
        // AutoMapper registration
        services.AddAutoMapper(Assembly.GetExecutingAssembly());
        
        // FluentValidation registration
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        // Behaviors registration
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        
        return services;
    }
}
```

#### 2. TaskManager.Infrastructure/ConfigureServices.cs
```csharp
public static class ConfigureServices
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database configuration
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        
        // Repository registration
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        
        // External services
        services.AddScoped<ISlackService, SlackApiService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IEmailService, EmailService>();
        
        // Slack client configuration
        services.Configure<SlackOptions>(configuration.GetSection("Slack"));
        services.AddHttpClient<SlackClient>();
        
        return services;
    }
}
```

#### 3. TaskManager.API/ConfigureServices.cs
```csharp
public static class ConfigureServices
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Controllers configuration
        services.AddControllers();
        
        // API documentation
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "TaskManager API", Version = "v1" });
        });
        
        // Authentication & Authorization
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["JWT_ISSUER"],
                    ValidAudience = configuration["JWT_AUDIENCE"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JWT_SECRET"]))
                };
            });
        
        services.AddAuthorization();
        
        // CORS configuration
        services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins(configuration["CORS_ORIGINS"]?.Split(',') ?? Array.Empty<string>())
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });
        
        // SignalR configuration
        services.AddSignalR();
        
        return services;
    }
}
```

#### 4. Program.cs Usage
```csharp
var builder = WebApplication.CreateBuilder(args);

// Layer-specific service registration
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

// Serilog configuration
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration));

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHubs();

app.Run();
```

### Benefits of ConfigureServices Pattern:
- **Separation of Concerns**: Each layer manages its own dependencies
- **Clean Program.cs**: Minimal, readable startup configuration
- **Maintainability**: Easy to modify layer-specific configurations
- **Testability**: Individual layer configurations can be tested in isolation
- **Consistency**: Standardized pattern across all layers

## Development Patterns

### CQRS (Command Query Responsibility Segregation)
- Separate command and query operations using MediatR
- Dedicated handlers for each operation type
- Clear separation between read and write operations
- Simplified testing and maintenance

### Repository Pattern
- Generic repository implementation with base functionality
- Unit of Work pattern for transaction management
- Consistent data access abstraction across entities
- Interface-based dependencies for testability

### Dependency Injection
- Service registration in dedicated ConfigureServices classes
- Interface-based dependencies throughout all layers
- Scoped lifetime management for database contexts
- Singleton services for stateless operations

### Domain-Driven Design
- Rich domain entities with business logic
- Value objects for complex data types
- Domain events for business process notifications
- Aggregate roots for consistency boundaries

## Error Handling

### Custom Exceptions
- `UnauthorizedAccessException` - Authentication/authorization failures
- `InvalidOperationException` - Business rule violations
- `ArgumentException` - Input validation failures
- `EntityNotFoundException` - Resource not found (planned)
- `ConflictException` - Resource conflicts (planned)
- `ValidationException` - FluentValidation failures (planned)

### Global Exception Handling
- Centralized error handling in API middleware
- Consistent API error response format
- Proper HTTP status code mapping
- Structured logging integration
- Security-aware error messages

### Validation Strategy
- FluentValidation for input validation (planned)
- Domain entity validation in business logic
- Custom validation attributes for specific rules
- Client-side and server-side validation coordination

## Testing Strategy

### Unit Tests
- Domain logic testing
- Application handlers testing
- Service implementations testing
- Validation rules testing

### Integration Tests
- API endpoint testing
- Database operations testing
- External service mocking
- End-to-end workflow testing

## Security Considerations

- JWT token validation and expiration
- Input validation and sanitization
- SQL injection prevention through EF Core
- CORS configuration for frontend
- Slack webhook signature verification
- Rate limiting for API endpoints
- Sensitive data encryption

## Performance Optimization

- Database query optimization
- Lazy loading configuration
- Caching strategies (Redis integration ready)
- Pagination for large datasets
- Background job processing
- Connection pooling

## Logging & Monitoring

- Structured logging with Serilog
- Request/response logging
- Error tracking and alerting
- Performance metrics
- Database query logging
- External service call logging

## Configuration Management

### Connection Strings
- **PostgreSQL**: Primary database for all environments
- **PostgreSQL**: Production database connection
- **RabbitMQ**: Message broker connection (planned)

### External Services
- **JWT Configuration**: Token signing keys and validation parameters
- **Slack Integration**: OAuth credentials and API keys (planned)
- **CORS**: Frontend application URL configurations

### Environment Variables
```
DATABASE_CONNECTION_STRING=Host=localhost;Database=taskmanager;Username=admin;Password=your_password
JWT_KEY=your-super-secret-jwt-key-min-32-characters-long
JWT_ISSUER=TaskManagerAPI
JWT_AUDIENCE=TaskManagerClient
CORS_ORIGINS=http://localhost:4200,http://localhost:4201
```

## Hosting Configuration

### Development Server
- **Kestrel**: HTTP server on port 5109 (configurable)
- **Swagger**: API documentation available at /swagger
- **Database**: PostgreSQL database connection
- **CORS**: Configured for local frontend development

### Health Checks (Planned)
- Database connectivity monitoring
- External service health verification
- Application status endpoints
- Monitoring integrations

## Deployment Configuration

### Docker Support (Planned)
- Multi-stage build process for optimization
- Production-ready container configuration
- Environment-specific configuration management
- Container orchestration support

### Environment-Specific Settings
- Development: PostgreSQL, detailed logging, Swagger enabled
- Staging: PostgreSQL, structured logging, limited debugging
- Production: PostgreSQL, minimal logging, security hardening

## Messaging Architecture (Planned)

### Message Consumers
- **Task Event Consumers**: Process task lifecycle events
- **Notification Consumers**: Handle real-time notifications
- **Integration Consumers**: Process external service events

### Event-Driven Features
- Task status change notifications
- User activity tracking
- Cross-service communication
- Background job processing

## Security Implementation

### Authentication Flow
- JWT token generation and validation
- User context extraction from tokens
- Role-based authorization (planned)
- Secure credential management

### Data Protection
- Password hashing with PBKDF2 and salt
- Secure configuration management
- Input validation and sanitization
- SQL injection prevention through EF Core

This comprehensive backend architecture provides a scalable, maintainable foundation for enterprise-level task management applications. The implementation demonstrates modern .NET development practices with Clean Architecture principles, comprehensive security measures, and extensible patterns for future growth. The modular design supports both current requirements and planned enhancements including Slack integration, real-time features, and advanced analytics.