# TypeScript Express CRUD API with Drizzle ORM & PostgreSQL

This repository contains a robust, containerized, fully documented, and secure REST-CRUD application built using Node.js, Express, TypeScript, and Drizzle ORM, with PostgreSQL as the relational database. Authentication is managed using JSON Web Tokens (JWT) and passwords are encrypted using `bcryptjs`. The project also contains integration test coverage using Jest and Supertest.

## 🚀 Features

- **TypeScript Foundation:** Fully typed development experience.
- **Drizzle ORM:** Fast, type-safe query building and database migrations.
- **PostgreSQL Database:** Containerized PostgreSQL setup via Docker Compose.
- **JWT Authentication:** Secure user registration, password hashing (bcrypt), and authenticated login issuing JSON Web Tokens.
- **CRUD Operations:** Ownership-scoped REST API endpoints to Create, Read, Update, and Delete items.
- **Comprehensive Testing:** Automation tests using Jest and Supertest.
- **Production Ready Config:** Production compile configurations and clean separation of concerns.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL (v16)
- **ORM:** Drizzle ORM
- **Authentication:** JSON Web Tokens (JWT) & BcryptJS
- **Testing:** Jest & Supertest

---

## 📋 Prerequisites

Before running the application, make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/) and Docker Compose

---

## ⚙️ Getting Started

### 1. Clone & Install Dependencies

```bash
# Install package dependencies
npm install
```

### 2. Environment Variables Configuration

Copy the template env file to `.env` and fill in the details:

```bash
cp .env.example .env
```

The default configuration in `.env` is:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgrespassword123@localhost:5432/node_crud_db
JWT_SECRET=supersecretjwtkey123456!
JWT_EXPIRES_IN=24h
```

### 3. Spin up PostgreSQL Database

Use Docker Compose to run the PostgreSQL server locally:

```bash
docker compose up -d
```

This starts PostgreSQL in the background on port `5432` with database `node_crud_db`.

### 4. Run Database Migrations

Generate migration files from the Drizzle schema and apply them to the PostgreSQL database:

```bash
# Generate the SQL migration files (output to ./drizzle)
npm run db:generate

# Push the schemas/updates directly to the database
npm run db:push
```

### 5. Start the Application

To run the server in development mode with live reloading:

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

---

## 📖 API Documentation

### 🔓 Public Routes / Health Check

#### 1. API Health Check
- **Endpoint:** `GET /health`
- **Response:**
  ```json
  {
    "status": "OK",
    "timestamp": "2026-07-02T15:30:00.000Z"
  }
  ```

---

### 🔑 Authentication Routes

#### 1. User Registration
- **Endpoint:** `POST /api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "createdAt": "2026-07-02T15:31:00.000Z"
    }
  }
  ```

#### 2. User Login
- **Endpoint:** `POST /api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com"
    }
  }
  ```

---

### 📦 Protected CRUD Routes

*Note: All request headers must include `Authorization: Bearer <your_jwt_token>`.*

#### 1. Create an Item
- **Endpoint:** `POST /api/items`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "Mechanical Keyboard",
    "description": "Hot-swappable 75% layout keyboard",
    "price": 89.99
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Item created successfully",
    "item": {
      "id": 1,
      "name": "Mechanical Keyboard",
      "description": "Hot-swappable 75% layout keyboard",
      "price": 89.99,
      "userId": 1,
      "createdAt": "2026-07-02T15:32:00.000Z",
      "updatedAt": "2026-07-02T15:32:00.000Z"
    }
  }
  ```

#### 2. Get All Items
Retrieves all items owned by the authenticated user.
- **Endpoint:** `GET /api/items`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "Mechanical Keyboard",
        "description": "Hot-swappable 75% layout keyboard",
        "price": 89.99,
        "userId": 1,
        "createdAt": "2026-07-02T15:32:00.000Z",
        "updatedAt": "2026-07-02T15:32:00.000Z"
      }
    ]
  }
  ```

#### 3. Get Item by ID
Retrieves details of a specific item, provided it is owned by the authenticated user.
- **Endpoint:** `GET /api/items/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "item": {
      "id": 1,
      "name": "Mechanical Keyboard",
      "description": "Hot-swappable 75% layout keyboard",
      "price": 89.99,
      "userId": 1,
      "createdAt": "2026-07-02T15:32:00.000Z",
      "updatedAt": "2026-07-02T15:32:00.000Z"
    }
  }
  ```

#### 4. Update an Item
Updates fields of a specific item (only if owned by the user).
- **Endpoint:** `PUT /api/items/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body (Partial updates supported):**
  ```json
  {
    "price": 79.99
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Item updated successfully",
    "item": {
      "id": 1,
      "name": "Mechanical Keyboard",
      "description": "Hot-swappable 75% layout keyboard",
      "price": 79.99,
      "userId": 1,
      "createdAt": "2026-07-02T15:32:00.000Z",
      "updatedAt": "2026-07-02T15:33:00.000Z"
    }
  }
  ```

#### 5. Delete an Item
Deletes an item (only if owned by the user).
- **Endpoint:** `DELETE /api/items/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
  ```json
  {
    "message": "Item deleted successfully"
  }
  ```

---

## 🧪 Running Tests

Ensure that the PostgreSQL container is running before executing tests. Jest runs the integration test suite using Supertest and resets the user/item database schema state dynamically.

```bash
# Run the test suite
npm run test
```
