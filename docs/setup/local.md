# Local Development Setup

This guide will help you set up and run the application locally on your machine.

## Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- PostgreSQL (v15 or higher)

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meta-assistant-ddf
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   - Create a PostgreSQL database named `meta_assistant`
   - Update the database connection string in your environment variables:
     ```bash
     export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meta_assistant"
     ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

## Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```
   This will start both the frontend and backend servers in development mode.

2. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meta_assistant"
NODE_ENV="development"
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - If you see an error about port 5000 being in use, you can change the port in the server configuration.

2. **Database connection issues**
   - Ensure PostgreSQL is running
   - Verify your database credentials
   - Check if the database exists

3. **Dependency issues**
   - Try clearing the npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Development Workflow

1. Make changes to the code
2. The development server will automatically reload
3. Test your changes in the browser at `http://localhost:3000`

## Additional Commands

- `npm run check` - TypeScript type checking
- `npm test` - Run tests
- `npm run test:coverage` - Generate test coverage report
- `npm run test:ui` - Run tests with UI 