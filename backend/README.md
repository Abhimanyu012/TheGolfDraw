# TheGolfDraw Backend

A Node.js/Express backend for TheGolfDraw application.

## Features
- JWT Authentication
- Password encryption with bcryptjs
- CORS support
- Morgan logging
- MVC architecture

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`.
	- `DATABASE_URL` is required and must point to a reachable Postgres instance.

## Running the Server

Before starting the app, make sure your Postgres database is running and `DATABASE_URL` is valid.

### Development (with nodemon):
```bash
npm run dev
```

### Production:
```bash
npm start
```

## Project Structure

```
src/
├── app.js           # Express app setup
├── config/          # Configuration files
├── controllers/     # Request handlers
├── db/              # Database connection setup
├── middlewares/     # Custom middlewares
├── models/          # Data models
├── routes/          # Route definitions
└── utils/           # Helper functions
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Dependencies

- **express** - Web framework
- **cors** - Enable CORS
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **morgan** - HTTP request logger

## Dev Dependencies

- **nodemon** - Auto-restart server on file changes

## License

ISC
