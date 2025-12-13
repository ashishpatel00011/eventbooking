import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { Event } from '../models/Event.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get all events (with optional filters)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const eventsCollection = db.collection<Event>('events');

    const { upcoming } = req.query;
    const query: any = {};

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await eventsCollection
      .find(query)
      .sort({ date: 1 })
      .toArray();

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const eventsCollection = db.collection<Event>('events');

    const event = await eventsCollection.findOne({ _id: new ObjectId(req.params.id) });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Get events created by user
router.get('/user/my-events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const eventsCollection = db.collection<Event>('events');

    const events = await eventsCollection
      .find({ created_by: new ObjectId(req.user!.id) })
      .sort({ date: 1 })
      .toArray();

    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create event
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, total_seats, price, img } = req.body;

    if (!title || !description || !location || !date || !total_seats || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const eventsCollection = db.collection<Event>('events');

    const newEvent: Event = {
      title,
      description,
      location,
      date: new Date(date),
      total_seats,
      available_seats: total_seats,
      price,
      img: img || '',
      created_at: new Date(),
      created_by: new ObjectId(req.user!.id)
    };

    const result = await eventsCollection.insertOne(newEvent);

    res.status(201).json({ ...newEvent, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, total_seats, price, img } = req.body;

    const db = getDB();
    const eventsCollection = db.collection<Event>('events');

    // Check if event belongs to user
    const event = await eventsCollection.findOne({
      _id: new ObjectId(req.params.id),
      created_by: new ObjectId(req.user!.id)
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    // Calculate new available seats
    const bookedSeats = event.total_seats - event.available_seats;
    const available_seats = total_seats - bookedSeats;

    const updateData: any = {
      title,
      description,
      location,
      date: new Date(date),
      total_seats,
      available_seats,
      price,
      img
    };

    await eventsCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const eventsCollection = db.collection<Event>('events');

    const result = await eventsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
      created_by: new ObjectId(req.user!.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;
