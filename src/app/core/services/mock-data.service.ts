import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  getStats() {
    return [
      { label: 'Matches Played', value: '48' },
      { label: 'Teams Joined', value: '5' },
      { label: 'Win Rate', value: '67%' },
      { label: 'Points', value: '2,845' }
    ];
  }

  getEvents() {
    return [
      {
        id: 1,
        type: 'tournament',
        sport: 'Football',
        name: 'Tunis Street League Championship 2026',
        date: '2026-03-15',
        time: '09:00',
        location: 'Central Sports Complex, Tunis'
      }
    ];
  }

  getVenues() {
    return [
      {
        id: 1,
        name: 'Arena Sports Complex',
        location: 'Tunis Center',
        rating: 4.8
      }
    ];
  }

  getTeams() {
    return [
      { id: 1, name: 'Street Ballers', sport: 'Football', members: 12 }
    ];
  }

  getPosts() {
    return [
      { id: 1, author: 'Alex Johnson', content: 'Just won our championship match! 🏆', likes: 45 }
    ];
  }

  getFantasy() {
    return { id: 1, name: 'My Dream Team', totalPoints: 1850, rank: 125 };
  }

  getSponsors() {
    return [
      { id: 1, company: 'SportTech Inc.', type: 'Equipment Sponsor', amount: '$500-1000' }
    ];
  }

  getWallet() {
    return { balance: 450, currency: 'TND' };
  }

  getRides() {
    return [
      { id: 1, driver: 'Ahmed Ben Ali', from: 'Ariana', to: 'Arena Sports Complex', price: 5 }
    ];
  }

  getProducts() {
    return [
      { id: 1, name: 'Pro Football Jersey - Blue', price: 89 }
    ];
  }

  getProfile() {
    return { id: 1, name: 'Alex Johnson', location: 'Tunis, Tunisia', points: 2845 };
  }

  getBooking() {
    return { id: 'BK123456789', venue: 'Arena Sports Complex', date: '2026-02-15', total: 87.6 };
  }
}
