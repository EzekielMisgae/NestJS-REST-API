# NestJS REST API

NestJS REST API for managing users, products, and transactions with PostgreSQL, TypeORM, and comprehensive error handling.

## Features

- **User Management**: Create and manage users with email uniqueness validation
- **Product Management**: Create products, adjust inventory quantities with pessimistic locking
- **Transaction History**: Track all product transactions with filtering capabilities
- **TypeORM Migrations**: Database schema versioning without synchronize mode
- **Swagger Documentation**: Interactive API documentation at `/api`
- **Global Exception Handling**: Consistent error responses across all endpoints
- **DTO Validation**: Request validation using class-validator decorators
- **Transaction Management**: ACID-compliant inventory adjustments
- **Pessimistic Locking**: Prevents race conditions in concurrent updates

## Tech Stack

- **NestJS 10+**: Progressive Node.js framework
- **TypeScript**: Strict mode enabled
- **PostgreSQL 15**: Relational database
- **TypeORM**: Object-Relational Mapping
- **Docker Compose**: Local development environment
- **Swagger/OpenAPI**: API documentation
- **Joi**: Environment variable validation
- **Jest**: Unit testing framework

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15 (or use Docker Compose)

## Project Structure

```
src/
├── config/              # Configuration files
│   ├── data-source.ts   # TypeORM data source for migrations
│   ├── env.validation.ts # Joi validation schema
│   └── typeorm.config.ts # TypeORM module configuration
├── entities/            # TypeORM entities
│   ├── user.entity.ts
│   ├── product.entity.ts
│   └── transaction.entity.ts
├── migrations/          # Database migrations
│   └── InitialSchema.ts
├── users/               # Users module
│   ├── dto/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   └── users.module.ts
├── products/            # Products module
│   ├── dto/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.repository.ts
│   └── products.module.ts
├── transactions/        # Transactions module
│   ├── dto/
│   ├── transactions.controller.ts
│   ├── transactions.service.ts
│   ├── transactions.repository.ts
│   └── transactions.module.ts
├── common/              # Shared utilities
│   └── filters/
│       └── http-exception.filter.ts
├── app.module.ts        # Root module
└── main.ts              # Application entry point
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=inventory_db
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

### 3. Start PostgreSQL with Docker Compose

```bash
docker compose up -d
```

**Note:** If you're using an older version of Docker that requires the hyphenated command, use `docker-compose` instead. Newer Docker Desktop versions use `docker compose` (with a space).

This will start a PostgreSQL 15 container with the database configured.

### 4. Run Migrations

```bash
npm run migration:run
```

This will create all necessary database tables.

### 5. Start the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
Swagger documentation at `http://localhost:3000/api`

## API Endpoints

### Users

#### POST /users
Create a new user.

**Request Body:**
```json
{
  "email": "abebe@example.com",
  "name": "Abebe Kebede"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "abebe@example.com",
  "name": "Abebe Kebede",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `409 Conflict`: User with email already exists
- `400 Bad Request`: Validation error

### Products

#### POST /products
Create a new product.

**Request Body:**
```json
{
  "name": "Laptop",
  "price": 999.99,
  "quantity": 10,
  "description": "High-performance laptop"
}
```

**Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Laptop",
  "price": 999.99,
  "quantity": 10,
  "description": "High-performance laptop",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT /products/adjust
Adjust product quantity (increase or decrease inventory).

**Headers:**
- `x-user-id`: UUID of the user making the adjustment (required)

**Request Body:**
```json
{
  "productId": "123e4567-e89b-12d3-a456-426614174000",
  "quantityChange": -5,
  "reason": "Damaged items returned"
}
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Laptop",
  "price": 999.99,
  "quantity": 5,
  "description": "High-performance laptop",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid UUID, insufficient quantity, or validation error
- `404 Not Found`: Product or user not found

