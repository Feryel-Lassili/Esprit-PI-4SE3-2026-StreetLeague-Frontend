export interface VenueDTO {
  id: number;
  name: string;
  address: string;
  pricePerHour: number;
  capacity: number;
  sportType: string;
  photoUrl?: string;
  available?: boolean;
  verified?: boolean;
  ownerName?: string;
}

export interface ReservationDTO {
  id: number;
  venueId: number;
  venueName: string;
  venueAddress: string;
  userId: number;
  userName: string;
  date: string;
  duration: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'BLOCKED';
}
