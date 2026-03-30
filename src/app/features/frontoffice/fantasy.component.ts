import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { VirtualTeamService, SportType } from '../../core/services/virtual-team.service';

// ─── Models ────────────────────────────────────────────────────────────────────
interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  sportType: string;
  level: string;
  avgRating: number;
  fantasyPoints: number;
  goalsScored: number;
  assists: number;
  matchesPlayed: number;
}

interface Slot {
  id: number; position: string; label: string;
  x: number;  y: number;       player: Player | null;
  isBench?: boolean;
}

interface PredictionResult {
  id: number; weekNumber: number; weekYear: number;
  status: string; totalPointsEarned: number; captainPlayerId: number;
  playerPredictions: {
    playerId: number; playerName: string; playerPosition: string;
    result: string; pointsEarned: number; isCaptain: boolean;
    predictGoal: boolean;
    goalsScored?: number; yellowCards?: number; redCards?: number;
    basketballPoints?: number; tennisWin?: boolean;
  }[];
}

type Sport    = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS';
type ViewMode = 'shop' | 'inventory' | 'build' | 'view' | 'prediction';

// ─── Slot factories ─────────────────────────────────────────────────────────────
function footballSlots(): Slot[] {
  return [
    { id:1,  position:'GK',  label:'GK', x:50, y:88, player:null },
    { id:2,  position:'DEF', label:'RB', x:18, y:68, player:null },
    { id:3,  position:'DEF', label:'CB', x:38, y:68, player:null },
    { id:4,  position:'DEF', label:'CB', x:62, y:68, player:null },
    { id:5,  position:'DEF', label:'LB', x:82, y:68, player:null },
    { id:6,  position:'MID', label:'CM', x:25, y:48, player:null },
    { id:7,  position:'MID', label:'CM', x:50, y:45, player:null },
    { id:8,  position:'MID', label:'CM', x:75, y:48, player:null },
    { id:9,  position:'FWD', label:'RW', x:20, y:22, player:null },
    { id:10, position:'FWD', label:'ST', x:50, y:18, player:null },
    { id:11, position:'FWD', label:'LW', x:80, y:22, player:null },
  ];
}
function footballBench(): Slot[] {
  return [
    { id:101, position:'GK',  label:'SUB GK',  x:0, y:0, player:null, isBench:true },
    { id:102, position:'DEF', label:'SUB DEF', x:0, y:0, player:null, isBench:true },
    { id:103, position:'MID', label:'SUB MID', x:0, y:0, player:null, isBench:true },
    { id:104, position:'FWD', label:'SUB FWD', x:0, y:0, player:null, isBench:true },
  ];
}
function basketballSlots(): Slot[] {
  return [
    { id:1, position:'PG', label:'PG', x:50, y:80, player:null },
    { id:2, position:'SG', label:'SG', x:20, y:60, player:null },
    { id:3, position:'SF', label:'SF', x:80, y:60, player:null },
    { id:4, position:'PF', label:'PF', x:28, y:30, player:null },
    { id:5, position:'C',  label:'C',  x:72, y:30, player:null },
  ];
}
function basketballBench(): Slot[] {
  return [
    { id:101, position:'PG', label:'SUB PG', x:0, y:0, player:null, isBench:true },
    { id:102, position:'SG', label:'SUB SG', x:0, y:0, player:null, isBench:true },
    { id:103, position:'SF', label:'SUB SF', x:0, y:0, player:null, isBench:true },
  ];
}
function tennisSlots(): Slot[] {
  return [{ id:1, position:'P1', label:'Player', x:50, y:75, player:null }];
}

