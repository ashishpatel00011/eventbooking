import { Router, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/db.js';
import { Booking } from '../models/Booking.js';
import { Event } from '../models/Event.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create booking
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { event_id, name, email, mobile, quantity } = req.body;

    if (!event_id || !name || !email || !mobile || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDB();
    const eventsCollection = db.collection<Event>('events');
    const bookingsCollection = db.collection<Booking>('bookings');

    // Get event
    const event = await eventsCollection.findOne({ _id: new ObjectId(event_id) });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (quantity > event.available_seats) {
      return res.status(400).json({ error: 'Not enough seats available' });
    }

    const total_amount = event.price * quantity;

    // Create booking
    const newBooking: Booking = {
      event_id: new ObjectId(event_id),
      user_id: req.user ? new ObjectId(req.user.id) : undefined,
      name,
      email,
      mobile,
      quantity,
      total_amount,
      booking_date: new Date(),
      status: 'confirmed'
    };

    const result = await bookingsCollection.insertOne(newBooking);

    // Update event available seats
    await eventsCollection.updateOne(
      { _id: new ObjectId(event_id) },
      { $inc: { available_seats: -quantity } }
    );

    res.status(201).json({ ...newBooking, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get bookings for an event
router.get('/event/:eventId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const db = getDB();
    const bookingsCollection = db.collection<Booking>('bookings');
    const eventsCollection = db.collection<Event>('events');

    // Verify event belongs to user
    const event = await eventsCollection.findOne({
      _id: new ObjectId(req.params.eventId),
      created_by: new ObjectId(req.user!.id)
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or unauthorized' });
    }

    const bookings = await bookingsCollection
      .find({ event_id: new ObjectId(req.params.eventId) })
      .sort({ booking_date: -1 })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
