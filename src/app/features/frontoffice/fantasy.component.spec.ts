import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { FrontofficeFantasyComponent } from './fantasy.component';
import { VirtualTeamService } from '../../core/services/virtual-team.service';
import { By } from '@angular/platform-browser';

// ── Shared mock data ──────────────────────────────────────────────────────────
const mockPlayer = {
  id: 1, firstName: 'John', lastName: 'Doe',
  position: 'FWD', sportType: 'FOOTBALL', level: 'PRO',
  avgRating: 8.5, fantasyPoints: 20,
  goalsScored: 5, assists: 3, matchesPlayed: 10
};

const mockTeamResponse = {
  id: 1, name: 'My Team', sportType: 'FOOTBALL',
  earnedPoints: 0, weekPoints: 0, userId: 1,
  playerIds: [1]
};

const mockPrediction = {
  id: 1, weekNumber: 14, weekYear: 2026,
  status: 'PENDING', totalPointsEarned: 0, captainPlayerId: 1,
  playerPredictions: [{
    playerId: 1, playerName: 'John Doe', playerPosition: 'FWD',
    result: 'PENDING', pointsEarned: 0, isCaptain: true,
    predictGoal: true, goalsScored: 0, yellowCards: 0,
    redCards: 0, basketballPoints: 0, tennisWin: false
  }]
};

// ── Helper: build a minimal VirtualTeamService mock ──────────────────────────
function mockTeamService() {
  return {
    getTeamsByUser: jasmine.createSpy('getTeamsByUser').and.returnValue(of([])),
    createTeam:     jasmine.createSpy('createTeam').and.returnValue(of(mockTeamResponse)),
    updateTeam:     jasmine.createSpy('updateTeam').and.returnValue(of(mockTeamResponse)),
    deleteTeam:     jasmine.createSpy('deleteTeam').and.returnValue(of(void 0)),
  };
}

