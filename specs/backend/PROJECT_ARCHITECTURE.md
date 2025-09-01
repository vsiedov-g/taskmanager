# Clean Architecture .NET Web API - Project Structure Guide

## Overview

This is a .NET 9 web API built using Clean Architecture principles. It demonstrates enterprise-level patterns for managing domain entities, business logic, external integrations, and API endpoints in a scalable, maintainable architecture.

## Project Structure

### Solution Structure
```
ProjectName/
├── ProjectName.WebApi/                      # Web API Layer
├── ProjectName.Application/                 # Application Logic Layer  
├── ProjectName.Infrastructure/              # Infrastructure Layer
└── ProjectName.Domain/                      # Domain Layer
```

### Clean Architecture Layers

#### 1. **Domain Layer** (`ProjectName.Domain`)
- **Entities**: Core business models
  - Core entities like `User`, `Company`, `Product`, `Order`
  - Supporting entities for workflows and relationships
  - Integration entities for external services
- **Enums**: Business domain enumerations
  - Status enums (Active, Inactive, Pending, etc.)
  - Type enums for categorization
  - Business process state enums
- **Common**: Base entities and shared domain logic
  - `BaseEntity`, `BaseAuditableEntity`
- **Events**: Domain events for business processes
  - Entity lifecycle events (Created, Updated, Deleted)
  - Business workflow events
  - Integration events for external systems

#### 2. **Application Layer** (`ProjectName.Application`)
- **Commands & Queries**: CQRS implementation using MediatR
  - Entity CRUD operations
  - Business process workflows
  - External service integrations
- **DTOs**: Data transfer objects for API contracts
- **Interfaces**: Abstractions for external dependencies
- **Validators**: FluentValidation rules for input validation
- **Mapping**: AutoMapper profiles for object mapping
- **Exceptions**: Custom application exceptions

#### 3. **Infrastructure Layer** (`ProjectName.Infrastructure`)
- **Persistence**: Entity Framework Core data access
  - `ApplicationDbContext` with database provider support
  - Entity configurations and migrations
  - Repository pattern implementation
- **Services**: External service implementations
  - Payment processing integrations
  - Authentication service providers
  - Monitoring and analytics services
  - Communication services (Email, SMS, etc.)
- **Messaging**: Message broker integration using MassTransit
  - Event consumers for business processes
  - Background job processing
  - Cross-service communication

#### 4. **Web API Layer** (`ProjectName.WebApi`)
- **Controllers**: REST API endpoints
  - Entity management controllers
  - Business process controllers
  - Integration and webhook controllers
- **gRPC Services**: Inter-service communication
  - High-performance service-to-service APIs
  - Internal system integrations
- **Middleware**: Request processing pipeline
  - Authentication metadata middleware
- **Filters**: Cross-cutting concerns
  - API exception handling

## Technology Stack

### Framework & Runtime
- **.NET 9**: Latest .NET version with improved performance
- **ASP.NET Core**: Web framework for REST APIs and gRPC

### Database & ORM
- **PostgreSQL**: Primary database with Entity Framework Core
- **Entity Framework Core 9.0.6**: ORM with migrations support
- **In-Memory Database**: Available for testing scenarios

### Authentication & Security  
- **JWT Bearer Authentication**: Token-based authentication
- **Identity Provider Integration**: External authentication services

### Communication
- **gRPC**: High-performance inter-service communication
- **RabbitMQ + MassTransit**: Asynchronous messaging
- **HTTP Clients**: External API integrations

### Third-Party Integrations
- **Payment Providers**: Payment processing and subscription management
- **AutoMapper**: Object-to-object mapping
- **FluentValidation**: Input validation
- **MediatR**: CQRS and mediator pattern

## Key Architectural Features

### 1. **Multi-Tenant Entity Management**
- User registration and profile management
- Organizational entity creation and configuration
- Tenant isolation and data segregation

### 2. **Role-Based Access Control**
- User invitation and onboarding workflows
- Hierarchical permission systems
- Dynamic role assignment

### 3. **External Service Integration**
- Third-party service integrations
- Multiple service provider support
- Webhook handling for external events

### 4. **Usage Tracking & Analytics**
- Service consumption monitoring
- Resource limit management
- Usage analytics and reporting

### 5. **Inter-Service Communication**
- gRPC services for high-performance communication
- Message bus integration for distributed events
- Event-driven architecture patterns

## Database Schema Patterns

### Core Entity Types
- **Tenant Entities**: Central entities for multi-tenancy
- **User Entities**: Tenant members with roles and permissions
- **Business Entities**: Core business domain objects
- **Audit Entities**: Change tracking and history
- **Usage Entities**: Resource consumption tracking

### Common Relationships
- One-to-Many: Tenant → Users, Business Objects
- One-to-One: User → Profile, Tenant → Configuration
- Many-to-Many: Users ↔ Roles, Entities ↔ Categories

## Configuration

### Connection Strings
- PostgreSQL database connection
- RabbitMQ message broker connection

### External Services
- **Identity Providers**: Authentication service configuration
- **Payment Processors**: Payment processing API keys
- **CORS**: Client application and gateway URL configurations

### Hosting
- **Kestrel**: HTTP server on port 5256
- **gRPC**: Dedicated endpoint on port 5266
- **Health Checks**: Database connectivity monitoring

## API Endpoint Patterns

### Authentication Endpoints (`/api/auth`)
- User registration and verification
- Password and credential management

### User Management (`/api/users`)
- User profile operations
- User preferences and settings
- Security feature management

### Tenant Management (`/api/tenants`)
- Tenant profile management
- Configuration and settings

### Access Control (`/api/access`)
- Member invitations and onboarding
- Role assignments and permissions
- Team member management

### External Integrations (`/api/integrations`)
- Service provider management
- Configuration and credentials
- Webhook endpoints

### Analytics & Reporting (`/api/analytics`)
- Usage tracking and metrics
- Resource monitoring
- Report generation

## gRPC Service Patterns

### Data Access Services
- Tenant data retrieval
- User information access
- Resource usage reporting
- Configuration information
- Service status queries

## Messaging Architecture

### Message Consumers
- **Usage Tracking Consumers**: Process service usage events
- **Billing Consumers**: Handle subscription and payment events
- **Notification Consumers**: Process communication events

### Event-Driven Features
- User invitation workflows
- Token usage tracking
- Payment processing events

## Development Patterns

### CQRS (Command Query Responsibility Segregation)
- Separate command and query operations
- MediatR implementation for clean separation
- Dedicated handlers for each operation

### Repository Pattern
- Generic repository implementation
- Unit of Work pattern
- Consistent data access abstraction

### Dependency Injection
- Service registration in dedicated configuration classes
- Interface-based dependencies
- Scoped lifetime management

## Error Handling

### Custom Exceptions
- `BadRequestException`, `NotFoundException`
- `ConflictException`, `ValidationException`
- `ExternalServiceException`, `BusinessRuleException`

### Global Exception Filter
- Centralized error handling
- Consistent API error responses
- Logging integration

## Security Considerations

### Authentication Flow
- JWT token validation
- Company and user context extraction
- Role-based authorization

### Data Protection
- Sensitive data encryption
- Secure configuration management
- Input validation and sanitization

## Deployment Configuration

### Environment Variables
- Database connection strings
- External service credentials
- Feature flags and environment settings

### Docker Support
- Containerized deployment
- Multi-stage build process
- Production-ready configuration

This architecture provides a scalable, maintainable foundation for enterprise-level web APIs with strong separation of concerns and modern .NET development practices. The patterns demonstrated can be adapted to various business domains and requirements.