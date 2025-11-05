export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  color?: string;
  role: string[];
  dogs: string[];
  trainedDogs: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Dog {
  _id: string;
  name: string;
  breed?: string;
  birthDate?: Date;
  profilePhoto?: string;
  presentationPhoto?: string;
  legend?: string;
  presentation?: string;
  ownerIds: string[];
  trainerIds: string[];
  createdAt: Date;
}

export interface LoginCredentials {
  email?: string;
  password?: string;
}

export interface RegisterData {
  email: string;
  password?: string;
  username: string;
  firstName: string;
  lastName: string;
}
