import { VenueDTO } from '../../../frontoffice/venue/models/venue.model';

export interface VenueOwnerWithVenuesDTO {
  ownerId: number;
  ownerEmail: string;
  ownerUsername: string;
  ownerPhone: string;
  companyName: string;
  verified: boolean;
  venues: VenueDTO[];
}
