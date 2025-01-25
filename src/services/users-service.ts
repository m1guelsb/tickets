import * as mysql from "mysql2/promise";
import { createConnection } from "../database";

export class UsersService {
  async findById(userId: number) {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE id = ?",
        [userId]
      );
      return rows.length ? rows[0] : null;
    } finally {
      await connection.end();
    }
  }

  async findByEmail(email: number) {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      return rows.length ? rows[0] : null;
    } finally {
      await connection.end();
    }
  }
}
