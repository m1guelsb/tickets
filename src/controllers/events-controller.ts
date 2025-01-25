import { Router } from "express";
import { EventsService } from "../services/events-service";

export const eventsRoutes = Router();

eventsRoutes.get("/", async (req, res) => {
  const eventsService = new EventsService();
  const events = await eventsService.findAll();
  res.json(events);
});

eventsRoutes.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  const eventsService = new EventsService();
  const event = await eventsService.findById(Number(eventId));
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
});
