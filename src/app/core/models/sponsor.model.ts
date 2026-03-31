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

export interface SponsorProfile {
  id: number;
  user: User;
  companyName: string;
  logo: string;
  contactEmail: string;
  budget: number;
}

export interface CoachProfile {
  id: number;
  user: User;
  certificate: string;
  experienceYears: number;
  specialty: string;
  verified: boolean;
}

export interface PlayerProfile {
  id: number;
  user: User;
  dateOfBirth: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
}

export interface RefereeProfile {
  id: number;
  user: User;
  certificate: string;
  experienceYears: number;
  licenseNumber: string;
  verified: boolean;
}

export interface HealthProfessionalProfile {
  id: number;
  user: User;
  certificate: string;
  specialty: string;
  licenseNumber: string;
  verified: boolean;
}

export interface VenueOwnerProfile {
  id: number;
  user: User;
  companyName: string;
  phone: string;
  verified: boolean;
}

export interface AdminProfile {
  id: number;
  user: User;
  roleLevel: number;
}

// Legacy interface for backward compatibility
export interface Sponsor {
  id?: number;
  companyName: string;
  logo: string;
  contactEmail: string;
  budget: number;
  fullName?: string;
  email?: string;
  role?: string;
}

export enum SponsorshipStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED'
}

export interface Sponsorship {
  id: number;
  sponsorProfile?: SponsorProfile | null;
  amount: number;
  startDate: string;
  endDate: string;
  paymentProof?: string | null;
  status: SponsorshipStatus;
  description?: string | null;
  expectedBenefits?: string | null;
  targetType?: TargetType | null;
  targetName?: string | null;
  sponsorLogo?: string | null;
  companyName?: string | null;
  team?: any;
  event?: any;
  venue?: any;
}

export type TargetType = 'TEAM' | 'EVENT' | 'VENUE' | 'TOURNAMENT';

export interface AvailableTarget {
  id: number;
  name: string;
  type: TargetType;
}

export interface SponsorshipSubmitRequest {
  amount: number;
  startDate: string;
  endDate: string;
  description?: string;
  expectedBenefits?: string[];
  team?: { id: number };
  event?: { id: number };
  venue?: { id: number };
  tournament?: { id: number };
}

export interface SponsorshipStats {
  totalActive: number;
  totalAmountThisMonth: number;
  totalPending: number;
}
