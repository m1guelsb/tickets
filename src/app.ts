import express from "express";
import jwt from "jsonwebtoken";
import { createConnection } from "./database";
import { authRoutes } from "./controllers/auth-controller";
import { partnersRoutes } from "./controllers/partners-controller";
import { customersRoutes } from "./controllers/customers-controller";
import { eventsRoutes } from "./controllers/events-controller";
import { UsersService } from "./services/users-service";

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

  try {
    const payload = jwt.verify(token, "12345") as { id: number; email: string };

    const usersService = new UsersService();
    const user = await usersService.findById(payload.id);

    if (!user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    req.user = user as { id: number; email: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate" });
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
