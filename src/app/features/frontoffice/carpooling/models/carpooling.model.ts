export interface CarDTO {
  id: number;
  model: string;
  seats: number;
  availableSeats: number;
  plateNumber: string;
  driverUsername: string;
  driverEmail: string;
}

export interface CarpoolingDTO {
  id: number;
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  departureTime: string;
  carId: number;
  carModel: string;
  plateNumber: string;
  availableSeats: number;
  driverUsername: string;
  driverEmail: string;
  participantUsernames: string[];
  participantEmails: string[];
  participantCount: number;
}

export interface ParticipantDTO {
  userId: number;
  username: string;
  email: string;
  phone: string;
}

export interface CarpoolingWithParticipantsDTO {
  carpoolingId: number;
  departureLocation: string;
  arrivalLocation: string;
  date: string;
  departureTime: string;
  participantCount: number;
  participants: ParticipantDTO[];
}

export interface CarWithCarpoolingsDTO {
  carId: number;
  model: string;
  seats: number;
  availableSeats: number;
  plateNumber: string;
  carpoolings: CarpoolingWithParticipantsDTO[];
}

export interface DriverWithCarsAndCarpoolingsDTO {
  driverId: number;
  driverUsername: string;
  driverEmail: string;
  driverPhone: string;
  cars: CarWithCarpoolingsDTO[];
}
