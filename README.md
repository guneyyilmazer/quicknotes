# QuickNotes - Mini SaaS Note-Taking App

A scalable note-taking application built with Node.js, React, PostgreSQL, and Redis, fully containerized with Docker.

## 🏗️ Architecture

QuickNotes is designed as a microservices architecture with the following components:

### Services
- **Frontend**: React.js application served via NGINX
- **API Load Balancer**: NGINX reverse proxy with load balancing
- **API Instances**: 2x Node.js Express servers for high availability
- **Database**: PostgreSQL for persistent data storage
- **Cache**: Redis for search result caching
- **Monitoring**: Prometheus-compatible metrics endpoint

### Service Communication
```
Frontend (React) → NGINX LB → API Instance 1/2 → PostgreSQL/Redis
                     ↓
              Health Checks & Metrics
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Make (optional, for convenience commands)

### Setup (Windows - PowerShell)
1. Clone and enter the project:
   ```powershell
   git clone <repository>
   cd quicknotes
   ```
2. Copy .env if missing:
   ```powershell
   if (!(Test-Path .env) -and (Test-Path .env.example)) { Copy-Item .env.example .env }
   ```
3. Start development (hot reload):
   ```powershell
   docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
   ```
   - Start in background:
     ```powershell
     docker compose -f docker-compose.yml -f docker-compose.override.yml up --build -d
     ```
4. Open:
   - Frontend: http://localhost:3000
   - API (Load Balanced): http://localhost:8080

### Setup (macOS/Linux)
1. Clone and setup:
   ```bash
   git clone <repository>
   cd quicknotes
   chmod +x setup.sh
   ./setup.sh
   ```
2. Start development environment:
   ```bash
   make dev
   ```
3. Access the application:
   - Frontend: http://localhost:3000
   - API (Load Balanced): http://localhost:8080
   - Database: localhost:5432
   - Redis: localhost:6379

### Alternative Setup (without Make)
- macOS/Linux:
```bash
# Copy environment file
cp .env.example .env

# Start development
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Start production
docker compose up --build -d
```
- Windows (PowerShell):
```powershell
if (!(Test-Path .env) -and (Test-Path .env.example)) { Copy-Item .env.example .env }

docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
# Or production
docker compose up --build -d
```

## 📋 Available Commands

```bash
make help           # Show all available commands
make dev            # Start development with live reload
make prod           # Start production environment
make down           # Stop all services
make logs           # View logs from all services
make clean          # Clean up Docker resources
make health         # Check service health
make db-reset       # Reset database
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_DB` | Database name | `quicknotes` |
| `POSTGRES_USER` | Database user | `quicknotes_user` |
| `POSTGRES_PASSWORD` | Database password | `quicknotes_pass` |
| `JWT_SECRET` | JWT signing secret | `dev-jwt-secret-key-change-in-production` |
| `NODE_ENV` | Node environment | `development` |
| `VITE_API_URL` | Frontend API base (optional). If unset, frontend uses relative `/api` | — |

## 📡 API Endpoints

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Notes Management
```http
GET    /api/notes              # Get user's notes
POST   /api/notes              # Create new note
GET    /api/notes/:id          # Get specific note
PUT    /api/notes/:id          # Update note
DELETE /api/notes/:id          # Delete note
GET    /api/notes/search/by-tags  # Search notes by tags
```

### System
```http
GET /health                    # Health check
GET /metrics                   # Prometheus metrics
```

### Request/Response Examples

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Create Note
```http
POST /api/notes
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note",
  "tags": ["personal", "important"]
}
```

#### Search Notes
```http
GET /api/notes/search/by-tags?tags=personal,work
Authorization: Bearer <jwt_token>
```

## 🏛️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- API Health: `GET /health`
- Individual Services: Docker health checks configured

### Prometheus Metrics
- Available at: `GET /metrics`
- Metrics include: HTTP requests, response times, active connections

### Load Balancing
- NGINX round-robin between 2 API instances
- Automatic health checking and failover
- Rate limiting: 10 requests/second per IP

## 🔄 Caching Strategy

Redis is used for caching search results:
- **Cache Key Pattern**: `search:{userId}:{tagsHash}`
- **TTL**: 300 seconds (5 minutes)
- **Cache Invalidation**: On note create/update/delete

## 🏗️ Development vs Production

### Development Features
- Live reload for both frontend and backend
- Source code mounted as volumes
- Exposed database ports for debugging
- Development environment variables

### Production Features
- Optimized Docker images
- Health checks and automatic restarts
- Security headers and rate limiting
- Container resource limits

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Security headers (XSS, CSRF protection)
- SQL injection prevention with parameterized queries

## 📈 Scalability & Performance

### Horizontal Scaling
- Multiple API instances behind load balancer
- Stateless API design
- Database connection pooling
- Redis for shared session/cache storage

### Performance Optimizations
- Database indexing on frequently queried fields
- Redis caching for search results
- NGINX gzip compression
- Static asset caching
- Connection pooling

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Authentication**: JWT
- **Monitoring**: Prometheus client

### Frontend
- **Framework**: React.js
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + shadcn/ui

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Load Balancer**: NGINX
- **Database**: PostgreSQL with optimized indexes
- **Cache**: Redis for session and search caching

## 🚨 Troubleshooting

### Common Issues

```bash
make clean  # Clean up Docker resources
make prod   # Restart
```

2. **Database connection issues:**
```bash
make db-reset  # Reset database
```

3. **Check service health:**
```bash
make health
make logs
```

### Debug Mode
```bash
# View logs in real-time
make logs

# Check specific service logs
docker-compose logs -f api-1
docker-compose logs -f postgres
```

## 🎯 Trade-offs & Design Decisions

### Architecture Decisions
1. **Microservices vs Monolith**: Chose microservices for scalability demonstration
2. **Load Balancer**: NGINX for simplicity and performance
3. **Database**: PostgreSQL for ACID compliance and array support for tags
4. **Cache**: Redis for high-performance search result caching

### Performance Trade-offs
1. **Multiple API Instances**: Higher resource usage but better availability
2. **Database Normalization**: Normalized schema vs denormalized for read performance
3. **Caching Strategy**: Memory usage vs query performance

### Security vs Convenience
1. **JWT vs Sessions**: JWT for stateless scaling vs session security
2. **Rate Limiting**: Protection vs user experience
3. **CORS Policy**: Security vs development convenience

## 📝 TODOs & Future Improvements

- [ ] Implement proper logging with structured logs
- [ ] Add API versioning
- [ ] Implement note sharing between users
- [ ] Add full-text search with Elasticsearch
- [ ] Implement WebSocket for real-time updates
- [ ] Add comprehensive test suite
- [ ] Implement CI/CD pipeline
- [ ] Add monitoring dashboard with Grafana
- [ ] Implement backup and recovery procedures

## 📄 License

This project is for educational/assignment purposes. # quicknotes
