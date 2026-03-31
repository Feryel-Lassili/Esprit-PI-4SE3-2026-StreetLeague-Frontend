import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PredictionService, PredictionDto, PredictionResponse } from './prediction.service';

describe('PredictionService', () => {
  let service: PredictionService;
  let http: HttpTestingController;
  const BASE = 'http://localhost:8089/SpringSecurity/predictions';

  const mockPrediction: PredictionResponse = {
    id: 1, virtualTeamId: 1, weekNumber: 14, weekYear: 2026,
    captainPlayerId: 10, status: 'PENDING', totalPointsEarned: 0,
    createdAt: '2026-03-30', playerPredictions: []
  };

  const mockDto: PredictionDto = {
    virtualTeamId: 1, captainPlayerId: 10,
    players: [{ playerId: 10, playerName: 'John Doe', playerPosition: 'FWD', playerRating: 8 }]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PredictionService]
    });
    service = TestBed.inject(PredictionService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('submit should POST to /submit and return prediction', () => {
    service.submit(mockDto).subscribe(res => {
      expect(res).toEqual(mockPrediction);
      expect(res.status).toBe('PENDING');
    });
    const req = http.expectOne(`${BASE}/submit`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockDto);
    req.flush(mockPrediction);
  });

  it('getCurrent should GET /current/teamId and return prediction', () => {
    service.getCurrent(1).subscribe(res => {
      expect(res).toEqual(mockPrediction);
    });
    const req = http.expectOne(`${BASE}/current/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPrediction);
  });

  it('getHistory should GET /history/teamId and return list', () => {
    const resolved = { ...mockPrediction, status: 'RESOLVED' as const, totalPointsEarned: 5.5 };
    service.getHistory(1).subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0].status).toBe('RESOLVED');
      expect(res[0].totalPointsEarned).toBe(5.5);
    });
    const req = http.expectOne(`${BASE}/history/1`);
    expect(req.request.method).toBe('GET');
    req.flush([resolved]);
  });
});