.PHONY: help build up down logs clean install dev prod restart

# Default target
help: ## Show this help message
	@echo "QuickNotes - Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
install: ## Install dependencies for backend and frontend
	@echo "Installing backend dependencies..."
	cd backend && npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

dev: ## Start development environment with live reload
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

dev-bg: ## Start development environment in background
	@echo "Starting development environment in background..."
	docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build -d

# Production commands
build: ## Build all Docker images
	@echo "Building Docker images..."
	docker-compose build

up: ## Start production environment
	@echo "Starting production environment..."
	docker-compose up -d

prod: ## Start production environment with build
	@echo "Starting production environment..."
	docker-compose up --build -d

# Management commands
down: ## Stop all services
	@echo "Stopping all services..."
	docker-compose down

restart: ## Restart all services
	@echo "Restarting all services..."
	docker-compose restart

logs: ## Show logs from all services
	docker-compose logs -f

logs-api: ## Show logs from API services
	docker-compose logs -f api-1 api-2

logs-db: ## Show logs from database services
	docker-compose logs -f postgres redis

# Utility commands
clean: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

health: ## Check health of all services
	@echo "Checking service health..."
	@echo "API Health:"
	@curl -f http://localhost:8080/health 2>/dev/null && echo " ✓ API is healthy" || echo " ✗ API is unhealthy"
	@echo "Frontend:"
	@curl -f http://localhost:3000 2>/dev/null && echo " ✓ Frontend is healthy" || echo " ✗ Frontend is unhealthy"

setup: ## Initial setup - copy .env.example to .env and install dependencies
	@echo "Setting up QuickNotes..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file"; fi
	@make install
	@echo "Setup complete! Run 'make dev' to start development environment."

# Database commands
db-reset: ## Reset database (removes all data)
	@echo "Resetting database..."
	docker-compose down postgres
	docker volume rm quicknotes_postgres_data 2>/dev/null || true
	docker-compose up -d postgres 