import express from "express";
import jwt from "jsonwebtoken";
import { Database } from "./database";
import { authRoutes } from "./controllers/auth-controller";
import { partnerRoutes } from "./controllers/partner-controller";
import { customerRoutes } from "./controllers/customer-controller";
import { eventRoutes } from "./controllers/event-controller";
import { UserService } from "./services/user-service";
import { ticketRoutes } from "./controllers/ticket-controller";
import { purchaseRoutes } from "./controllers/purchase-controller";

export const app = express();
app.use(express.json());

const publicRoutes = [
  { method: "POST", path: "/auth/login" },
  { method: "POST", path: "/customers/register" },
  { method: "POST", path: "/partners/register" },
  { method: "GET", path: "/events" },
];

app.use(async (req, res, next) => {
  const isUnprotectedRoute = publicRoutes.some(
    (route) => route.method == req.method && req.path.startsWith(route.path)
  );

  if (isUnprotectedRoute) {
    return next();
  }

  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const payload = jwt.verify(token, "123456") as {
      id: number;
      email: string;
    };
    const userService = new UserService();
    const user = await userService.findById(payload.id);
    if (!user) {
      res.status(401).json({ message: "Failed to authenticate token" });
      return;
    }
    req.user = user as { id: number; email: string };
    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
});

app.use("/auth", authRoutes);
app.use("/partners", partnerRoutes);
app.use("/customers", customerRoutes);
app.use("/events", eventRoutes);
app.use("/events", ticketRoutes);
app.use("/purchases", purchaseRoutes);

app.listen(3001, async () => {
  const connection = Database.getInstance();
  await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
  await connection.execute("TRUNCATE TABLE reservation_tickets");
  await connection.execute("TRUNCATE TABLE purchase_tickets");
  await connection.execute("TRUNCATE TABLE purchases");
  await connection.execute("TRUNCATE TABLE tickets");
  await connection.execute("TRUNCATE TABLE events");
  await connection.execute("TRUNCATE TABLE customers");
  await connection.execute("TRUNCATE TABLE partners");
  await connection.execute("TRUNCATE TABLE users");
  await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Running in http://localhost:3001");
});