#### GET /products/status/:productId
Get current product status.

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Laptop",
  "quantity": 5,
  "price": 999.99,
  "description": "High-performance laptop",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Product not found

### Transactions

#### GET /transactions
Get transaction history with optional filters.

**Query Parameters:**
- `userId` (optional): Filter by user UUID
- `productId` (optional): Filter by product UUID
- `type` (optional): Filter by transaction type (`PURCHASE` or `ADJUSTMENT`)

**Example:**
```
GET /transactions?userId=123e4567-e89b-12d3-a456-426614174001&type=ADJUSTMENT
```

**Response (200):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "type": "ADJUSTMENT",
    "quantityChange": -5,
    "amount": 4999.95,
    "reason": "Damaged items returned",
    "userId": "123e4567-e89b-12d3-a456-426614174001",
    "productId": "123e4567-e89b-12d3-a456-426614174002",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

## Database Migrations

### Generate a new migration
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Run migrations
```bash
npm run migration:run
```

### Revert last migration
```bash
npm run migration:revert
```

## Testing

### Run unit tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:cov
```

## Design Decisions and Trade-offs

### Architecture

1. **Repository Pattern**: Separates data access logic from business logic, making the codebase more testable and maintainable.

2. **Service Layer**: Contains all business logic, ensuring controllers remain thin and focused on HTTP concerns.

3. **DTO Validation**: Request validation at the controller level using class-validator ensures invalid data never reaches the service layer.

4. **Modular Structure**: Each feature (users, products, transactions) is self-contained in its own module, promoting separation of concerns.

### Database Design

1. **UUID Primary Keys**: Using UUIDs instead of auto-incrementing integers provides:
   - Better security (non-sequential IDs)
   - Easier distributed system integration
   - No collision risk in microservices

2. **No Synchronize Mode**: TypeORM's synchronize is disabled in favor of migrations for:
   - Production safety
   - Version control of schema changes
   - Better collaboration in teams

3. **Foreign Key Constraints**: CASCADE delete ensures data integrity when parent records are removed.

### Concurrency Control

1. **Pessimistic Locking**: Used in product quantity adjustments to prevent race conditions:
   - Ensures data consistency
   - Prevents negative inventory
   - Trade-off: Slightly reduced throughput due to locking

2. **Transaction Management**: Database transactions ensure atomicity when adjusting inventory and creating transaction records.

### Error Handling

1. **Global Exception Filter**: Provides consistent error response format across all endpoints.

2. **HTTP Status Codes**: Proper use of status codes (400, 404, 409, 500) for different error scenarios.

3. **Validation Errors**: Automatic validation error responses from class-validator.

### Security Considerations

1. **Input Validation**: All inputs are validated using DTOs with class-validator decorators.

2. **SQL Injection Prevention**: TypeORM's parameterized queries prevent SQL injection.

3. **Environment Variables**: Sensitive configuration stored in environment variables with Joi validation.

### Performance Considerations

1. **Database Indexing**: Email field is unique (indexed) for fast lookups.

2. **Eager Loading**: Transaction relations are loaded when needed to avoid N+1 queries.

3. **Connection Pooling**: TypeORM handles connection pooling automatically.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | `development` |
| `PORT` | Application port | `3000` |
| `POSTGRES_HOST` | PostgreSQL host | `localhost` |
| `POSTGRES_PORT` | PostgreSQL port | `5432` |
| `POSTGRES_USER` | PostgreSQL user | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_DB` | PostgreSQL database name | `nestjs_db` |

## Scripts

- `npm run build`: Build the application
- `npm run start`: Start the application
- `npm run start:dev`: Start in development mode with hot reload
- `npm run start:prod`: Start in production mode
- `npm test`: Run unit tests
- `npm run test:cov`: Run tests with coverage
- `npm run lint`: Lint the codebase
- `npm run format`: Format code with Prettier
- `npm run migration:run`: Run pending migrations
- `npm run migration:revert`: Revert last migration

## License

MIT

