import { Pool } from "pg";

// Create a new Pool instance using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export the pool for use in other parts of the application
export default pool;
