# 📚 BookShelf AI Lab

BookShelf AI Lab is a full-stack monorepo project built during the AI-Enabled Developer Intensive.

This project explores how modern AI tools can accelerate software development while keeping developers responsible for architecture, validation, and delivery.

## ✨ Features

- Book catalogue management
- Search by title, author, and genre
- Shelves (Reading / Finished / Want to Read)
- Reviews system
- REST API
- React frontend *(planned)*
- JSON-based persistence
- AI-assisted development workflow

---

## 🏗 Project Structure

```
bookshelf-ai-lab/
├── apps/
│   └── api/                 # Express REST API
│       └── src/
│           ├── config/      # Env and API configuration
│           ├── data/        # JSON file operations
│           ├── middleware/  # Validation, logging, errors
│           ├── routes/      # Request/response handling
│           ├── services/    # Business logic
│           ├── app.ts
│           └── server.ts
├── packages/
│   └── shared/              # Shared types and error classes
├── data/
│   ├── books.json           # 30 seed books
│   ├── shelves.json
│   └── reviews.json
├── .env.example
└── README.md
```

### Architecture

| Layer | Responsibility |
|-------|----------------|
| **Routes** | Request/response handling only |
| **Services** | Business logic |
| **Data** | File read/write operations |
| **Middleware** | Validation, error handling, logging |
| **Shared** | Types and utilities |

---

## 🚀 Tech Stack

- Node.js
- Express
- TypeScript
- React *(planned)*
- Monorepo (npm workspaces)
- AI Development Tools

---

## ⚡ Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Server:

```
http://localhost:4000
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with hot reload |
| `npm run start` | Build and start production server |
| `npm run build` | Compile TypeScript |
| `npm run lint` | Run ESLint |

### Environment

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `API_BASE_PATH` | `/api` | API route prefix |
| `DATA_DIR` | `./data` | Path to JSON data files |

---

## 📡 API Endpoints

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/books` | List all books (pagination + filters) |
| `GET` | `/books/search?q=` | Search by title, author, or genre |
| `GET` | `/books/:id` | Get a single book |
| `POST` | `/books` | Create a new book |
| `GET` | `/health` | Health check |

### Query Parameters — `GET /books`

| Param | Description |
|-------|-------------|
| `page` | Page number (default: `1`) |
| `limit` | Results per page (default: `10`, max: `100`) |
| `genre` | Filter by genre (exact match) |
| `author` | Filter by author (partial match) |
| `year` | Filter by publication year |

### Example Requests

```bash
# List books with pagination
curl 'http://localhost:4000/api/books?page=1&limit=5'

# Filter by genre
curl 'http://localhost:4000/api/books?genre=Fantasy'

# Search
curl 'http://localhost:4000/api/books/search?q=tolkien'

# Get one book
curl http://localhost:4000/api/books/book_001

# Create a book
curl -X POST http://localhost:4000/api/books \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "New Book",
    "author": "Jane Doe",
    "genre": "Fiction",
    "year": 2024,
    "isbn": "9780000000002",
    "description": "A great read."
  }'
```

### Error Responses

All errors return a consistent shape. Stack traces are hidden in production.

```json
{
  "success": false,
  "error": {
    "message": "Book with id 'missing_id' not found",
    "code": "NOT_FOUND"
  }
}
```

---

## 🎯 Learning Goals

- Build with AI coding assistants
- Improve prompting and context management
- Compare AI workflows
- Ship production-oriented software faster

---

## 🧠 Built With

- Claude Code
- GitHub Copilot
- ChatGPT
- Cursor

(Used for experimentation and comparison)

---

## 📌 Status

Day 1 — API complete ✅ | Frontend in progress 🚧
