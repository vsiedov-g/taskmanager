# Multi-stage Dockerfile for .NET backend

# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution file
COPY ["TaskManager.sln", "."]

# Copy project files
COPY ["src/TaskManager.Domain/TaskManager.Domain.csproj", "src/TaskManager.Domain/"]
COPY ["src/TaskManager.Application/TaskManager.Application.csproj", "src/TaskManager.Application/"]
COPY ["src/TaskManager.Infrastructure/TaskManager.Infrastructure.csproj", "src/TaskManager.Infrastructure/"]
COPY ["src/TaskManager.API/TaskManager.API.csproj", "src/TaskManager.API/"]

# Copy test project files
COPY ["tests/TaskManager.Domain.Tests/TaskManager.Domain.Tests.csproj", "tests/TaskManager.Domain.Tests/"]
COPY ["tests/TaskManager.Application.Tests/TaskManager.Application.Tests.csproj", "tests/TaskManager.Application.Tests/"]
COPY ["tests/TaskManager.Infrastructure.Tests/TaskManager.Infrastructure.Tests.csproj", "tests/TaskManager.Infrastructure.Tests/"]
COPY ["tests/TaskManager.API.Tests/TaskManager.API.Tests.csproj", "tests/TaskManager.API.Tests/"]

# Restore dependencies
RUN dotnet restore "TaskManager.sln"

# Copy source code
COPY . .

# Build the application
WORKDIR "/src/src/TaskManager.API"
RUN dotnet build "TaskManager.API.csproj" -c Release -o /app/build

# Development stage for hot reload
FROM build AS development
WORKDIR /src
RUN dotnet dev-certs https --trust
ENTRYPOINT ["dotnet", "watch", "run", "--project", "src/TaskManager.API/TaskManager.API.csproj", "--urls", "http://0.0.0.0:80;https://0.0.0.0:443"]

# Test stage
FROM build AS test
WORKDIR /src
RUN dotnet test "TaskManager.sln" --logger trx --results-directory /testresults

# Publish stage
FROM build AS publish
WORKDIR "/src/src/TaskManager.API"
RUN dotnet publish "TaskManager.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Production stage
FROM base AS production
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "TaskManager.API.dll"]