# UnivendorPro

A modern e-commerce platform built with Node.js, React, and PostgreSQL.

## Setup

1. Clone the repository
```bash
git clone [your-repository-url]
cd UnivendorPro
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```env
DATABASE_URL=your_database_url
NODE_ENV=development
PORT=5000
SESSION_SECRET=your_session_secret
```

4. Run database migrations
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

## Production Deployment

The application is configured for deployment on Render.com. Required environment variables:

- DATABASE_URL
- NODE_ENV
- PORT
- SESSION_SECRET
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- CLIENT_URL
- SERVER_URL

## Features

- User authentication
- Product management
- Shopping cart functionality
- Order processing
- Email notifications
- Admin dashboard 