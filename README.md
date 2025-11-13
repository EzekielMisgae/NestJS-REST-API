# NestJS REST API

NestJS REST API for managing users, products, and transactions with PostgreSQL, TypeORM, and comprehensive error handling.

## Features

- **User Management**: Create users with email uniqueness validation
- **Product Management**: Create products, adjust inventory with pessimistic locking
- **Transaction History**: Track all product transactions with filtering
- **TypeORM Migrations**: Database schema versioning
- **Swagger Documentation**: Interactive API docs at `/api`
- **Global Exception Handling**: Consistent error responses
- **DTO Validation**: Request validation with class-validator
- **ACID Transactions**: Database transactions for inventory adjustments
- **Pessimistic Locking**: Prevents race conditions in concurrent updates

## Tech Stack

- NestJS 10+, TypeScript (strict mode), PostgreSQL 15, TypeORM
- Docker Compose, Swagger/OpenAPI, Joi, Jest

## Quick Start

### Prerequisites
- Node.js 18+, Docker, PostgreSQL 15

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```env
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=nestjs_db
   PORT=3000
   NODE_ENV=development
   ```

3. **Start PostgreSQL:**
   ```bash
   docker compose up -d
   ```

4. **Run migrations:**
   ```bash
   npm run migration:run
   ```

5. **Start application:**
   ```bash
   npm run start:dev
   ```

API: `http://localhost:3000` | Swagger: `http://localhost:3000/api`

## API Endpoints

### Users

**POST /users** - Create a new user
```json
{
  "email": "abebe@example.com",
  "name": "Abebe Kebede"
}
```

### Products

**POST /products** - Create a product
```json
{
  "name": "Laptop",
  "price": 999.99,
  "quantity": 10,
  "description": "High-performance laptop"
}
```

**PUT /products/adjust** - Adjust inventory quantity
- Header: `x-user-id: <user-uuid>`
- Body: `{"productId": "...", "quantityChange": -5, "reason": "..."}`

**GET /products/status/:productId** - Get product status

### Transactions

**GET /transactions** - Get transaction history
- Query params: `userId`, `productId`, `type` (PURCHASE/ADJUSTMENT)

## Project Structure

```
src/
├── config/          # Configuration (TypeORM, env validation)
├── entities/        # Database entities (User, Product, Transaction)
├── migrations/      # Database migrations
├── users/           # Users module (controller, service, repository, DTOs)
├── products/        # Products module
├── transactions/    # Transactions module
├── common/          # Shared utilities (exception filters)
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

## Commands

- `npm run start:dev` - Development with hot reload
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run test:cov` - Test coverage
- `npm run migration:run` - Run migrations
- `npm run migration:revert` - Revert last migration
- `npm run migration:generate` - Generate new migration

## Design Decisions

- **Repository Pattern**: Separates data access from business logic
- **UUID Primary Keys**: Better security and distributed system support
- **Migration-based Schema**: No synchronize mode for production safety
- **Pessimistic Locking**: Prevents race conditions in inventory updates
- **Global Exception Filter**: Consistent error response format
- **DTO Validation**: Request validation at controller level

## Roadmap / Future Enhancements

### 🔐 Authentication & Authorization
- **Sign-up/Login**: Implement JWT-based authentication
- **User Sessions**: Secure user sessions with refresh tokens
- **Role-Based Access Control**: Different permission levels for users
- **Protected Endpoints**: All actions tied to authenticated users

### 📄 Pagination
- **List Endpoints**: Add pagination to `/transactions` and other list endpoints
- **Cursor/Offset Support**: Efficient pagination for large datasets
- **Response Metadata**: Include total count, page info in responses

### 🧪 Testing
- **Unit Tests**: Expand coverage for all services and repositories
- **Integration Tests**: End-to-end API testing
- **E2E Tests**: Full application flow testing
- **Test Fixtures**: Reusable test data and mocks

### ⚡ Caching
- **Redis Integration**: Cache frequent database lookups
- **Product Cache**: Cache product details and status
- **User Cache**: Cache user information
- **Cache Invalidation**: Smart cache invalidation strategies

### 📊 Logging, Monitoring & Error Reporting
- **Structured Logging**: Winston/Pino for production logging
- **Request Logging**: Log all API requests with correlation IDs
- **Error Tracking**: Integration with Sentry or similar services
- **Performance Monitoring**: APM tools for performance metrics
- **Health Checks**: Application health endpoints
- **Metrics**: Prometheus metrics for monitoring

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Application port | `3000` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | Database name | `nestjs_db` |
