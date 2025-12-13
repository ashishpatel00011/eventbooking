import { ObjectId } from 'mongodb';

export interface Booking {
  _id?: ObjectId;
  event_id: ObjectId;
  user_id?: ObjectId;
  name: string;
  email: string;
  mobile: string;
  quantity: number;
  total_amount: number;
  booking_date: Date;
  status: 'confirmed' | 'cancelled';
}
