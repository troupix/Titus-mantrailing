export interface User {
  // Existing User properties
  // ...
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  color?: string;
  role: string[];
  dogs?: string[];
  trainedDogs?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignedTrainer {
  trainerId: string | User; // trainerId can be a string (ObjectId) or a populated User object
  activities: ActivityType[];
}

export interface Dog {
  _id: string;
  name: string;
  breed?: string;
  birthDate?: string; // Assuming ISO date string
  profilePhoto?: string;
  presentationPhoto?: string;
  legend?: string;
  presentation?: string;
  ownerIds: string[] | User[]; // Can be string[] or User[] when populated
  trainers?: AssignedTrainer[]; // Use imported AssignedTrainer
  createdAt?: string; // Assuming ISO date string
  activityStats?: {
    [key in ActivityType]?: number;
  };
  lastTrailDate?: string; // Assuming ISO date string
}

export interface LoginCredentials {
  email?: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  username: string;
  firstName: string; // Added firstName
  lastName: string;  // Added lastName
}

// Import ActivityType if it's defined elsewhere, or define it here
import { ActivityType } from './activityConfig';