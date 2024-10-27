import "server-only";

import db from "@/lib/db";

export async function getUser(email) {
  try {

    // Check if the users table exists
        // const tableExists = await db.query(
        //   "SELECT to_regclass('public.users') IS NOT NULL AS exists"
        // );

        // if (!tableExists.rows[0].exists) {
        //   // Create the users table if it doesn't exist
        //   await db.query(`
        //     CREATE TABLE users (
        //       id SERIAL PRIMARY KEY,
        //       email VARCHAR(255) UNIQUE NOT NULL,
        //       password VARCHAR(255) NOT NULL
        //     )
        //   `);

        //   // Insert a default user
        //   await db.query(
        //     "INSERT INTO users (email, password) VALUES ($1, $2)",
        //     [
        //       "user@user.com",
        //       "$2a$12$5N5yKaIIW6PQ2JFP.aBSy.dYGTBGq5pC1f9lA/Adkb3HmdafCkeum"
        //     ]
        //   );

        //   console.log("Users table created and default user inserted.");
        // }
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}
