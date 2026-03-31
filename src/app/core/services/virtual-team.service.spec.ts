import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VirtualTeamService, VirtualTeamDto, VirtualTeamResponse } from './virtual-team.service';

describe('VirtualTeamService', () => {
  let service: VirtualTeamService;
  let http: HttpTestingController;
  const BASE = 'http://localhost:8089/SpringSecurity/virtual-teams';

  const mockTeam: VirtualTeamResponse = {
    id: 1, name: 'Team Alpha', sportType: 'FOOTBALL',
    earnedPoints: 0, weekPoints: 0, userId: 1, playerIds: [10, 11]
  };

  const mockDto: VirtualTeamDto = {
    sportType: 'FOOTBALL', name: 'Team Alpha',
    userId: 1, playerIds: [10, 11], earnedPoints: 0, weekPoints: 0
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VirtualTeamService]
    });
    service = TestBed.inject(VirtualTeamService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createTeam should POST to BASE and return team', () => {
    service.createTeam(mockDto).subscribe(res => {
      expect(res).toEqual(mockTeam);
    });
    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockDto);
    req.flush(mockTeam);
  });

  it('updateTeam should PUT to BASE/id and return updated team', () => {
    const updated = { ...mockTeam, name: 'Updated' };
    service.updateTeam(1, mockDto).subscribe(res => {
      expect(res.name).toBe('Updated');
    });
    const req = http.expectOne(`${BASE}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });

  it('deleteTeam should DELETE to BASE/id', () => {
    service.deleteTeam(1).subscribe(res => {
      expect(res).toBeNull();
    });
    const req = http.expectOne(`${BASE}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getTeam should GET BASE/id and return team', () => {
    service.getTeam(1).subscribe(res => {
      expect(res).toEqual(mockTeam);
    });
    const req = http.expectOne(`${BASE}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeam);
  });

  it('getAllTeams should GET BASE and return list', () => {
    service.getAllTeams().subscribe(res => {
      expect(res.length).toBe(1);
      expect(res[0]).toEqual(mockTeam);
    });
    const req = http.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush([mockTeam]);
  });

  it('getTeamsByUser should GET BASE/user/id and return list', () => {
    service.getTeamsByUser(1).subscribe(res => {
      expect(res).toEqual([mockTeam]);
    });
    const req = http.expectOne(`${BASE}/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTeam]);
  });
});