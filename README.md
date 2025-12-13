# Backend - Event Booking System

This is the backend API for the Event Booking System built with Express, TypeScript, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend folder:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

3. Run the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run typecheck` - Type check without building

## API Endpoints

- `/api/auth/*` - Authentication routes
- `/api/events/*` - Event management routes
- `/api/bookings/*` - Booking management routes
