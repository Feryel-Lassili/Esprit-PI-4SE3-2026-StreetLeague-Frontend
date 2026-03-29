export enum Role {
  ADMIN = 'ADMIN',
  PLAYER = 'PLAYER',
  COACH = 'COACH',
  REFEREE = 'REFEREE',
  HEALTH_PROFESSIONAL = 'HEALTH_PROFESSIONAL',
  SPONSOR = 'SPONSOR',
  VENUE_OWNER = 'VENUE_OWNER'
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  // Player specific
  dateOfBirth?: string;
  // Health Professional, Referee, Coach
  certificate?: string;
  licenseNumber?: string;
  specialty?: string;
  experienceYears?: number;
  // Sponsor
  companyName?: string;
  logo?: string;
  contactEmail?: string;
  budget?: number;
  // Venue Owner
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  id: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  phone?: string;
  address?: string;
  enabled: boolean;
  createdAt: string;
}
