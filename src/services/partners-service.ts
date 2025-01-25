import bcrypt from "bcrypt";
import * as mysql from "mysql2/promise";
import { createConnection } from "../database";

export class PartnersService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    company: string;
  }) {
    const { name, email, password, company } = data;

    const connection = await createConnection();
    try {
      const createdAt = new Date();
      const hashedPassword = bcrypt.hashSync(password, 10);

      const [userResult] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, createdAt]
      );
      const userId = userResult.insertId;

      const [partnerResult] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO partners (user_id, company, created_at) VALUES (?, ?, ?)",
        [userId, company, createdAt]
      );

      return {
        id: partnerResult.insertId,
        user_id: userId,
        name,
        company,
        created_at: createdAt,
      };
    } finally {
      await connection.end();
    }
  }

  async findByUserId(userId: number) {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM partners WHERE user_id = ?",
        [userId]
      );
      return rows.length ? rows[0] : null;
    } finally {
      await connection.end();
    }
  }
}