describe('FrontofficeFantasyComponent', () => {
  let component: FrontofficeFantasyComponent;
  let fixture:   ComponentFixture<FrontofficeFantasyComponent>;
  let http:      HttpTestingController;
  let teamSvc:   ReturnType<typeof mockTeamService>;

  beforeEach(async () => {
    teamSvc = mockTeamService();
    await TestBed.configureTestingModule({
      imports: [FrontofficeFantasyComponent, HttpClientTestingModule, FormsModule],
      providers: [{ provide: VirtualTeamService, useValue: teamSvc }]
    }).compileComponents();

    fixture   = TestBed.createComponent(FrontofficeFantasyComponent);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // Flush the three initial sport player requests
    ['FOOTBALL', 'BASKETBALL', 'TENNIS'].forEach(sport => {
      const req = http.expectOne(`http://localhost:8089/SpringSecurity/player-profiles/sport/${sport}`);
      req.flush([mockPlayer]);
    });
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  // ══════════════════════════════════════════════════════════════════
  // 1. INIT
  // ══════════════════════════════════════════════════════════════════
  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should start in shop viewMode', () => {
      expect(component.viewMode).toBe('shop');
    });

    it('should load players for all three sports on init', () => {
      expect(component['allPlayersMap']['FOOTBALL'].length).toBe(1);
      expect(component['allPlayersMap']['BASKETBALL'].length).toBe(1);
      expect(component['allPlayersMap']['TENNIS'].length).toBe(1);
    });

    it('should call getTeamsByUser on init', () => {
      expect(teamSvc.getTeamsByUser).toHaveBeenCalledWith(1);
    });

    it('userPoints should start at 200', () => {
      expect(component.userPoints).toBe(200);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 2. SHOP
  // ══════════════════════════════════════════════════════════════════
  describe('Shop — buy flow', () => {
    it('openBuyModal should set buyCandidate when user has enough points', () => {
      component.openBuyModal(mockPlayer as any);
      expect(component.buyCandidate).toEqual(mockPlayer as any);
    });

    it('openBuyModal should show toast and NOT set buyCandidate when broke', () => {
      component.userPoints = 5;
      component.openBuyModal(mockPlayer as any);
      expect(component.buyCandidate).toBeNull();
      expect(component.toastMsg).toContain('Not enough');
    });

    it('openBuyModal should NOT set buyCandidate when player is already owned', () => {
      component.ownedPlayers = [mockPlayer as any];
      component.openBuyModal(mockPlayer as any);
      expect(component.buyCandidate).toBeNull();
    });

    it('confirmBuy should deduct points and add player to ownedPlayers', () => {
      component.buyCandidate = mockPlayer as any;
      component.confirmBuy();
      expect(component.userPoints).toBe(180);
      expect(component.ownedPlayers.length).toBe(1);
      expect(component.buyCandidate).toBeNull();
    });

    it('confirmBuy should show success toast', () => {
      component.buyCandidate = mockPlayer as any;
      component.confirmBuy();
      expect(component.toastMsg).toContain('John Doe');
    });

    it('confirmBuy should do nothing when buyCandidate is null', () => {
      component.buyCandidate = null;
      component.confirmBuy();
      expect(component.userPoints).toBe(200);
      expect(component.ownedPlayers.length).toBe(0);
    });

    it('isOwned should return true if player is in ownedPlayers', () => {
      component.ownedPlayers = [mockPlayer as any];
      expect(component.isOwned(mockPlayer as any)).toBeTrue();
    });

    it('isOwned should return false if player is not owned', () => {
      expect(component.isOwned(mockPlayer as any)).toBeFalse();
    });

    it('filteredShopBank should filter by position when shopPosFilter is set', () => {
      component.shopSport = 'FOOTBALL';
      component.shopPosFilter = 'GK';
      expect(component.filteredShopBank.length).toBe(0);
      component.shopPosFilter = 'FWD';
      expect(component.filteredShopBank.length).toBe(1);
    });

    it('setShopSport should reset filter', () => {
      component.shopPosFilter = 'GK';
      component.setShopSport('BASKETBALL');
      expect(component.shopSport).toBe('BASKETBALL');
      expect(component.shopPosFilter).toBe('ALL');
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 3. INVENTORY — sell flow
  // ══════════════════════════════════════════════════════════════════
  describe('Inventory — sell flow', () => {
    beforeEach(() => {
      component.ownedPlayers = [mockPlayer as any];
      component.userPoints   = 180;
    });

    it('openSellModal should set sellCandidate', () => {
      component.openSellModal(mockPlayer as any);
      expect(component.sellCandidate).toEqual(mockPlayer as any);
    });

    it('confirmSell should refund points and remove player', () => {
      component.sellCandidate = mockPlayer as any;
      component.confirmSell();
      expect(component.userPoints).toBe(200);
      expect(component.ownedPlayers.length).toBe(0);
      expect(component.sellCandidate).toBeNull();
    });

    it('confirmSell should show toast with player name', () => {
      component.sellCandidate = mockPlayer as any;
      component.confirmSell();
      expect(component.toastMsg).toContain('John Doe');
    });

    it('confirmSell should do nothing when sellCandidate is null', () => {
      component.sellCandidate = null;
      component.confirmSell();
      expect(component.ownedPlayers.length).toBe(1);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 4. BUILD — sport switching
  // ══════════════════════════════════════════════════════════════════
  describe('Build — sport switching', () => {
    it('setSport should switch selectedSport and reset filters', () => {
      component.setSport('BASKETBALL');
      expect(component.selectedSport).toBe('BASKETBALL');
      expect(component.posFilter).toBe('ALL');
      expect(component.pickingSlot).toBeNull();
      expect(component.captainId).toBeNull();
    });

    it('setSport to FOOTBALL should set 11 slots', () => {
      component.setSport('FOOTBALL');
      expect(component.slots.length).toBe(11);
    });

    it('setSport to BASKETBALL should set 5 slots', () => {
      component.setSport('BASKETBALL');
      expect(component.slots.length).toBe(5);
    });

    it('setSport to TENNIS should set 1 slot', () => {
      component.setSport('TENNIS');
      expect(component.slots.length).toBe(1);
    });

    it('filledSlots should return count of slots with a player', () => {
      component.setSport('FOOTBALL');
      component.slots[0].player = mockPlayer as any;
      expect(component.filledSlots).toBe(1);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 5. BUILD — slot interactions
  // ══════════════════════════════════════════════════════════════════
  describe('Build — slot interactions', () => {
    beforeEach(() => {
      component.setSport('FOOTBALL');
      component.ownedPlayers = [mockPlayer as any];
    });

    it('onSlotClick should set pickingSlot when slot is empty', () => {
      const slot = component.slots[9];
      component.onSlotClick(slot);
      expect(component.pickingSlot).toEqual(slot);
      expect(component.posFilter).toBe('FWD');
    });

    it('onSlotClick should NOT set pickingSlot when slot is filled', () => {
      const slot = component.slots[9];
      slot.player = mockPlayer as any;
      component.onSlotClick(slot);
      expect(component.pickingSlot).toBeNull();
    });

    it('cancelPick should clear pickingSlot and reset posFilter', () => {
      component.pickingSlot = component.slots[0];
      component.posFilter = 'GK';
      component.cancelPick();
      expect(component.pickingSlot).toBeNull();
      expect(component.posFilter).toBe('ALL');
    });

    it('selectPlayer should assign player to pickingSlot when positions match', () => {
      const slot = component.slots[9];
      component.pickingSlot = slot;
      component.selectPlayer(mockPlayer as any);
      expect(slot.player).toEqual(mockPlayer as any);
      expect(component.pickingSlot).toBeNull();
    });

    it('selectPlayer should NOT assign player if position does not match', () => {
      const slot = component.slots[0];
      component.pickingSlot = slot;
      component.selectPlayer(mockPlayer as any);
      expect(slot.player).toBeNull();
    });

    it('removePlayer should clear slot player', () => {
      const slot = component.slots[9];
      slot.player = mockPlayer as any;
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.removePlayer(slot, event);
      expect(slot.player).toBeNull();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('isOnPitch should return true when player is in a slot', () => {
      component.slots[9].player = mockPlayer as any;
      expect(component.isOnPitch(mockPlayer as any)).toBeTrue();
    });

    it('isOnPitch should return false when player is not placed', () => {
      expect(component.isOnPitch(mockPlayer as any)).toBeFalse();
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 6. BUILD — save team
  // ══════════════════════════════════════════════════════════════════
  describe('Build — saveTeam', () => {
    beforeEach(() => {
      component.setSport('FOOTBALL');
      component.teamName = 'My Team';
      component.isUpdateMode = false;
      component.existingTeamId = null;
    });

    it('saveTeam should show error toast when teamName is empty', () => {
      component.teamName = '';
      component.saveTeam();
      expect(component.toastMsg).toContain('team name');
      expect(teamSvc.createTeam).not.toHaveBeenCalled();
    });

    // ── FIX: use flush() to drain ALL pending timers at once ──
    it('saveTeam should call createTeam when not in update mode', fakeAsync(() => {
      component.saveTeam();
      expect(teamSvc.createTeam).toHaveBeenCalled();
      expect(component.saveState).toBe('success');
      flush(); // drains setTimeout(1400) + showToast setTimeout(3500)
      expect(component.viewMode).toBe('view');
    }));

    it('saveTeam should call updateTeam when in update mode', () => {
      component.isUpdateMode   = true;
      component.existingTeamId = 1;
      component.saveTeam();
      expect(teamSvc.updateTeam).toHaveBeenCalledWith(1, jasmine.any(Object));
    });

    it('saveTeam should show error toast on API failure', fakeAsync(() => {
      teamSvc.createTeam.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
      component.saveTeam();
      expect(component.saveState).toBe('error');
      expect(component.toastMsg).toContain('Failed');
      flush(); // drain the error toast timer too
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 7. PREDICTION — state management
  // ══════════════════════════════════════════════════════════════════
  describe('Prediction — state management', () => {
    it('startNewPrediction should clear currentPrediction and reset state', () => {
      component.currentPrediction = mockPrediction as any;
      component.predSport = 'FOOTBALL';
      component.predStatusMap['FOOTBALL'] = 'RESOLVED';
      component.captainId = 1;

      component.startNewPrediction();

      expect(component.currentPrediction).toBeNull();
      expect(component.predStatusMap['FOOTBALL']).toBe('');
      expect(component.captainId).toBeNull();
      expect(component.playerGoalPredictions).toEqual({});
      expect(component.showHistory).toBeFalse();
      expect(component.showTestPanel).toBeFalse();
    });

    it('setPredSport should clear prediction state and load current prediction', () => {
      component.savedTeams['BASKETBALL'] = {
        teamName: 'B Team', spent: 0, remaining: 200,
        players: [], starters: [], bench: [], dbId: 5
      };
      component.setPredSport('BASKETBALL');

      expect(component.predSport).toBe('BASKETBALL');
      expect(component.currentPrediction).toBeNull();
      expect(component.predHistory).toEqual([]);

      const req = http.expectOne('http://localhost:8089/SpringSecurity/predictions/current/5');
      req.flush(mockPrediction);
      expect(component.currentPrediction).toEqual(mockPrediction as any);
      expect(component.predStatusMap['BASKETBALL']).toBe('PENDING');

      const histReq = http.expectOne('http://localhost:8089/SpringSecurity/predictions/history/5');
      histReq.flush([]);
    });

    it('setPredSport should set empty status when no team exists', () => {
      delete component.savedTeams['TENNIS'];
      component.setPredSport('TENNIS');
      expect(component.predSport).toBe('TENNIS');
      expect(component.currentPrediction).toBeNull();
      http.expectNone('http://localhost:8089/SpringSecurity/predictions/current/undefined');
    });

    it('pastPredictions should exclude currentPrediction from history', () => {
      component.currentPrediction = { ...mockPrediction, id: 1 } as any;
      component.predHistory = [
        { ...mockPrediction, id: 1, status: 'RESOLVED' } as any,
        { ...mockPrediction, id: 2, status: 'RESOLVED' } as any,
      ];
      expect(component.pastPredictions.length).toBe(1);
      expect(component.pastPredictions[0].id).toBe(2);
    });

    it('pastPredictions should only include RESOLVED predictions', () => {
      component.currentPrediction = null;
      component.predHistory = [
        { ...mockPrediction, id: 1, status: 'PENDING'  } as any,
        { ...mockPrediction, id: 2, status: 'RESOLVED' } as any,
      ];
      expect(component.pastPredictions.length).toBe(1);
      expect(component.pastPredictions[0].status).toBe('RESOLVED');
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 8. PREDICTION — submitPrediction
  // ══════════════════════════════════════════════════════════════════
  describe('Prediction — submitPrediction', () => {
    beforeEach(() => {
      component.predSport = 'FOOTBALL';
      component.captainId = 1;
      component.savedTeams['FOOTBALL'] = {
        teamName: 'My Team', spent: 20, remaining: 180,
        players: [mockPlayer as any],
        starters: [{ ...mockPlayer, label: 'ST' } as any],
        bench: [], dbId: 1
      };
    });

    it('should POST to /submit and set currentPrediction on success', fakeAsync(() => {
      component.submitPrediction();

      const req = http.expectOne('http://localhost:8089/SpringSecurity/predictions/submit');
      expect(req.request.method).toBe('POST');
      req.flush(mockPrediction);

      expect(component.currentPrediction).toEqual(mockPrediction as any);
      expect(component.predStatusMap['FOOTBALL']).toBe('PENDING');
      expect(component.toastMsg).toContain('submitted');
      flush(); // drain toast timer
    }));

    it('should show error toast when submit fails', fakeAsync(() => {
      component.submitPrediction();

      const req = http.expectOne('http://localhost:8089/SpringSecurity/predictions/submit');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(component.currentPrediction).toBeNull();
      expect(component.toastMsg).toContain('Could not submit');
      flush(); // drain toast timer
    }));

    it('should NOT submit when captainId is null', () => {
      component.captainId = null;
      component.submitPrediction();
      http.expectNone('http://localhost:8089/SpringSecurity/predictions/submit');
      expect(true).toBeTrue(); // explicit expectation to avoid warning
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 9. DELETE TEAM
  // ══════════════════════════════════════════════════════════════════
  describe('Delete team', () => {
    it('confirmDelete should call deleteTeam and remove from savedTeams', fakeAsync(() => {
      component.viewSport = 'FOOTBALL';
      component.savedTeams['FOOTBALL'] = {
        teamName: 'My Team', spent: 0, remaining: 200,
        players: [], starters: [], bench: [], dbId: 1
      };
      component.showConfirm = true;
      component.confirmDelete();
      expect(teamSvc.deleteTeam).toHaveBeenCalledWith(1);
      expect(component.savedTeams['FOOTBALL']).toBeUndefined();
      expect(component.showConfirm).toBeFalse();
      flush();
    }));

    it('confirmDelete should show error toast on failure', fakeAsync(() => {
      teamSvc.deleteTeam.and.returnValue(throwError(() => new Error('fail')));
      component.viewSport = 'FOOTBALL';
      component.savedTeams['FOOTBALL'] = {
        teamName: 'My Team', spent: 0, remaining: 200,
        players: [], starters: [], bench: [], dbId: 1
      };
      component.confirmDelete();
      expect(component.toastMsg).toContain('Could not delete');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 10. TEMPLATE — basic rendering
  // ══════════════════════════════════════════════════════════════════
  describe('Template — rendering', () => {
    it('should render the nav brand', () => {
      const brand = fixture.debugElement.query(By.css('.nav-brand'));
      expect(brand.nativeElement.textContent).toContain('Fantasy');
    });

    it('should show shop view by default', () => {
      const header = fixture.debugElement.query(By.css('.shop-header h1'));
      expect(header.nativeElement.textContent).toContain('Player Market');
    });

    it('should switch to inventory when nav button clicked', () => {
      const btns = fixture.debugElement.queryAll(By.css('.nav-btn'));
      btns[1].nativeElement.click();
      fixture.detectChanges();
      expect(component.viewMode).toBe('inventory');
    });

    it('should show empty inventory message when no players owned', () => {
      component.viewMode = 'inventory';
      component.ownedPlayers = [];
      fixture.detectChanges();
      const empty = fixture.debugElement.query(By.css('.inv-empty'));
      expect(empty).toBeTruthy();
    });

    it('should show buy confirm modal when buyCandidate is set', () => {
      component.buyCandidate = mockPlayer as any;
      fixture.detectChanges();
      const modal = fixture.debugElement.query(By.css('.buy-confirm-overlay'));
      expect(modal).toBeTruthy();
    });

    it('should hide buy confirm modal when buyCandidate is null', () => {
      component.buyCandidate = null;
      fixture.detectChanges();
      const modal = fixture.debugElement.query(By.css('.buy-confirm-overlay'));
      expect(modal).toBeFalsy();
    });

    it('should show sell confirm modal when sellCandidate is set', () => {
      component.sellCandidate = mockPlayer as any;
      fixture.detectChanges();
      const modal = fixture.debugElement.query(By.css('.sell-confirm-overlay'));
      expect(modal).toBeTruthy();
    });

    it('should show toast when toastMsg is set', () => {
      component.toastMsg  = 'Test message';
      component.toastType = 'success';
      fixture.detectChanges();
      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast).toBeTruthy();
      expect(toast.nativeElement.textContent).toContain('Test message');
    });

    it('should show points balance in nav', () => {
      component.userPoints = 150;
      fixture.detectChanges();
      const pts = fixture.debugElement.query(By.css('.nav-pts-val'));
      expect(pts.nativeElement.textContent).toContain('150');
    });

    it('should switch to build view when Build Team nav button clicked', () => {
      const btns = fixture.debugElement.queryAll(By.css('.nav-btn'));
      btns[2].nativeElement.click();
      fixture.detectChanges();
      expect(component.viewMode).toBe('build');
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 11. COMPUTED GETTERS
  // ══════════════════════════════════════════════════════════════════
  describe('Computed getters', () => {
    it('hasAnySavedTeam should return false when savedTeams is empty', () => {
      component.savedTeams = {};
      expect(component.hasAnySavedTeam).toBeFalse();
    });

    it('hasAnySavedTeam should return true when a team exists', () => {
      component.savedTeams['FOOTBALL'] = {
        teamName: 'X', spent: 0, remaining: 200,
        players: [], starters: [], bench: [], dbId: 1
      };
      expect(component.hasAnySavedTeam).toBeTrue();
    });

    it('ownedBySport should filter players by sport', () => {
      component.ownedPlayers = [
        { ...mockPlayer, sportType: 'FOOTBALL' } as any,
        { ...mockPlayer, id: 2, sportType: 'BASKETBALL' } as any,
      ];
      expect(component.ownedBySport('FOOTBALL').length).toBe(1);
      expect(component.ownedBySport('BASKETBALL').length).toBe(1);
      expect(component.ownedBySport('TENNIS').length).toBe(0);
    });

    it('avatarForPosition should return correct emoji', () => {
      expect(component.avatarForPosition('GK')).toBe('🧤');
      expect(component.avatarForPosition('FWD')).toBe('⚽');
      expect(component.avatarForPosition('PG')).toBe('🏀');
      expect(component.avatarForPosition('P1')).toBe('🎾');
      expect(component.avatarForPosition('UNKNOWN')).toBe('👤');
    });

    it('pitchPlayerCount should count all filled slots and bench', () => {
      component.setSport('FOOTBALL');
      component.slots[0].player      = mockPlayer as any;
      component.benchSlots[0].player = mockPlayer as any;
      expect(component.pitchPlayerCount).toBe(2);
    });
  });
});