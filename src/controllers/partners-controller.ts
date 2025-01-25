import { Router } from "express";
import { PartnersService } from "../services/partners-service";
import { EventsService } from "../services/events-service";

export const partnersRoutes = Router();

partnersRoutes.post("/register", async (req, res) => {
  const { name, email, password, company } = req.body;

  const partnersService = new PartnersService();
  const result = partnersService.register({ name, email, password, company });

  res.status(201).json(result);
});

partnersRoutes.post("/events", async (req, res) => {
  const { name, description, date, location } = req.body;
  const userId = req.user!.id;

  const partnersService = new PartnersService();
  const partner = await partnersService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventsService = new EventsService();
  const result = await eventsService.create({
    name,
    description,
    date,
    location,
    partnerId: partner.id,
  });

  res.status(201).json(result);
});

partnersRoutes.get("/events", async (req, res) => {
  const userId = req.user!.id;

  const partnersService = new PartnersService();
  const partner = await partnersService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventsService = new EventsService();
  const events = await eventsService.findAll(partner.id);
  res.json(events);
});

partnersRoutes.get("/events/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user!.id;

  const partnersService = new PartnersService();
  const partner = await partnersService.findByUserId(userId);

  if (!partner) {
    res.status(403).json({ message: "Not authorized" });
    return;
  }

  const eventsService = new EventsService();
  const event = await eventsService.findById(Number(eventId));

  if (!event || event.partner_id !== partner.id) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  res.json(event);
});
