import { ActivityType } from './activityConfig';
import { AssignedTrainer } from './index'; // Import AssignedTrainer from index.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  role: string[];
  dogs?: string[]; // Array of dog IDs owned by the user
  createdAt?: string; // Assuming ISO date string
}


export interface DogShareLink {
  _id: string;
  dogId: string;
  ownerId: string;
  token: string;
  activities: ActivityType[];
  expiresAt: string; // Assuming ISO date string
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password?: string;
}
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string; // Added firstName (optional for backend)
  lastName?: string;  // Added lastName (optional for backend)
  role?: string[];
}