import bcrypt from "bcrypt";
import * as mysql from "mysql2/promise";
import { Router } from "express";
import { createConnection } from "../database";

export const partnersRoutes = Router();

partnersRoutes.post("/register", async (req, res) => {
  const { name, email, password, company } = req.body;

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

    res.status(201).json({
      id: partnerResult.insertId,
      user_id: userId,
      name,
      company,
      created_at: createdAt,
    });
  } catch (e) {
    res.status(500).json({ error: e });
  } finally {
    await connection.end();
  }
});

partnersRoutes.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;
  const userId = req.user!.id;

  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = rows.length ? rows[0] : null;
    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const eventDate = new Date(date);
    const createdAt = new Date();
    const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
      "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, eventDate, location, createdAt, partner.id]
    );

    res.status(201).json({
      id: eventResult.insertId,
      name,
      description,
      eventDate,
      created_at: createdAt,
      partner_id: partner.id,
    });
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await connection.end();
  }
});

partnersRoutes.get("/events", async (req, res) => {
  const userId = req.user!.id;

  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = rows.length ? rows[0] : null;
    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ?",
      [partner.id]
    );

    res.json(eventRows);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await connection.end();
  }
});

partnersRoutes.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user!.id;

  const connection = await createConnection();
  try {
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM partners WHERE user_id = ?",
      [userId]
    );

    const partner = rows.length ? rows[0] : null;
    if (!partner) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM events WHERE partner_id = ? and id = ?",
      [partner.id, eventId]
    );
    const event = eventRows.length ? eventRows[0] : null;

    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    res.json(event);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await connection.end();
  }
});
