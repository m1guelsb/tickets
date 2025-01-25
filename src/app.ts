import express from "express";
import * as mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import { createConnection } from "./database";
import { authRoutes } from "./controllers/auth-controller";
import { partnersRoutes } from "./controllers/partners-controller";
import { customersRoutes } from "./controllers/customers-controller";
import { eventsRoutes } from "./controllers/events-controller";

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

app.use("/auth", authRoutes);
app.use("/partners", partnersRoutes);
app.use("/customers", customersRoutes);
app.use("/events", eventsRoutes);

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
