import bcrypt from "bcrypt";
import * as mysql from "mysql2/promise";
import { createConnection } from "../database";

export class CustomersService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
  }) {
    const { name, email, password, address, phone } = data;

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
        "INSERT INTO customers (user_id, address, phone, created_at) VALUES (?, ?, ?, ?)",
        [userId, address, phone, createdAt]
      );

      return {
        id: partnerResult.insertId,
        user_id: userId,
        name,
        address,
        phone,
        created_at: createdAt,
      };
    } finally {
      await connection.end();
    }
  }
}
