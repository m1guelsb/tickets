import * as mysql from "mysql2/promise";
import { createConnection } from "../database";

export class EventsService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
  }) {
    const { name, description, date, location, partnerId } = data;

    const connection = await createConnection();
    try {
      const eventDate = new Date(date);
      const createdAt = new Date();
      const [eventResult] = await connection.execute<mysql.ResultSetHeader>(
        "INSERT INTO events (name, description, date, location, created_at, partner_id) VALUES (?, ?, ?, ?, ?, ?)",
        [name, description, eventDate, location, createdAt, partnerId]
      );

      return {
        id: eventResult.insertId,
        name,
        description,
        eventDate,
        created_at: createdAt,
        partner_id: partnerId,
      };
    } finally {
      await connection.end();
    }
  }

  async findAll(partnerId?: number) {
    const connection = await createConnection();
    try {
      const query = partnerId
        ? "SELECT * FROM events WHERE partner_id = ?"
        : "SELECT * FROM events";
      const params = partnerId ? [partnerId] : [];
      const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
        query,
        params
      );

      return eventRows;
    } finally {
      await connection.end();
    }
  }

  async findById(eventId: number) {
    const connection = await createConnection();
    try {
      const [eventRows] = await connection.execute<mysql.RowDataPacket[]>(
        "SELECT * FROM events WHERE and id = ?",
        [eventId]
      );

      return eventRows.length ? eventRows[0] : null;
    } finally {
      await connection.end();
    }
  }
}
