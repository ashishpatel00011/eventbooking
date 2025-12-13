import { ObjectId } from 'mongodb';

export interface Event {
  _id?: ObjectId;
  title: string;
  description: string;
  location: string;
  date: Date;
  total_seats: number;
  available_seats: number;
  price: number;
  img: string;
  created_at: Date;
  created_by: ObjectId;
}
