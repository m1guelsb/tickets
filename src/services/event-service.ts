import { EventModel } from "../models/event-model";

export class EventService {
  async create(data: {
    name: string;
    description: string | null;
    date: Date;
    location: string;
    partnerId: number;
  }) {
    const { name, description, date, location, partnerId } = data;
    const event = await EventModel.create({
      name,
      description,
      date,
      location,
      partner_id: partnerId,
    });
    return {
      id: event.id,
      name,
      description,
      date,
      location,
      created_at: event.created_at,
      partner_id: partnerId,
    };
  }

  async findAll(partnerId?: number) {
    return EventModel.findAll({
      where: { partner_id: partnerId },
    });
  }

  async findById(eventId: number) {
    return EventModel.findById(eventId);
  }
}
