import bcrypt from "bcrypt";
import * as mysql from "mysql2/promise";
import { Router } from "express";
import { createConnection } from "../database";

export const customersRoutes = Router();

customersRoutes.post("/register", async (req, res) => {
  const { name, email, password, address, phone } = req.body;

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

    res.status(201).json({
      id: partnerResult.insertId,
      user_id: userId,
      name,
      address,
      phone,
      created_at: createdAt,
    });
  } catch (e) {
    res.status(500).json({ error: e });
  } finally {
    await connection.end();
  }
});
