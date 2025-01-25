import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as mysql from "mysql2/promise";
import { createConnection } from "../database";

export class AuthService {
  async login(email: string, password: string) {
    const connection = await createConnection();
    try {
      const [rows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      const user = rows.length ? rows[0] : null;
      if (user && bcrypt.compareSync(password, user.password)) {
        return jwt.sign({ id: user.id, email: user.email }, "12345", {
          expiresIn: "1h",
        });
      } else {
        throw new InvalidCredentialsError();
      }
    } finally {
      await connection.end();
    }
  }
}

export class InvalidCredentialsError extends Error {}
