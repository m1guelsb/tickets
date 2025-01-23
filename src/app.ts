import express from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function createConnection() {
  return mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tickets",
    port: 33060,
  });
}

const app = express();
app.use(express.json());

const publicRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isPublicRoute = publicRoutes.some(
    (route) => route.method == req.method && req.path.startsWith(route.path)
  );

  if (isPublicRoute) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const connection = await createConnection();
  try {
    const payload = jwt.verify(token, "12345") as { id: number; email: string };

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      "SELECT * FROM users WHERE id = ?",
      [payload.id]
    );
    const user = rows.length ? rows[0] : null;
    if (!user) {
      res.status(401).json({ message: "Token is invalid" });
      return;
    }
    req.user = user as { id: number; email: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is invalid" });
  } finally {
    await connection.end();
  }
});

app.get("/", (req, res) => {
  res.json({ message: "rola" });
});

app.post("/auth/login", async (req, res) => {
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

app.post("/partners/register", async (req, res) => {
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

app.post("/customers/register", async (req, res) => {
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

app.post("/partners/events", async (req, res) => {
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

app.get("/partners/events", async (req, res) => {
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

app.get("/partners/events/:eventId", async (req, res) => {
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
    }

    res.json(event);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await connection.end();
  }
});

app.get("/events", (req, res) => {});

app.get("/events/:eventId", (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  res.send();
});

app.listen(3001, async () => {
  const connection = await createConnection();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Running at 3001");
});