// ─── Component ──────────────────────────────────────────────────────────────────
@Component({
  selector: 'fo-fantasy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { padding: 24px; max-width: 1300px; margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; min-height: 100vh; }

    /* ── Top nav ── */
    .top-nav { display: flex; align-items: center; gap: 8px; margin-bottom: 24px;
               background: white; border: 1px solid #e0e0e5; border-radius: 16px;
               padding: 10px 14px; flex-wrap: wrap; }
    .nav-brand { font-size: 18px; font-weight: 900; color: #1d1d1f; margin-right: 8px; letter-spacing:-.02em; }
    .nav-sep   { width: 1px; height: 24px; background: #e0e0e5; margin: 0 4px; }
    .nav-btn   { padding: 7px 16px; border-radius: 10px; border: 1.5px solid transparent;
                 font-size: 13px; font-weight: 600; color: #6e6e73; cursor: pointer;
                 background: transparent; transition: all .15s; display: flex; align-items: center; gap: 5px; }
    .nav-btn:hover  { background: #f5f5f7; color: #1d1d1f; }
    .nav-btn.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }
    .nav-badge { background: #ff3b30; color: white; font-size: 9px; font-weight: 800;
                 padding: 1px 5px; border-radius: 20px; min-width: 16px; text-align: center; }
    .nav-badge.green { background: #34c759; }
    .nav-pts   { margin-left: auto; display: flex; align-items: center; gap: 6px;
                 background: linear-gradient(135deg,#1d1d1f,#3a3a3c); color: white;
                 padding: 7px 14px; border-radius: 10px; }
    .nav-pts-icon { font-size: 14px; }
    .nav-pts-val  { font-size: 15px; font-weight: 800; }
    .nav-pts-lbl  { font-size: 10px; color: rgba(255,255,255,.6); font-weight: 600; }

    /* ── Shop ── */
    .shop-header { margin-bottom: 20px; }
    .shop-header h1 { font-size: 28px; font-weight: 900; color: #1d1d1f; letter-spacing:-.02em; }
    .shop-header p  { font-size: 14px; color: #6e6e73; margin-top: 4px; }

    .shop-sport-tabs { display: flex; gap: 8px; margin-bottom: 18px; }
    .shop-sport-tab  { padding: 9px 20px; border-radius: 12px; border: 1.5px solid #e0e0e5;
                       background: white; cursor: pointer; font-size: 13px; font-weight: 600;
                       color: #6e6e73; transition: all .15s; }
    .shop-sport-tab.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }

    .shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }

    .shop-card { background: white; border: 1.5px solid #e0e0e5; border-radius: 16px;
                 padding: 16px; display: flex; flex-direction: column; gap: 10px;
                 transition: all .2s; position: relative; overflow: hidden; }
    .shop-card:hover     { border-color: #c0c0c5; box-shadow: 0 4px 20px rgba(0,0,0,.08); transform: translateY(-2px); }
    .shop-card.purchased { opacity: .5; }
    .shop-card-top  { display: flex; align-items: center; gap: 10px; }
    .shop-avatar    { font-size: 32px; width: 48px; height: 48px; display: flex; align-items: center;
                      justify-content: center; background: #f5f5f7; border-radius: 12px; }
    .shop-info      { flex: 1; min-width: 0; }
    .shop-name      { font-size: 14px; font-weight: 700; color: #1d1d1f; white-space: nowrap;
                      overflow: hidden; text-overflow: ellipsis; }
    .shop-meta      { font-size: 11px; color: #6e6e73; margin-top: 2px; }
    .shop-badges    { display: flex; gap: 5px; flex-wrap: wrap; }
    .badge          { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
    .badge-pos      { background: #e8f0fe; color: #1a73e8; }
    .badge-level    { background: #fef3c7; color: #92400e; }
    .badge-rating   { background: #f0fdf4; color: #15803d; }
    .shop-footer    { display: flex; align-items: center; justify-content: space-between; }
    .shop-price     { font-size: 18px; font-weight: 900; color: #1d1d1f; }
    .shop-price span { font-size: 11px; font-weight: 600; color: #6e6e73; }
    .buy-btn        { border: none; padding: 8px 18px; border-radius: 10px; font-size: 13px;
                      font-weight: 700; cursor: pointer; transition: all .15s; }
    .buy-btn.can    { background: #1d1d1f; color: white; }
    .buy-btn.can:hover { background: #0a0a0a; transform: scale(1.02); }
    .buy-btn.owned  { background: #f5f5f7; color: #aeaeb2; cursor: default; }
    .buy-btn.broke  { background: #fff2f2; color: #ff3b30; cursor: not-allowed; }
    .shop-stars     { display: flex; gap: 1px; }

    .shop-filters  { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
    .filter-label  { font-size: 11px; font-weight: 700; color: #aeaeb2; text-transform: uppercase; }
    .filter-btn    { padding: 5px 12px; border-radius: 20px; border: 1px solid #e0e0e5;
                     font-size: 11px; font-weight: 600; background: white; color: #6e6e73; cursor: pointer; }
    .filter-btn.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }

    .shop-loading { text-align: center; padding: 60px; color: #aeaeb2; font-size: 14px; }

    /* ── Inventory ── */
    .inv-header { margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .inv-header h1 { font-size: 28px; font-weight: 900; color: #1d1d1f; letter-spacing:-.02em; flex: 1; }
    .inv-total-badge { background: linear-gradient(135deg,#1d1d1f,#3a3a3c); color: white;
                       padding: 6px 14px; border-radius: 10px; font-size: 13px; font-weight: 700; }

    .inv-sport-section { margin-bottom: 28px; }
    .inv-sport-title   { font-size: 12px; font-weight: 800; color: #aeaeb2; text-transform: uppercase;
                         letter-spacing: .08em; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
    .inv-sport-count   { background: #f5f5f7; color: #6e6e73; padding: 2px 8px;
                         border-radius: 20px; font-size: 10px; font-weight: 700; }
    .inv-grid          { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }

    .inv-card          { background: white; border: 1.5px solid #e0e0e5; border-radius: 14px;
                         padding: 14px 12px; display: flex; flex-direction: column; gap: 6px;
                         transition: all .15s; position: relative; }
    .inv-card:hover    { border-color: #c0c0c5; }
    .inv-avatar        { font-size: 28px; text-align: center; }
    .inv-name          { font-size: 12px; font-weight: 700; color: #1d1d1f; text-align: center;
                         white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .inv-pos-badge     { text-align: center; }
    .inv-pts-val       { font-size: 11px; font-weight: 700; color: #007aff; text-align: center; }
    .inv-sell-btn      { border: 1px solid #ff3b30; background: white; color: #ff3b30;
                         border-radius: 8px; padding: 4px 10px; font-size: 10px; font-weight: 700;
                         cursor: pointer; width: 100%; margin-top: 4px; transition: all .15s; }
    .inv-sell-btn:hover { background: #ff3b30; color: white; }

    .inv-empty { text-align: center; padding: 60px 24px; }
    .inv-empty-icon { font-size: 48px; margin-bottom: 12px; }
    .inv-empty p    { font-size: 14px; color: #aeaeb2; margin-bottom: 16px; }
    .inv-shop-btn   { background: #1d1d1f; color: white; border: none; padding: 11px 24px;
                      border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }

    /* ── Build ── */
    .header      { margin-bottom: 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .header h1   { font-size: 26px; font-weight: 800; color: #1d1d1f; }
    .team-name-input { flex: 1; min-width: 200px; max-width: 320px;
                       border: 1.5px solid #e0e0e5; border-radius: 10px;
                       padding: 8px 14px; font-size: 14px; font-weight: 600;
                       color: #1d1d1f; outline: none; background: white; }
    .team-name-input:focus { border-color: #1d1d1f; }

    .sport-tabs { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
    .sport-tab  { padding: 8px 18px; border-radius: 12px; border: 1.5px solid #e0e0e5;
                  background: white; cursor: pointer; font-size: 13px; font-weight: 600;
                  color: #6e6e73; transition: all .15s; }
    .sport-tab.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }

    .budget-bar  { background: white; border: 1px solid #e0e0e5; border-radius: 14px;
                   padding: 12px 20px; display: flex; align-items: center; gap: 16px;
                   margin-bottom: 20px; flex-wrap: wrap; }
    .budget-item { display: flex; flex-direction: column; }
    .budget-label { font-size: 10px; font-weight: 600; color: #aeaeb2; text-transform: uppercase; letter-spacing:.04em; }
    .budget-value { font-size: 18px; font-weight: 800; color: #1d1d1f; }
    .budget-value.warn { color: #ff3b30; }
    .budget-sep  { width: 1px; height: 32px; background: #e0e0e5; }
    .btn-group   { margin-left: auto; display: flex; gap: 8px; align-items: center; }

    .save-btn { border: none; padding: 10px 20px; border-radius: 10px;
                font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
    .save-btn.idle    { background: #1d1d1f; color: white; }
    .save-btn.loading { background: #6e6e73; color: white; cursor: wait; }
    .save-btn.success { background: #34c759; color: white; }
    .save-btn.error   { background: #ff3b30; color: white; }
    .save-btn:disabled { opacity: .4; cursor: default; }

    .main-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
    .left-col  { display: flex; flex-direction: column; gap: 16px; }

    .pitch-wrap  { background: white; border: 1px solid #e0e0e5; border-radius: 20px; padding: 16px; }
    .pitch-title { font-size: 14px; font-weight: 700; color: #1d1d1f; margin-bottom: 12px; }
    .pitch-hint  { font-size: 11px; font-weight: 400; color: #aeaeb2; margin-left: 6px; }
    .pitch { position: relative; width: 100%; border-radius: 12px; overflow: hidden; }
    .football-pitch   { padding-bottom: 130%; }
    .basketball-pitch { padding-bottom: 78%; }
    .tennis-pitch     { padding-bottom: 80%; }
    .pitch-lines { position: absolute; inset: 0; }

    .slot { position: absolute; transform: translate(-50%, -50%);
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            cursor: pointer; z-index: 10; }
    .slot-circle { width: 50px; height: 50px; border-radius: 50%;
                   border: 2.5px dashed rgba(255,255,255,.6); background: rgba(0,0,0,.25);
                   display: flex; align-items: center; justify-content: center;
                   transition: all .2s; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.8); }
    .slot.drag-over .slot-circle { border-color: #34c759; background: rgba(52,199,89,.3); border-style: solid; transform: scale(1.12); }
    .slot.filled .slot-circle    { border-style: solid; border-color: #fff; background: rgba(0,0,0,.5); }
    .slot-name   { font-size: 10px; font-weight: 700; color: white; text-shadow: 0 1px 4px rgba(0,0,0,.8);
                   white-space: nowrap; max-width: 68px; overflow: hidden; text-overflow: ellipsis; text-align: center; }
    .slot-pos    { font-size: 9px; color: rgba(255,255,255,.75); text-shadow: 0 1px 3px rgba(0,0,0,.8); }
    .slot-captain { position: absolute; top: -6px; left: -4px; font-size: 12px; }
    .slot-remove  { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px;
                    border-radius: 50%; background: #ff3b30; border: none; color: white;
                    font-size: 9px; cursor: pointer; display: flex; align-items: center;
                    justify-content: center; font-weight: 800; z-index: 20; }

    .bench-wrap  { background: white; border: 1px solid #e0e0e5; border-radius: 16px; padding: 14px 16px; }
    .bench-title { font-size: 13px; font-weight: 700; color: #6e6e73; margin-bottom: 10px; }
    .bench-slots { display: flex; gap: 8px; flex-wrap: wrap; }
    .bench-slot  { width: 72px; display: flex; flex-direction: column; align-items: center; gap: 4px;
                   padding: 8px 4px; border-radius: 10px; border: 1.5px dashed #e0e0e5;
                   cursor: pointer; transition: all .2s; position: relative; }
    .bench-slot.drag-over { border-color: #34c759; background: rgba(52,199,89,.08); }
    .bench-slot.filled    { border-style: solid; border-color: #d0d0d5; background: #f5f5f7; }
    .bench-avatar { font-size: 22px; line-height: 1; }
    .bench-label  { font-size: 9px; font-weight: 700; color: #aeaeb2; text-align: center; }
    .bench-name   { font-size: 9px; font-weight: 700; color: #1d1d1f; text-align: center;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 64px; }
    .bench-remove { position: absolute; top: -4px; right: -4px; width: 15px; height: 15px;
                    border-radius: 50%; background: #ff3b30; border: none; color: white;
                    font-size: 8px; cursor: pointer; display: flex; align-items: center;
                    justify-content: center; font-weight: 800; }

    /* ── Player bank (build mode) ── */
    .bank        { background: white; border: 1px solid #e0e0e5; border-radius: 20px; padding: 16px; display: flex; flex-direction: column; }
    .bank-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .bank-title  { font-size: 14px; font-weight: 700; color: #1d1d1f; }
    .bank-count  { font-size: 11px; color: #aeaeb2; background: #f5f5f7; padding: 2px 8px; border-radius: 20px; }
    .pos-filter  { display: flex; gap: 5px; margin-bottom: 10px; flex-wrap: wrap; }
    .pos-btn     { padding: 4px 10px; border-radius: 20px; border: 1px solid #e0e0e5;
                   font-size: 11px; font-weight: 600; background: white; color: #6e6e73; cursor: pointer; }
    .pos-btn.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }
    .drag-hint   { font-size: 11px; color: #aeaeb2; margin-bottom: 8px; text-align: center; }
    .bank-list   { display: flex; flex-direction: column; gap: 6px; max-height: 480px; overflow-y: auto; }
    .bank-list::-webkit-scrollbar { width: 3px; }
    .bank-list::-webkit-scrollbar-thumb { background: #e0e0e5; border-radius: 3px; }

    .player-card  { display: flex; align-items: center; gap: 8px; padding: 8px 10px;
                    border-radius: 10px; border: 1.5px solid #e0e0e5; background: #fafafa;
                    cursor: grab; transition: all .15s; user-select: none; }
    .player-card:active { cursor: grabbing; opacity: .7; }
    .player-card:hover  { border-color: #1d1d1f; background: white; }
    .player-card.on-pitch { opacity: .35; cursor: not-allowed; }
    .player-card.picking  { border-color: #007aff; background: #f0f6ff; }
    .player-emoji  { font-size: 20px; min-width: 28px; text-align: center; }
    .player-info   { flex: 1; min-width: 0; }
    .player-name   { font-size: 12px; font-weight: 700; color: #1d1d1f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-meta   { font-size: 10px; color: #6e6e73; }
    .player-right  { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .player-rating { font-size: 12px; font-weight: 800; color: #1d1d1f; }
    .player-pts    { font-size: 10px; font-weight: 700; color: #007aff; }
    .pos-badge     { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px; background: #e8f0fe; color: #1a73e8; }

    .picking-hint { background: #007aff; color: white; border-radius: 8px; padding: 8px 12px;
                    font-size: 12px; font-weight: 600; margin-bottom: 10px;
                    display: flex; justify-content: space-between; align-items: center; }
    .cancel-btn   { background: rgba(255,255,255,.25); border: none; color: white;
                    border-radius: 5px; padding: 3px 8px; cursor: pointer; font-size: 11px; }

    .no-owned-hint { background: #fff8e1; border: 1px solid #ffd54f; border-radius: 8px;
                     padding: 10px 12px; font-size: 12px; color: #795548; margin-bottom: 10px;
                     display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .go-shop-btn   { border: none; background: #1d1d1f; color: white; border-radius: 7px;
                     padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; }

    .error-banner { background: #fff2f2; border: 1px solid #ffb3b3; border-radius: 8px;
                    padding: 8px 12px; font-size: 12px; color: #c62828; margin-bottom: 14px; }

    /* ── View ── */
    .view-panel     { background: white; border: 1px solid #e0e0e5; border-radius: 20px; padding: 24px; }
    .view-sport-nav { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .view-sport-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e0e0e5;
                      background: white; font-size: 13px; font-weight: 600; color: #6e6e73; cursor: pointer; }
    .view-sport-btn.active   { background: #1d1d1f; color: white; border-color: #1d1d1f; }
    .view-sport-btn.has-team { border-color: #34c759; }
    .view-header    { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .view-header h2 { font-size: 22px; font-weight: 800; color: #1d1d1f; flex: 1; }
    .edit-btn { border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .del-btn  { border: 1.5px solid #ff3b30; background: white; color: #ff3b30; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
    .stat-card  { background: #f5f5f7; border-radius: 10px; padding: 10px 14px; }
    .stat-lbl   { font-size: 9px; font-weight: 700; color: #aeaeb2; text-transform: uppercase; }
    .stat-val   { font-size: 18px; font-weight: 800; color: #1d1d1f; }
    .section-title { font-size: 11px; font-weight: 700; color: #aeaeb2; text-transform: uppercase;
                     letter-spacing:.06em; margin: 14px 0 8px; }
    .player-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f5; }
    .player-row:last-child { border-bottom: none; }
    .pr-av   { font-size: 20px; width: 32px; text-align: center; }
    .pr-inf  { flex: 1; }
    .pr-name { font-size: 13px; font-weight: 700; color: #1d1d1f; }
    .pr-meta { font-size: 11px; color: #6e6e73; }
    .pr-pts  { font-size: 13px; font-weight: 800; color: #007aff; }
    .bench-row { opacity: .55; }
    .empty-sport  { text-align: center; padding: 48px 24px; }
    .big-icon     { font-size: 48px; margin-bottom: 12px; }
    .empty-p      { font-size: 14px; color: #aeaeb2; margin-bottom: 16px; }
    .build-btn    { background: #1d1d1f; color: white; border: none; padding: 11px 22px;
                    border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }

    /* ── Prediction redesign ── */
    .pred-page       { display: flex; flex-direction: column; gap: 16px; }
    .pred-topbar     { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
    .pred-title      { font-size: 22px; font-weight: 900; color: #1d1d1f; }
    .pred-sport-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
    .pred-sport-tab  { padding: 7px 16px; border-radius: 20px; border: 1.5px solid #e0e0e5;
                       background: white; font-size: 12px; font-weight: 700; color: #6e6e73;
                       cursor: pointer; transition: all .15s; }
    .pred-sport-tab.active   { background: #1d1d1f; color: white; border-color: #1d1d1f; }
    .pred-sport-tab:disabled { opacity: .35; cursor: not-allowed; }
    .no-team-warn    { background: #fff8e1; border: 1px solid #ffd54f; border-radius: 12px;
                       padding: 12px 16px; font-size: 13px; color: #795548; }

    /* Setup cards */
    .pred-card       { background: white; border-radius: 16px; border: 1px solid #e0e0e5; padding: 18px 20px; }
    .pred-step-label { font-size: 11px; font-weight: 800; letter-spacing: .07em; color: #aeaeb2;
                       text-transform: uppercase; margin-bottom: 12px; }
    .captain-chips   { display: flex; gap: 8px; flex-wrap: wrap; }
    .captain-chip    { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 20px;
                       border: 1.5px solid #e0e0e5; background: white; font-size: 12px; font-weight: 700;
                       color: #1d1d1f; cursor: pointer; transition: all .15s; }
    .captain-chip.sel { background: #ffd60a; border-color: #ffd60a; }

    .ppc-row         { display: flex; align-items: center; gap: 10px; padding: 10px 0;
                       border-bottom: 1px solid #f0f0f5; }
    .ppc-row:last-child { border-bottom: none; }
    .ppc-avatar      { font-size: 22px; width: 34px; text-align: center; }
    .ppc-name        { font-size: 13px; font-weight: 700; color: #1d1d1f; }
    .ppc-pos         { font-size: 11px; color: #aeaeb2; }
    .ppc-info        { flex: 1; }
    .ppc-toggle      { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e0e0e5;
                       background: white; font-size: 11px; font-weight: 700; color: #6e6e73;
                       cursor: pointer; transition: all .15s; white-space: nowrap; }
    .ppc-toggle.on   { background: #34c759; border-color: #34c759; color: white; }
    .ppc-pts         { font-size: 12px; font-weight: 800; color: #007aff; min-width: 40px; text-align: right; }

    .pred-submit-btn { width: 100%; background: #007aff; color: white; border: none; padding: 14px;
                       border-radius: 12px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all .2s; }
    .pred-submit-btn:disabled { opacity: .35; cursor: default; }
    .pred-submit-btn.loading  { background: #6e6e73; }
    .pred-submit-btn.success  { background: #34c759; }
    .pred-locked-info { text-align: center; font-size: 12px; color: #aeaeb2; margin-top: 6px; }

    /* Results screen */
    .result-banner   { border-radius: 20px; padding: 32px 24px; text-align: center; }
    .result-banner.win  { background: linear-gradient(135deg,#d4edda,#b8f0c8); }
    .result-banner.loss { background: linear-gradient(135deg,#f8d7da,#fce4e6); }
    .result-banner.draw { background: linear-gradient(135deg,#fff3cd,#fff8e1); }
    .result-emoji    { font-size: 52px; display: block; margin-bottom: 10px; }
    .result-msg      { font-size: 22px; font-weight: 900; color: #1d1d1f; }
    .result-sub      { font-size: 12px; color: #6e6e73; margin-top: 6px; }
    .result-pts      { font-size: 42px; font-weight: 900; margin-top: 12px; line-height: 1; }
    .result-pts.pos  { color: #34c759; }
    .result-pts.neg  { color: #ff3b30; }
    .result-pts.zero { color: #aeaeb2; }

    .result-grid     { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px,1fr)); gap: 12px; }
    .rpc             { border-radius: 16px; padding: 16px 14px; border: 2px solid #e0e0e5;
                       background: white; text-align: center; position: relative; }
    .rpc.CORRECT     { border-color: #34c759; background: #f0fff4; }
    .rpc.WRONG       { border-color: #ff3b30; background: #fff5f5; }
    .rpc.PARTIAL     { border-color: #ffd60a; background: #fffbf0; }
    .rpc-verdict     { position: absolute; top: 8px; right: 10px; font-size: 18px; }
    .rpc-avatar      { font-size: 30px; margin-bottom: 6px; }
    .rpc-name        { font-size: 13px; font-weight: 800; color: #1d1d1f; margin-bottom: 6px; }
    .rpc-tags        { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; margin-bottom: 10px; }
    .rpc-tag         { font-size: 10px; background: #f0f0f5; padding: 3px 8px; border-radius: 20px;
                       color: #6e6e73; font-weight: 700; }
    .rpc-tag.yellow  { background: #fff3cd; color: #856404; }
    .rpc-tag.red     { background: #f8d7da; color: #721c24; }
    .rpc-pts         { font-size: 20px; font-weight: 900; }
    .rpc-pts.pos     { color: #34c759; }
    .rpc-pts.neg     { color: #ff3b30; }

    /* ── Admin test panel ── */
    .test-panel        { background: #fff8e1; border: 1.5px dashed #ffd54f; border-radius: 14px; padding: 16px; }
    .test-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .test-panel-title  { font-size: 12px; font-weight: 800; color: #795548; }
    .test-player-row   { display: flex; align-items: center; gap: 8px; padding: 8px 0;
                         border-bottom: 1px solid #ffe082; flex-wrap: wrap; }
    .test-player-row:last-child { border-bottom: none; }
    .test-player-name  { flex: 1; min-width: 110px; font-size: 12px; font-weight: 700; color: #1d1d1f; }
    .stat-input        { width: 50px; padding: 4px 6px; border: 1.5px solid #e0e0e5; border-radius: 8px;
                         font-size: 12px; font-weight: 700; text-align: center; background: white; }
    .stat-label        { font-size: 10px; color: #6e6e73; font-weight: 600; }
    .stat-group        { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .win-toggle        { padding: 4px 10px; border-radius: 8px; border: 1.5px solid #e0e0e5;
                         background: white; font-size: 11px; font-weight: 700; cursor: pointer; }
    .win-toggle.yes    { background: #34c759; border-color: #34c759; color: white; }
    .resolve-btn       { background: #ff9500; color: white; border: none; padding: 10px 20px;
                         border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;
                         margin-top: 12px; width: 100%; transition: all .15s; }
    .resolve-btn:disabled { opacity: .4; cursor: default; }

    /* ── Confirm / Toast ── */
    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4);
                       display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .confirm-box     { background: white; border-radius: 16px; padding: 28px 32px; max-width: 360px; width: 90%; text-align: center; }
    .confirm-box h3  { font-size: 18px; font-weight: 800; color: #1d1d1f; margin-bottom: 8px; }
    .confirm-box p   { font-size: 14px; color: #6e6e73; margin-bottom: 24px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-cancel  { border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .confirm-delete  { border: none; background: #ff3b30; color: white; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }

    .buy-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5);
                           display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .buy-confirm-box     { background: white; border-radius: 20px; padding: 28px; max-width: 340px; width: 90%; }
    .buy-confirm-box h3  { font-size: 20px; font-weight: 800; color: #1d1d1f; margin-bottom: 6px; }
    .buy-confirm-price   { font-size: 32px; font-weight: 900; color: #1d1d1f; margin: 16px 0 4px; }
    .buy-confirm-price span { font-size: 14px; font-weight: 600; color: #6e6e73; }
    .buy-confirm-after   { font-size: 13px; color: #6e6e73; margin-bottom: 20px; }
    .buy-confirm-after strong { color: #1d1d1f; }
    .buy-actions  { display: flex; gap: 10px; }
    .buy-cancel   { flex: 1; border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f; padding: 11px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .buy-confirm  { flex: 2; border: none; background: #1d1d1f; color: white; padding: 11px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }

    .sell-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5);
                            display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .sell-confirm-box     { background: white; border-radius: 20px; padding: 28px; max-width: 320px; width: 90%; text-align: center; }
    .sell-confirm-box h3  { font-size: 18px; font-weight: 800; color: #1d1d1f; margin-bottom: 8px; }
    .sell-confirm-box p   { font-size: 13px; color: #6e6e73; margin-bottom: 20px; }
    .sell-actions   { display: flex; gap: 10px; justify-content: center; }
    .sell-cancel    { border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f; padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .sell-confirm   { border: none; background: #ff3b30; color: white; padding: 9px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }

    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
             padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600;
             z-index: 999; box-shadow: 0 6px 24px rgba(0,0,0,.2); white-space: nowrap; }
    .toast.success { background: #1d1d1f; color: white; }
    .toast.error   { background: #ff3b30; color: white; }

    .loading-bank { text-align: center; padding: 30px; color: #aeaeb2; font-size: 13px; }
    .empty        { text-align: center; padding: 30px 16px; color: #aeaeb2; font-size: 13px; }
  `],
  template: `
<div class="page">

  <!-- ── Buy confirm modal ── -->
  <div class="buy-confirm-overlay" *ngIf="buyCandidate">
    <div class="buy-confirm-box">
      <h3>{{ buyCandidate!.firstName }} {{ buyCandidate!.lastName }}</h3>
      <div style="font-size:13px;color:#6e6e73;margin-bottom:4px">{{ buyCandidate!.position }} · {{ buyCandidate!.level }}</div>
      <div class="buy-confirm-price">{{ buyCandidate!.fantasyPoints }} <span>pts</span></div>
      <div class="buy-confirm-after">
        After purchase: <strong>{{ userPoints - buyCandidate!.fantasyPoints }} pts</strong> remaining
      </div>
      <div class="buy-actions">
        <button class="buy-cancel"  (click)="buyCandidate=null">Cancel</button>
        <button class="buy-confirm" (click)="confirmBuy()">🛒 Buy Player</button>
      </div>
    </div>
  </div>

  <!-- ── Sell confirm modal ── -->
  <div class="sell-confirm-overlay" *ngIf="sellCandidate">
    <div class="sell-confirm-box">
      <h3>Sell {{ sellCandidate!.firstName }} {{ sellCandidate!.lastName }}?</h3>
      <p>You'll get back <strong>{{ sellCandidate!.fantasyPoints }} pts</strong>. This player will be removed from your inventory and any teams.</p>
      <div class="sell-actions">
        <button class="sell-cancel"  (click)="sellCandidate=null">Keep</button>
        <button class="sell-confirm" (click)="confirmSell()">Sell</button>
      </div>
    </div>
  </div>

  <!-- ── Delete team confirm ── -->
  <div class="confirm-overlay" *ngIf="showConfirm">
    <div class="confirm-box">
      <h3>Delete team?</h3>
      <p>Your <strong>{{ viewSport }}</strong> team will be permanently deleted.</p>
      <div class="confirm-actions">
        <button class="confirm-cancel" (click)="showConfirm=false">Cancel</button>
        <button class="confirm-delete" (click)="confirmDelete()">🗑 Delete</button>
      </div>
    </div>
  </div>

  <!-- ── Top navigation ── -->
  <div class="top-nav">
    <span class="nav-brand">⚡ Fantasy</span>
    <div class="nav-sep"></div>
    <button class="nav-btn" [class.active]="viewMode==='shop'"      (click)="viewMode='shop'">
      🛒 Shop
    </button>
    <button class="nav-btn" [class.active]="viewMode==='inventory'" (click)="viewMode='inventory'">
      🎒 My Players
      <span class="nav-badge green" *ngIf="ownedPlayers.length>0">{{ ownedPlayers.length }}</span>
    </button>
    <button class="nav-btn" [class.active]="viewMode==='build'"     (click)="viewMode='build'">
      🔨 Build Team
    </button>
    <button class="nav-btn" [class.active]="viewMode==='view'"      (click)="viewMode='view'">
      👁 My Teams
      <span class="nav-badge green" *ngIf="hasAnySavedTeam"></span>
    </button>
    <button class="nav-btn" [class.active]="viewMode==='prediction'" (click)="viewMode='prediction'">
      🎯 Prediction
      <span class="nav-badge" *ngIf="currentPrediction">1</span>
    </button>
    <div class="nav-pts">
      <span class="nav-pts-icon">💰</span>
      <div>
        <div class="nav-pts-val">{{ userPoints }}</div>
        <div class="nav-pts-lbl">pts left</div>
      </div>
    </div>
  </div>

  <!-- ════════════════ SHOP ════════════════ -->
  <ng-container *ngIf="viewMode==='shop'">
    <div class="shop-header">
      <h1>Player Market 🛒</h1>
      <p>Buy players with your points. You have <strong>{{ userPoints }} pts</strong> remaining.</p>
    </div>

    <div class="shop-sport-tabs">
      <button class="shop-sport-tab" [class.active]="shopSport==='FOOTBALL'"   (click)="setShopSport('FOOTBALL')">⚽ Football</button>
      <button class="shop-sport-tab" [class.active]="shopSport==='BASKETBALL'" (click)="setShopSport('BASKETBALL')">🏀 Basketball</button>
      <button class="shop-sport-tab" [class.active]="shopSport==='TENNIS'"     (click)="setShopSport('TENNIS')">🎾 Tennis</button>
    </div>

    <div class="shop-filters">
      <span class="filter-label">Position</span>
      <button class="filter-btn" [class.active]="shopPosFilter==='ALL'" (click)="shopPosFilter='ALL'">All</button>
      <button *ngFor="let pos of sportPositions[shopSport]" class="filter-btn"
              [class.active]="shopPosFilter===pos" (click)="shopPosFilter=pos">{{ pos }}</button>
    </div>

    <div *ngIf="shopBankLoading" class="shop-loading">⏳ Loading players…</div>
    <div class="shop-grid" *ngIf="!shopBankLoading">
      <div *ngFor="let p of filteredShopBank" class="shop-card" [class.purchased]="isOwned(p)">
        <div class="shop-card-top">
          <div class="shop-avatar">{{ avatarFor(p) }}</div>
          <div class="shop-info">
            <div class="shop-name">{{ p.firstName }} {{ p.lastName }}</div>
            <div class="shop-meta">⭐ {{ p.avgRating }} · {{ p.matchesPlayed }} matches</div>
          </div>
        </div>
        <div class="shop-badges">
          <span class="badge badge-pos">{{ p.position }}</span>
          <span class="badge badge-level">{{ p.level }}</span>
          <span class="badge badge-rating">{{ p.goalsScored }}⚽ {{ p.assists }}🅰️</span>
        </div>
        <div class="shop-footer">
          <div class="shop-price">{{ p.fantasyPoints }} <span>pts</span></div>
          <button class="buy-btn"
                  [class.owned]="isOwned(p)"
                  [class.can]="!isOwned(p) && userPoints >= p.fantasyPoints"
                  [class.broke]="!isOwned(p) && userPoints < p.fantasyPoints"
                  [disabled]="isOwned(p)"
                  (click)="openBuyModal(p)">
            {{ isOwned(p) ? '✓ Owned' : userPoints < p.fantasyPoints ? "💸 Can't afford" : '+ Buy' }}
          </button>
        </div>
      </div>
      <div *ngIf="filteredShopBank.length===0" style="grid-column:1/-1;text-align:center;padding:40px;color:#aeaeb2">
        No players found
      </div>
    </div>
  </ng-container>

  <!-- ════════════════ INVENTORY ════════════════ -->
  <ng-container *ngIf="viewMode==='inventory'">
    <div class="inv-header">
      <h1>My Players 🎒</h1>
      <div class="inv-total-badge">{{ ownedPlayers.length }} players</div>
    </div>

    <ng-container *ngIf="ownedPlayers.length===0">
      <div class="inv-empty">
        <div class="inv-empty-icon">🎒</div>
        <p>You haven't bought any players yet.<br>Head to the shop to get started!</p>
        <button class="inv-shop-btn" (click)="viewMode='shop'">🛒 Go to Shop</button>
      </div>
    </ng-container>

    <ng-container *ngIf="ownedPlayers.length>0">
      <div *ngFor="let s of allSports" class="inv-sport-section">
        <ng-container *ngIf="ownedBySport(s.key).length>0">
          <div class="inv-sport-title">
            {{ s.label }}
            <span class="inv-sport-count">{{ ownedBySport(s.key).length }}</span>
          </div>
          <div class="inv-grid">
            <div *ngFor="let p of ownedBySport(s.key)" class="inv-card">
              <div class="inv-avatar">{{ avatarFor(p) }}</div>
              <div class="inv-name">{{ p.firstName }} {{ p.lastName }}</div>
              <div class="inv-pos-badge"><span class="badge badge-pos">{{ p.position }}</span></div>
              <div class="inv-pts-val">{{ p.fantasyPoints }} pts</div>
              <button class="inv-sell-btn" (click)="openSellModal(p)">Sell back</button>
            </div>
          </div>
        </ng-container>
      </div>
    </ng-container>
  </ng-container>

  <!-- ════════════════ BUILD ════════════════ -->
  <ng-container *ngIf="viewMode==='build'">
    <div class="header">
      <h1>Build Team 🔨</h1>
      <input class="team-name-input" [(ngModel)]="teamName" placeholder="Name your team…" maxlength="40"/>
    </div>

    <div class="sport-tabs">
      <button class="sport-tab" [class.active]="selectedSport==='FOOTBALL'"   (click)="setSport('FOOTBALL')">⚽ Football</button>
      <button class="sport-tab" [class.active]="selectedSport==='BASKETBALL'" (click)="setSport('BASKETBALL')">🏀 Basketball</button>
      <button class="sport-tab" [class.active]="selectedSport==='TENNIS'"     (click)="setSport('TENNIS')">🎾 Tennis</button>
    </div>

    <div class="budget-bar">
      <div class="budget-item"><span class="budget-label">Starters</span><span class="budget-value">{{ filledSlots }}/{{ slots.length }}</span></div>
      <div class="budget-sep"></div>
      <div class="budget-item"><span class="budget-label">My Players</span><span class="budget-value">{{ ownedBySport(selectedSport).length }}</span></div>
      <div class="budget-sep"></div>
      <div class="budget-item"><span class="budget-label">On Pitch</span><span class="budget-value">{{ pitchPlayerCount }}</span></div>
      <div class="btn-group">
        <button class="save-btn" [class.idle]="saveState==='idle'" [class.loading]="saveState==='loading'"
                [class.success]="saveState==='success'" [class.error]="saveState==='error'"
                [disabled]="filledSlots<slots.length || saveState==='loading'"
                (click)="saveTeam()">
          <span *ngIf="saveState==='idle'">{{ isUpdateMode ? '✏️ Update' : '✓ Save Team' }}</span>
          <span *ngIf="saveState==='loading'">Saving…</span>
          <span *ngIf="saveState==='success'">Saved ✅</span>
          <span *ngIf="saveState==='error'">Retry ↻</span>
        </button>
      </div>
    </div>

    <div *ngIf="apiError" class="error-banner">⚠️ {{ apiError }}</div>

    <div class="main-grid">
      <div class="left-col">
        <!-- Pitch -->
        <div class="pitch-wrap">
          <div class="pitch-title">
            {{ selectedSport==='FOOTBALL' ? '⚽ 4-3-3' : selectedSport==='BASKETBALL' ? '🏀 Starting Five' : '🎾 Singles' }}
            <span class="pitch-hint">drag from bank · or click slot → click player</span>
          </div>

          <div *ngIf="selectedSport==='FOOTBALL'" class="pitch football-pitch"
               (dragover)="$event.preventDefault()" (drop)="onPitchDrop($event)">
            <svg class="pitch-lines" viewBox="0 0 100 130" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="130" fill="#2d8a4e"/>
              <rect x="0" y="0"   width="100" height="13" fill="#2a8049" opacity=".5"/>
              <rect x="0" y="26"  width="100" height="13" fill="#2a8049" opacity=".5"/>
              <rect x="0" y="52"  width="100" height="13" fill="#2a8049" opacity=".5"/>
              <rect x="0" y="78"  width="100" height="13" fill="#2a8049" opacity=".5"/>
              <rect x="0" y="104" width="100" height="13" fill="#2a8049" opacity=".5"/>
              <rect x="3" y="3" width="94" height="124" rx="1" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".8"/>
              <line x1="3" y1="65" x2="97" y2="65" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <circle cx="50" cy="65" r="12" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <rect x="22" y="3"   width="56" height="20" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <rect x="35" y="3"   width="30" height="10" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <rect x="22" y="107" width="56" height="20" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <rect x="35" y="117" width="30" height="10" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
            </svg>
            <ng-container *ngTemplateOutlet="slotsTpl"></ng-container>
          </div>

          <div *ngIf="selectedSport==='BASKETBALL'" class="pitch basketball-pitch"
               (dragover)="$event.preventDefault()" (drop)="onPitchDrop($event)">
            <svg class="pitch-lines" viewBox="0 0 100 78" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="78" fill="#c8893a"/>
              <rect x="2" y="2" width="96" height="74" rx="1" fill="none" stroke="rgba(255,255,255,.7)" stroke-width=".8"/>
              <line x1="2" y1="39" x2="98" y2="39" stroke="rgba(255,255,255,.6)" stroke-width=".6"/>
              <circle cx="50" cy="39" r="10" fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".6"/>
              <rect x="32" y="2"  width="36" height="20" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <rect x="32" y="56" width="36" height="20" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
            </svg>
            <ng-container *ngTemplateOutlet="slotsTpl"></ng-container>
          </div>

          <div *ngIf="selectedSport==='TENNIS'" class="pitch tennis-pitch"
               (dragover)="$event.preventDefault()" (drop)="onPitchDrop($event)">
            <svg class="pitch-lines" viewBox="0 0 100 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="80" fill="#4a8fc1"/>
              <rect x="5" y="5" width="90" height="70" fill="none" stroke="rgba(255,255,255,.8)" stroke-width="1"/>
              <line x1="5" y1="40" x2="95" y2="40" stroke="rgba(255,255,255,.7)" stroke-width="1"/>
              <line x1="50" y1="15" x2="50" y2="65" stroke="rgba(255,255,255,.7)" stroke-width=".8"/>
              <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,.9)" stroke-width="1.5" stroke-dasharray="2,2"/>
            </svg>
            <ng-container *ngTemplateOutlet="slotsTpl"></ng-container>
          </div>

          <ng-template #slotsTpl>
            <div *ngFor="let slot of slots" class="slot"
                 [class.filled]="!!slot.player" [class.drag-over]="dragOverSlotId===slot.id"
                 [style.left.%]="slot.x" [style.top.%]="slot.y"
                 (click)="onSlotClick(slot)"
                 (dragover)="onSlotDragOver($event,slot)"
                 (dragleave)="dragOverSlotId=null"
                 (drop)="onSlotDrop($event,slot)">
              <span class="slot-captain" *ngIf="slot.player && captainId===slot.player.id">👑</span>
              <div class="slot-circle">
                <span *ngIf="slot.player"  style="font-size:18px">{{ avatarFor(slot.player) }}</span>
                <span *ngIf="!slot.player">{{ slot.label }}</span>
              </div>
              <span *ngIf="slot.player"  class="slot-name">{{ slot.player.lastName || slot.player.firstName }}</span>
              <span *ngIf="!slot.player" class="slot-pos">{{ slot.position }}</span>
              <button *ngIf="slot.player" class="slot-remove" (click)="removePlayer(slot,$event)">×</button>
            </div>
          </ng-template>
        </div>

        <!-- Bench -->
        <div class="bench-wrap" *ngIf="benchSlots.length>0">
          <div class="bench-title">🪑 Bench <span style="font-size:11px;font-weight:400;color:#aeaeb2">(optional)</span></div>
          <div class="bench-slots">
            <div *ngFor="let slot of benchSlots" class="bench-slot"
                 [class.filled]="!!slot.player" [class.drag-over]="dragOverSlotId===slot.id"
                 (click)="onSlotClick(slot)"
                 (dragover)="onSlotDragOver($event,slot)"
                 (dragleave)="dragOverSlotId=null"
                 (drop)="onSlotDrop($event,slot)">
              <span class="bench-avatar">{{ slot.player ? avatarFor(slot.player) : '🪑' }}</span>
              <span *ngIf="slot.player"  class="bench-name">{{ slot.player.lastName || slot.player.firstName }}</span>
              <span *ngIf="!slot.player" class="bench-label">{{ slot.label }}</span>
              <button *ngIf="slot.player" class="bench-remove" (click)="removePlayer(slot,$event)">×</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Bank: only owned players -->
      <div class="bank">
        <div class="bank-header">
          <span class="bank-title">My {{ selectedSport }} Players</span>
          <span class="bank-count">{{ filteredOwnedBank.length }}</span>
        </div>

        <div *ngIf="ownedBySport(selectedSport).length===0" class="no-owned-hint">
          🛒 Buy {{ selectedSport | lowercase }} players first
          <button class="go-shop-btn" (click)="goToShop(selectedSport)">Shop →</button>
        </div>

        <div *ngIf="pickingSlot" class="picking-hint">
          Pick {{ pickingSlot.position }} → {{ pickingSlot.label }}
          <button class="cancel-btn" (click)="cancelPick()">Cancel</button>
        </div>

        <div class="pos-filter" *ngIf="ownedBySport(selectedSport).length>0">
          <button class="pos-btn" [class.active]="posFilter==='ALL'" (click)="posFilter='ALL'">All</button>
          <button *ngFor="let pos of positions" class="pos-btn" [class.active]="posFilter===pos" (click)="posFilter=pos">{{ pos }}</button>
        </div>
        <p class="drag-hint" *ngIf="ownedBySport(selectedSport).length>0">drag to pitch · click slot then player</p>

        <div class="bank-list">
          <div *ngFor="let p of filteredOwnedBank" class="player-card"
               [class.on-pitch]="isOnPitch(p)"
               [class.picking]="pickingSlot && pickingSlot.position===p.position && !isOnPitch(p)"
               draggable="true"
               (dragstart)="onDragStart($event,p)" (dragend)="onDragEnd()" (click)="selectPlayer(p)">
            <span class="player-emoji">{{ avatarFor(p) }}</span>
            <div class="player-info">
              <div class="player-name">{{ p.firstName }} {{ p.lastName }}</div>
              <div class="player-meta">{{ p.level }}</div>
            </div>
            <div class="player-right">
              <span class="pos-badge">{{ p.position }}</span>
              <span class="player-rating">⭐ {{ p.avgRating }}</span>
              <span class="player-pts">{{ p.fantasyPoints }} pts</span>
            </div>
          </div>
          <div *ngIf="filteredOwnedBank.length===0 && ownedBySport(selectedSport).length>0" class="empty">No players for this position</div>
        </div>
      </div>
    </div>
  </ng-container>

  <!-- ════════════════ VIEW ════════════════ -->
  <ng-container *ngIf="viewMode==='view'">
    <div class="view-panel">
      <div class="view-sport-nav">
        <button *ngFor="let s of allSports" class="view-sport-btn"
                [class.active]="viewSport===s.key" [class.has-team]="!!savedTeams[s.key]"
                (click)="viewSport=s.key">
          {{ s.label }} <span *ngIf="savedTeams[s.key]" style="font-size:10px;color:#34c759">●</span>
        </button>
      </div>

      <ng-container *ngIf="!savedTeams[viewSport]">
        <div class="empty-sport">
          <div class="big-icon">{{ viewSport==='FOOTBALL' ? '⚽' : viewSport==='BASKETBALL' ? '🏀' : '🎾' }}</div>
          <p class="empty-p">No {{ viewSport }} team yet</p>
          <button class="build-btn" (click)="goToBuild(viewSport)">Build this team →</button>
        </div>
      </ng-container>

      <ng-container *ngIf="savedTeams[viewSport] as t">
        <div class="view-header">
          <h2>{{ t.teamName || 'My Team' }}</h2>
          <span style="background:#e8f0fe;color:#1a73e8;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700">{{ viewSport }}</span>
          <button class="edit-btn" (click)="goToBuild(viewSport)">✏️ Edit</button>
          <button class="del-btn"  (click)="showConfirm=true">🗑</button>
        </div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-lbl">Total pts cost</div><div class="stat-val">{{ t.spent }}</div></div>
          <div class="stat-card"><div class="stat-lbl">Budget left</div><div class="stat-val" [style.color]="userPoints<0?'#ff3b30':'#34c759'">{{ userPoints }}</div></div>
          <div class="stat-card"><div class="stat-lbl">Players</div><div class="stat-val">{{ t.players.length }}</div></div>
        </div>
        <div class="section-title">Starters</div>
        <div *ngFor="let p of t.starters" class="player-row">
          <span class="pr-av">{{ avatarFor(p) }}</span>
          <div class="pr-inf">
            <div class="pr-name">{{ p.firstName }} {{ p.lastName }}</div>
            <div class="pr-meta">{{ p.level }} · {{ p.label }}</div>
          </div>
          <span class="pr-pts">{{ p.fantasyPoints }} pts</span>
        </div>
        <ng-container *ngIf="t.bench.length>0">
          <div class="section-title">Bench</div>
          <div *ngFor="let p of t.bench" class="player-row bench-row">
            <span class="pr-av">{{ avatarFor(p) }}</span>
            <div class="pr-inf">
              <div class="pr-name">{{ p.firstName }} {{ p.lastName }}</div>
              <div class="pr-meta">{{ p.level }} · {{ p.label }}</div>
            </div>
            <span class="pr-pts">{{ p.fantasyPoints }} pts</span>
          </div>
        </ng-container>
      </ng-container>
    </div>
  </ng-container>

  <!-- ════════════════ PREDICTION ════════════════ -->
  <ng-container *ngIf="viewMode==='prediction'">
    <div class="pred-panel">
      <div class="pred-header">
        <h2>🎯 Weekly Prediction</h2>
        <p>Pick your captain, predict which players will perform — and earn bonus pts if right!</p>
      </div>

      <!-- Points legend -->
      <div class="points-legend">
        <div class="legend-title">📊 How points work</div>
        <div class="legend-row">⚽ Predict goal + player scores → <strong>+rating × 1.5 / 10 per goal</strong> (bonus)</div>
        <div class="legend-row">❌ Predict goal + player doesn't score → <strong>−2 pts</strong> penalty</div>
        <div class="legend-row">— No prediction + player scores → <strong>+rating / 10</strong> (normal, no bonus)</div>
        <div class="legend-row" *ngIf="predSport==='BASKETBALL'">🏀 Predict big game + 30+ pts scored → <strong>×1.5 bonus</strong></div>
        <div class="legend-row" *ngIf="predSport==='TENNIS'">🎾 Predict win + player wins → <strong>×1.5 bonus</strong></div>
        <div class="legend-row">🟡 Yellow card → <strong>−3 pts</strong> &nbsp;|&nbsp; 🔴 Red card → <strong>−6 pts</strong> (automatic)</div>
        <div class="legend-row">👑 Captain → <strong>×2</strong> on all earned points for that player</div>
      </div>

      <div class="pred-sport-nav">
        <button *ngFor="let s of allSports" class="pred-sport-btn"
                [class.active]="predSport===s.key" [disabled]="!savedTeams[s.key]"
                (click)="setPredSport(s.key)">
          {{ s.label }}<span *ngIf="!savedTeams[s.key]" style="font-size:10px;color:#aeaeb2"> (no team)</span>
        </button>
      </div>

      <div class="no-team-warn" *ngIf="!savedTeams[predSport]">
        ⚠️ No {{ predSport }} team.
        <button style="margin-left:8px;background:none;border:none;color:#795548;font-weight:700;cursor:pointer"
                (click)="goToBuild(predSport)">Build one →</button>
      </div>

      <ng-container *ngIf="savedTeams[predSport] as t">
        <div class="captain-section">
          <div class="captain-label">👑 Choose your captain (points × 2)</div>
          <div class="captain-list">
            <button *ngFor="let p of t.starters" class="captain-btn"
                    [class.selected]="captainId===p.id" (click)="captainId=p.id">
              {{ avatarFor(p) }} {{ p.firstName }} {{ p.lastName }}
            </button>
          </div>
        </div>

        <div class="section-title">Your starters — toggle goal predictions</div>
        <div *ngFor="let p of t.starters" class="player-row">
          <span class="pr-av">{{ avatarFor(p) }}</span>
          <div class="pr-inf">
            <div class="pr-name">
              {{ p.firstName }} {{ p.lastName }}
              <span *ngIf="captainId===p.id" style="font-size:12px;margin-left:4px">👑</span>
            </div>
            <div class="pr-meta">{{ p.position }} · {{ p.label }}</div>
          </div>
          <button class="pred-toggle-btn"
                  [class.active]="!!playerGoalPredictions[p.id]"
                  (click)="playerGoalPredictions[p.id] = !playerGoalPredictions[p.id]">
            <ng-container *ngIf="predSport==='FOOTBALL'">{{ playerGoalPredictions[p.id] ? '⚽ Will Score' : '— No Goal' }}</ng-container>
            <ng-container *ngIf="predSport==='BASKETBALL'">{{ playerGoalPredictions[p.id] ? '🏀 Big Game' : '— Safe' }}</ng-container>
            <ng-container *ngIf="predSport==='TENNIS'">{{ playerGoalPredictions[p.id] ? '🎾 Will Win' : '— Safe' }}</ng-container>
          </button>
          <span class="pr-pts">{{ p.fantasyPoints }} pts</span>
        </div>

        <button class="submit-pred-btn"
                [class.loading]="predState==='loading'" [class.success]="predState==='success'"
                [disabled]="!captainId || predState==='loading'" (click)="submitPrediction()">
          <span *ngIf="predState==='idle'">🚀 Submit Prediction</span>
          <span *ngIf="predState==='loading'">Submitting…</span>
          <span *ngIf="predState==='success'">Submitted ✅</span>
        </button>

        <div class="pred-result-card" *ngIf="currentPrediction">
          <div class="pred-result-header">
            <div>
              <div class="pred-week">Week {{ currentPrediction.weekNumber }} / {{ currentPrediction.weekYear }}</div>
              <div style="font-size:11px;color:#6e6e73;margin-top:2px">
                {{ activePredictions.length }} player{{ activePredictions.length !== 1 ? 's' : '' }} predicted
              </div>
            </div>
            <span class="pred-status-badge" [class]="currentPrediction.status">{{ currentPrediction.status }}</span>
            <span class="pred-total"
                  [style.color]="currentPrediction.totalPointsEarned >= 0 ? '#007aff' : '#ff3b30'">
              {{ currentPrediction.totalPointsEarned >= 0 ? '+' : '' }}{{ currentPrediction.totalPointsEarned | number:'1.1-1' }} pts
            </span>
          </div>

          <!-- Empty state -->
          <div *ngIf="activePredictions.length === 0"
               style="text-align:center;padding:20px 0;color:#aeaeb2;font-size:13px">
            No predictions made for this week
          </div>

          <!-- Only predicted players (+ captain always shown) -->
          <ng-container *ngFor="let pp of currentPrediction.playerPredictions">
            <div *ngIf="pp.predictGoal" class="pred-player-row">
              <span style="font-size:16px;width:28px;text-align:center">{{ avatarForPosition(pp.playerPosition) }}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:700;color:#1d1d1f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  {{ pp.playerName }}
                  <span *ngIf="pp.isCaptain" style="font-size:11px"> 👑</span>
                  <span *ngIf="pp.predictGoal" style="font-size:10px;color:#34c759;font-weight:700;margin-left:4px">
                    {{ predSport === 'BASKETBALL' ? '🏀 Big Game' : predSport === 'TENNIS' ? '🎾 Win' : '⚽ Goal' }}
                  </span>
                </div>
                <div class="res-icons" *ngIf="currentPrediction.status === 'RESOLVED'">
                  <span *ngIf="pp.goalsScored && pp.goalsScored > 0">⚽×{{ pp.goalsScored }}</span>
                  <span *ngFor="let y of repeat(pp.yellowCards ?? 0)" class="card-y" title="Yellow card (-3pts)"></span>
                  <span *ngFor="let r of repeat(pp.redCards ?? 0)" class="card-r" title="Red card (-6pts)"></span>
                  <span *ngIf="pp.tennisWin === true" style="font-size:10px">🎾 Win</span>
                  <span *ngIf="pp.tennisWin === false" style="font-size:10px">🎾 Loss</span>
                  <span *ngIf="pp.basketballPoints != null" style="font-size:10px">🏀 {{ pp.basketballPoints }} pts</span>
                </div>
              </div>
              <span class="pred-result-badge" [class]="pp.result">{{ pp.result }}</span>
              <span style="font-size:13px;font-weight:800;min-width:52px;text-align:right"
                    [style.color]="pp.pointsEarned >= 0 ? '#007aff' : '#ff3b30'">
                {{ pp.pointsEarned >= 0 ? '+' : '' }}{{ pp.pointsEarned | number:'1.1-1' }}
              </span>
            </div>
          </ng-container>
        </div>
        <!-- ── Test / Admin panel ── -->
        <div class="test-panel" *ngIf="currentPrediction && currentPrediction.status === 'PENDING'">
          <div class="test-panel-header">
            <span class="test-panel-title">🧪 Simulate Match Results (test only)</span>
            <button style="background:none;border:none;font-size:11px;color:#795548;cursor:pointer;font-weight:700"
                    (click)="showTestPanel = !showTestPanel">
              {{ showTestPanel ? '▲ Hide' : '▼ Show' }}
            </button>
          </div>

          <ng-container *ngIf="showTestPanel">
            <div *ngFor="let pp of currentPrediction.playerPredictions" class="test-player-row">
              <span style="font-size:15px">{{ avatarForPosition(pp.playerPosition) }}</span>
              <div class="test-player-name">
                {{ pp.playerName }}
                <span *ngIf="pp.isCaptain" style="font-size:10px"> 👑</span>
                <span *ngIf="pp.predictGoal" style="font-size:10px;color:#34c759"> ⚽predicted</span>
              </div>

              <!-- Football stats -->
              <ng-container *ngIf="predSport === 'FOOTBALL'">
                <div class="stat-group">
                  <input class="stat-input" type="number" min="0" max="5" [(ngModel)]="testStats[pp.playerId].goals" placeholder="0">
                  <span class="stat-label">⚽ Goals</span>
                </div>
                <div class="stat-group">
                  <input class="stat-input" type="number" min="0" max="1" [(ngModel)]="testStats[pp.playerId].yellow" placeholder="0">
                  <span class="stat-label">🟡 Yellow</span>
                </div>
                <div class="stat-group">
                  <input class="stat-input" type="number" min="0" max="1" [(ngModel)]="testStats[pp.playerId].red" placeholder="0">
                  <span class="stat-label">🔴 Red</span>
                </div>
              </ng-container>

              <!-- Basketball stats -->
              <ng-container *ngIf="predSport === 'BASKETBALL'">
                <div class="stat-group">
                  <input class="stat-input" type="number" min="0" max="60" [(ngModel)]="testStats[pp.playerId].bpts" placeholder="0">
                  <span class="stat-label">🏀 Pts</span>
                </div>
              </ng-container>

              <!-- Tennis stats -->
              <ng-container *ngIf="predSport === 'TENNIS'">
                <button class="win-toggle" [class.yes]="testStats[pp.playerId].win"
                        (click)="testStats[pp.playerId].win = !testStats[pp.playerId].win">
                  {{ testStats[pp.playerId].win ? '🎾 Win' : '🎾 Loss' }}
                </button>
              </ng-container>
            </div>

            <button class="resolve-btn" [disabled]="resolveState === 'loading'" (click)="saveAndResolve()">
              <span *ngIf="resolveState !== 'loading'">⚡ Save Stats & Resolve</span>
              <span *ngIf="resolveState === 'loading'">Resolving…</span>
            </button>
          </ng-container>
        </div>

      </ng-container>
    </div>
  </ng-container>

  <!-- Toast -->
  <div *ngIf="toastMsg" class="toast" [class.success]="toastType==='success'" [class.error]="toastType==='error'">
    {{ toastMsg }}
  </div>
</div>
  `
})
export class FrontofficeFantasyComponent implements OnInit {

  // ── View state ──────────────────────────────────────────────────────────────
  viewMode:      ViewMode = 'shop';
  selectedSport: Sport    = 'FOOTBALL';
  viewSport:     Sport    = 'FOOTBALL';
  predSport:     Sport    = 'FOOTBALL';
  shopSport:     Sport    = 'FOOTBALL';

  saveState  = 'idle';
  predState  = 'idle';
  apiError: string | null = null;
  toastMsg   = '';
  toastType: 'success' | 'error' = 'success';
  showConfirm    = false;
  bankLoading    = false;
  shopBankLoading = false;
  isUpdateMode   = false;
  existingTeamId: number | null = null;
  captainId:      number | null = null;
  playerGoalPredictions: Record<number, boolean> = {};
  currentPrediction: PredictionResult | null = null;
  showTestPanel  = false;
  resolveState   = 'idle';
  testStats: Record<number, { goals: number; yellow: number; red: number; bpts: number; win: boolean }> = {};
  teamName = '';

  // ── Budget: 200 pts shared pool. Decreases when buying, increases when selling ──
  userPoints = 200;

  private readonly currentUserId = 1;
  private readonly BASE = 'http://localhost:8089/SpringSecurity';

  // ── Players ─────────────────────────────────────────────────────────────────
  /** All players fetched from API, keyed by sport */
  private allPlayersMap: Record<Sport, Player[]> = { FOOTBALL: [], BASKETBALL: [], TENNIS: [] };

  /** Players the user has purchased */
  ownedPlayers: Player[] = [];

  // ── Pitch / bench ───────────────────────────────────────────────────────────
  slots:      Slot[] = footballSlots();
  benchSlots: Slot[] = footballBench();
  pickingSlot: Slot | null = null;
  posFilter = 'ALL';

  // ── Shop filters ────────────────────────────────────────────────────────────
  shopPosFilter = 'ALL';

  // ── Confirm modals ──────────────────────────────────────────────────────────
  buyCandidate:  Player | null = null;
  sellCandidate: Player | null = null;

  // ── Drag ────────────────────────────────────────────────────────────────────
  private draggedPlayer: Player | null = null;
  dragOverSlotId: number | null = null;

  // ── Saved teams ─────────────────────────────────────────────────────────────
  savedTeams: Partial<Record<Sport, {
    teamName: string; spent: number; remaining: number;
    players: Player[];
    starters: Array<Player & { label: string }>;
    bench:    Array<Player & { label: string }>;
    dbId: number | null;
  }>> = {};

  readonly allSports = [
    { key: 'FOOTBALL'   as Sport, label: '⚽ Football'   },
    { key: 'BASKETBALL' as Sport, label: '🏀 Basketball' },
    { key: 'TENNIS'     as Sport, label: '🎾 Tennis'     },
  ];

  readonly sportPositions: Record<Sport, string[]> = {
    FOOTBALL:   ['GK','DEF','MID','FWD'],
    BASKETBALL: ['PG','SG','SF','PF','C'],
    TENNIS:     ['P1'],
  };

  constructor(private http: HttpClient, private teamService: VirtualTeamService) {}

  ngOnInit(): void {
    this.loadAllSportPlayers();
    this.loadAllMyTeams();
  }

  // ── Computed ─────────────────────────────────────────────────────────────────
  get positions(): string[]  { return this.sportPositions[this.selectedSport]; }
  get filledSlots(): number  { return this.slots.filter(s => !!s.player).length; }
  get pitchPlayerCount(): number {
    return [...this.slots, ...this.benchSlots].filter(s => !!s.player).length;
  }
  get hasAnySavedTeam(): boolean { return Object.keys(this.savedTeams).length > 0; }

  /** Players shown in shop: all players for shopSport, filtered by position */
  get filteredShopBank(): Player[] {
    const all = this.allPlayersMap[this.shopSport];
    return this.shopPosFilter === 'ALL' ? all : all.filter(p => p.position === this.shopPosFilter);
  }

  /** Owned players for current build sport, filtered by posFilter, not yet on pitch */
  get filteredOwnedBank(): Player[] {
    const owned = this.ownedBySport(this.selectedSport);
    return (this.posFilter === 'ALL' ? owned : owned.filter(p => p.position === this.posFilter));
  }

  ownedBySport(sport: Sport): Player[] {
    return this.ownedPlayers.filter(p => p.sportType === sport || p.sportType?.toUpperCase() === sport);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  get activePredictions() {
    return this.currentPrediction?.playerPredictions.filter(pp => pp.predictGoal) ?? [];
  }

  repeat(n: number): number[] { return Array.from({ length: n }); }
  avatarFor(p: Player): string { return this.avatarForPosition(p.position); }
  avatarForPosition(pos: string): string {
    const m: Record<string, string> = {
      GK:'🧤', DEF:'🛡️', MID:'⚙️', FWD:'⚽',
      PG:'🏀', SG:'🏀', SF:'🏀', PF:'🏀', C:'🏀', P1:'🎾'
    };
    return m[pos] ?? '👤';
  }

  /** Is this player in the owned list? */
  isOwned(p: Player): boolean { return this.ownedPlayers.some(o => o.id === p.id); }

  /** Is this player currently placed on the pitch or bench? */
  isOnPitch(p: Player): boolean {
    return [...this.slots, ...this.benchSlots].some(s => s.player?.id === p.id);
  }

  private normalizePlayer(p: any): Player {
    return { ...p, firstName: (p.firstName ?? '').trim(), lastName: (p.lastName ?? '').trim() };
  }

  private freshSlotsFor(sport: Sport): Slot[] {
    return sport === 'FOOTBALL' ? footballSlots() : sport === 'BASKETBALL' ? basketballSlots() : tennisSlots();
  }
  private freshBenchFor(sport: Sport): Slot[] {
    return sport === 'FOOTBALL' ? footballBench() : sport === 'BASKETBALL' ? basketballBench() : [];
  }

  // ── Load all players for all sports up front ─────────────────────────────────
  loadAllSportPlayers(): void {
    this.shopBankLoading = true;
    let loaded = 0;
    const sports: Sport[] = ['FOOTBALL', 'BASKETBALL', 'TENNIS'];
    sports.forEach(sport => {
      this.http.get<Player[]>(`${this.BASE}/player-profiles/sport/${sport}`).subscribe({
        next: (players) => {
          this.allPlayersMap[sport] = players.map(p => this.normalizePlayer(p));
          loaded++;
          if (loaded === sports.length) this.shopBankLoading = false;
        },
        error: () => {
          loaded++;
          if (loaded === sports.length) this.shopBankLoading = false;
        }
      });
    });
  }

  // ── Shop: set sport ──────────────────────────────────────────────────────────
  setShopSport(sport: Sport): void {
    this.shopSport = sport;
    this.shopPosFilter = 'ALL';
  }

  // ── Shop: open buy modal ─────────────────────────────────────────────────────
  openBuyModal(p: Player): void {
    if (this.isOwned(p)) return;
    if (this.userPoints < p.fantasyPoints) { this.showToast('Not enough points!', 'error'); return; }
    this.buyCandidate = p;
  }

  confirmBuy(): void {
    if (!this.buyCandidate) return;
    const p = this.buyCandidate;
    if (this.userPoints < p.fantasyPoints) { this.showToast('Not enough points!', 'error'); this.buyCandidate = null; return; }
    this.userPoints -= p.fantasyPoints;
    this.ownedPlayers = [...this.ownedPlayers, p];
    this.buyCandidate = null;
    this.showToast(`✅ ${p.firstName} ${p.lastName} added to your squad!`, 'success');
  }

  // ── Inventory: open sell modal ───────────────────────────────────────────────
  openSellModal(p: Player): void { this.sellCandidate = p; }

  confirmSell(): void {
    if (!this.sellCandidate) return;
    const p = this.sellCandidate;
    // Remove from pitch / bench in all sports
    [...this.slots, ...this.benchSlots].forEach(s => { if (s.player?.id === p.id) s.player = null; });
    // Remove from all saved team snapshots
    Object.keys(this.savedTeams).forEach(sport => {
      const t = this.savedTeams[sport as Sport];
      if (t) {
        t.players  = t.players.filter(pl => pl.id !== p.id);
        t.starters = t.starters.filter(pl => pl.id !== p.id);
        t.bench    = t.bench.filter(pl => pl.id !== p.id);
      }
    });
    this.ownedPlayers = this.ownedPlayers.filter(o => o.id !== p.id);
    this.userPoints  += p.fantasyPoints;
    this.sellCandidate = null;
    this.showToast(`💰 Sold ${p.firstName} ${p.lastName} — +${p.fantasyPoints} pts back`, 'success');
  }

  // ── Load all saved teams ──────────────────────────────────────────────────────
  loadAllMyTeams(): void {
    this.teamService.getTeamsByUser(this.currentUserId).subscribe({
      next: (teams) => {
        const sports = [...new Set(teams.map((t: any) => t.sportType as Sport))];
        sports.forEach((sport: Sport) => {
          // Use already-fetched allPlayersMap once available; poll until ready
          const tryBuild = () => {
            if (this.allPlayersMap[sport].length > 0) {
              teams.filter((t: any) => t.sportType === sport)
                   .forEach((t: any) => this.buildSnapshot(sport, t, this.allPlayersMap[sport]));
            } else {
              setTimeout(tryBuild, 300);
            }
          };
          tryBuild();
        });
        if (teams.length > 0) {
          const first = this.allSports.find(s => teams.some((t: any) => t.sportType === s.key));
          if (first) { this.viewSport = first.key; this.viewMode = 'view'; }
        }
      },
      error: () => {}
    });
  }

  private buildSnapshot(sport: Sport, t: any, allPlayers: Player[]): void {
    const players = (t.playerIds ?? [])
      .map((id: number) => allPlayers.find(p => p.id === id))
      .filter((p: Player | undefined): p is Player => !!p);

    const freshSlots = this.freshSlotsFor(sport);
    const freshBench = this.freshBenchFor(sport);
    const usedIds    = new Set<number>();

    for (const slot of freshSlots) {
      const match = players.find((p: Player) => p.position === slot.position && !usedIds.has(p.id));
      if (match) { slot.player = match; usedIds.add(match.id); }
    }
    for (const slot of freshBench) {
      const match = players.find((p: Player) => p.position === slot.position && !usedIds.has(p.id));
      if (match) { slot.player = match; usedIds.add(match.id); }
    }

    const starters = freshSlots.filter(s => !!s.player).map(s => ({ ...s.player!, label: s.label }));
    const bench    = freshBench.filter(s => !!s.player).map(s => ({ ...s.player!, label: s.label }));
    const spent    = players.reduce((acc: number, p: Player) => acc + p.fantasyPoints, 0);

    this.savedTeams[sport] = { teamName: t.name ?? '', spent, remaining: this.userPoints - spent, players, starters, bench, dbId: t.id };

    // Add team players to ownedPlayers if not already there
    players.forEach((p: Player) => { if (!this.isOwned(p)) this.ownedPlayers.push(p); });

    if (sport === this.selectedSport) { this.existingTeamId = t.id; this.isUpdateMode = true; }
  }

  // ── Sport switch (build mode) ────────────────────────────────────────────────
  setSport(sport: Sport): void {
    this.selectedSport  = sport;
    this.posFilter      = 'ALL';
    this.pickingSlot           = null;
    this.apiError              = null;
    this.captainId             = null;
    this.playerGoalPredictions = {};
    this.slots                 = this.freshSlotsFor(sport);
    this.benchSlots     = this.freshBenchFor(sport);
    const existing      = this.savedTeams[sport];
    this.existingTeamId = existing?.dbId ?? null;
    this.isUpdateMode   = !!existing;
  }

  setPredSport(sport: Sport): void {
    this.predSport              = sport;
    this.captainId              = null;
    this.playerGoalPredictions  = {};
    this.currentPrediction      = null;
    const dbId = this.savedTeams[sport]?.dbId;
    if (dbId) this.loadCurrentPrediction(dbId);
  }

  goToBuild(sport: Sport): void {
    this.selectedSport = sport;
    this.posFilter     = 'ALL';
    this.pickingSlot   = null;
    this.viewMode      = 'build';
    const saved = this.savedTeams[sport];
    if (saved) {
      this.teamName = saved.teamName; this.existingTeamId = saved.dbId; this.isUpdateMode = true;
      const freshSlots = this.freshSlotsFor(sport);
      for (const slot of freshSlots) {
        const match = saved.starters.find(sp => sp.label === slot.label);
        if (match) { const full = this.ownedBySport(sport).find(p => p.id === match.id); if (full) slot.player = full; }
      }
      this.slots = freshSlots;
      const freshBench = this.freshBenchFor(sport);
      for (const slot of freshBench) {
        const match = saved.bench.find(sp => sp.label === slot.label);
        if (match) { const full = this.ownedBySport(sport).find(p => p.id === match.id); if (full) slot.player = full; }
      }
      this.benchSlots = freshBench;
    } else {
      this.teamName = ''; this.existingTeamId = null; this.isUpdateMode = false;
      this.slots = this.freshSlotsFor(sport); this.benchSlots = this.freshBenchFor(sport);
    }
  }

  goToShop(sport: Sport): void {
    this.shopSport    = sport;
    this.viewMode     = 'shop';
    this.shopPosFilter = 'ALL';
  }

  // ── Slot interactions ────────────────────────────────────────────────────────
  onSlotClick(slot: Slot): void { if (slot.player) return; this.pickingSlot = slot; this.posFilter = slot.position; }
  cancelPick(): void { this.pickingSlot = null; this.posFilter = 'ALL'; }

  selectPlayer(p: Player): void {
    if (this.isOnPitch(p) || !this.pickingSlot || this.pickingSlot.position !== p.position) return;
    this.pickingSlot.player = p; this.pickingSlot = null; this.posFilter = 'ALL';
  }
  removePlayer(slot: Slot, e: Event): void { e.stopPropagation(); slot.player = null; }

  // ── Drag & drop ──────────────────────────────────────────────────────────────
  onDragStart(e: DragEvent, p: Player): void {
    if (this.isOnPitch(p)) { e.preventDefault(); return; }
    this.draggedPlayer = p; e.dataTransfer?.setData('playerId', String(p.id));
  }
  onDragEnd(): void { this.draggedPlayer = null; this.dragOverSlotId = null; }
  onSlotDragOver(e: DragEvent, slot: Slot): void {
    e.preventDefault();
    if (this.draggedPlayer?.position === slot.position) this.dragOverSlotId = slot.id;
  }
  onSlotDrop(e: DragEvent, slot: Slot): void {
    e.preventDefault(); this.dragOverSlotId = null;
    if (!this.draggedPlayer || this.draggedPlayer.position !== slot.position || this.isOnPitch(this.draggedPlayer)) return;
    slot.player = this.draggedPlayer; this.draggedPlayer = null; this.pickingSlot = null;
  }
  onPitchDrop(e: DragEvent): void { e.preventDefault(); }

  // ── Save team ─────────────────────────────────────────────────────────────────
  saveTeam(): void {
    if (!this.teamName.trim()) { this.showToast('Please enter a team name', 'error'); return; }
    this.saveState = 'loading'; this.apiError = null;
    const allIds = [...new Set(
      [...this.slots, ...this.benchSlots].filter(s => !!s.player).map(s => s.player!.id)
    )];
    const dto = { sportType: this.selectedSport as SportType, name: this.teamName, userId: this.currentUserId, playerIds: allIds, earnedPoints: 0, weekPoints: 0 };
    const call$ = this.isUpdateMode && this.existingTeamId
      ? this.teamService.updateTeam(this.existingTeamId, dto)
      : this.teamService.createTeam(dto);
    call$.subscribe({
      next: (res) => {
        this.existingTeamId = res.id; this.isUpdateMode = true; this.saveState = 'success';
        this.snapshotTeam(this.selectedSport, res.id); this.viewSport = this.selectedSport;
        this.showToast(`✅ "${this.teamName}" saved!`, 'success');
        setTimeout(() => { this.saveState = 'idle'; this.viewMode = 'view'; }, 1400);
      },
      error: (err: any) => {
        this.saveState = 'error'; this.apiError = err?.error?.message ?? 'Server error';
        this.showToast('❌ Failed to save', 'error');
        setTimeout(() => this.saveState = 'idle', 3000);
      }
    });
  }

  private snapshotTeam(sport: Sport, dbId: number | null): void {
    const starters = this.slots.filter(s => !!s.player).map(s => ({ ...s.player!, label: s.label }));
    const bench    = this.benchSlots.filter(s => !!s.player).map(s => ({ ...s.player!, label: s.label }));
    const players  = [...starters, ...bench];
    const spent    = players.reduce((acc, p) => acc + p.fantasyPoints, 0);
    this.savedTeams[sport] = { teamName: this.teamName, spent, remaining: this.userPoints, players, starters, bench, dbId };
  }

  // ── Prediction ────────────────────────────────────────────────────────────────
  loadCurrentPrediction(teamId: number): void {
    this.http.get<PredictionResult>(`${this.BASE}/predictions/current/${teamId}`).subscribe({
      next:  (p) => { this.currentPrediction = p; this.initTestStats(p); },
      error: ()  => { this.currentPrediction = null; }
    });
  }

  private initTestStats(p: PredictionResult): void {
    this.testStats = {};
    for (const pp of p.playerPredictions) {
      this.testStats[pp.playerId] = { goals: 0, yellow: 0, red: 0, bpts: 0, win: false };
    }
  }

  submitPrediction(): void {
    const t = this.savedTeams[this.predSport];
    if (!t?.dbId || !this.captainId) return;
    this.predState = 'loading';
    const dto = {
      virtualTeamId:   t.dbId,
      captainPlayerId: this.captainId,
      players: t.starters.map(p => ({
        playerId:       p.id,
        playerName:     `${p.firstName}${p.lastName ? ' ' + p.lastName : ''}`.trim(),
        playerPosition: p.position,
        playerRating:   Math.round(p.avgRating),
        predictGoal:    !!this.playerGoalPredictions[p.id],
      })),
    };
    this.http.post<PredictionResult>(`${this.BASE}/predictions/submit`, dto).subscribe({
      next:  (res) => { this.currentPrediction = res; this.initTestStats(res); this.predState = 'success'; this.showToast('🎯 Prediction submitted!', 'success'); setTimeout(() => this.predState = 'idle', 2000); },
      error: ()    => { this.predState = 'idle'; this.showToast('❌ Could not submit', 'error'); }
    });
  }

  // ── Admin: save stats then resolve ───────────────────────────────────────────
  saveAndResolve(): void {
    if (!this.currentPrediction) return;
    this.resolveState = 'loading';

    const week = this.currentPrediction.weekNumber;
    const year = this.currentPrediction.weekYear;
    const predId = this.currentPrediction.id;
    const players = this.currentPrediction.playerPredictions;

    // Build one stat DTO per player and post them sequentially, then resolve
    const statDtos = players.map(pp => ({
      playerId:         pp.playerId,
      playerName:       pp.playerName,
      sportType:        this.predSport,
      weekNumber:       week,
      weekYear:         year,
      goalsScored:      this.testStats[pp.playerId]?.goals  ?? 0,
      yellowCards:      this.testStats[pp.playerId]?.yellow ?? 0,
      redCards:         this.testStats[pp.playerId]?.red    ?? 0,
      basketballPoints: this.testStats[pp.playerId]?.bpts   ?? 0,
      tennisWin:        this.testStats[pp.playerId]?.win    ?? false,
    }));

    // Post all stats in parallel, then resolve
    const requests = statDtos.map(dto =>
      lastValueFrom(this.http.post(`${this.BASE}/predictions/admin/stats`, dto))
    );

    Promise.all(requests)
      .then(() => lastValueFrom(this.http.post<PredictionResult>(`${this.BASE}/predictions/admin/resolve/${predId}`, {})))
      .then((resolved) => {
        this.currentPrediction = resolved ?? null;
        this.showTestPanel  = false;
        this.resolveState   = 'idle';
        this.showToast('✅ Resolved! Check your results.', 'success');
      })
      .catch(() => {
        this.resolveState = 'idle';
        this.showToast('❌ Resolution failed', 'error');
      });
  }

  // ── Delete team ───────────────────────────────────────────────────────────────
  confirmDelete(): void {
    this.showConfirm = false;
    const t = this.savedTeams[this.viewSport];
    if (!t?.dbId) { delete this.savedTeams[this.viewSport]; this.showToast('🗑 Deleted', 'success'); return; }
    this.teamService.deleteTeam(t.dbId).subscribe({
      next:  () => { delete this.savedTeams[this.viewSport]; this.showToast('🗑 Team deleted', 'success'); },
      error: () => this.showToast('❌ Could not delete', 'error')
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toastMsg = msg; this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3500);
  }
}