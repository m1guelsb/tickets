import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as mysql from "mysql2/promise";
import { Router } from "express";
import { createConnection } from "../database";

export const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = rows.length ? rows[0] : null;
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email }, "12345", {
        expiresIn: "1h",
      });
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (e) {
  } finally {
    await connection.end();
  }
});
