import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VirtualTeamService, SportType } from '../../core/services/virtual-team.service';

interface Player {
  id: number; name: string; position: string;
  team: string; rating: number; price: number; avatar: string;
}

interface Slot {
  id: number; position: string; label: string;
  x: number; y: number; player: Player | null;
  isBench?: boolean;
}

type Sport = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS';
type ViewMode = 'build' | 'view';

const FOOTBALL_PLAYERS: Player[] = [
  { id:1,  name:'Aymen Toumi',   position:'GK',  team:'Espérance ST',   rating:84, price:6,  avatar:'🧤' },
  { id:2,  name:'Bilel Arous',   position:'DEF', team:'Club Africain',  rating:79, price:5,  avatar:'🛡️' },
  { id:3,  name:'Sami Trabelsi', position:'DEF', team:'CS Sfaxien',     rating:78, price:5,  avatar:'🛡️' },
  { id:4,  name:'Riadh Jelassi', position:'DEF', team:'Stade Tunisien', rating:77, price:4,  avatar:'🛡️' },
  { id:5,  name:'Omar Chouaib',  position:'DEF', team:'Espérance ST',   rating:80, price:5,  avatar:'🛡️' },
  { id:6,  name:'Khalil Jdidi',  position:'MID', team:'US Monastir',    rating:81, price:6,  avatar:'⚙️' },
  { id:7,  name:'Malek Nasri',   position:'MID', team:'Espérance ST',   rating:83, price:7,  avatar:'⚙️' },
  { id:8,  name:'Fares Mbarki',  position:'MID', team:'CS Sfaxien',     rating:78, price:5,  avatar:'⚙️' },
  { id:9,  name:'Yassin Khlif',  position:'FWD', team:'Club Africain',  rating:82, price:8,  avatar:'⚽' },
  { id:10, name:'Slim Bouaziz',  position:'FWD', team:'Espérance ST',   rating:86, price:10, avatar:'⚽' },
  { id:11, name:'Nizar Issaoui', position:'FWD', team:'US Monastir',    rating:80, price:7,  avatar:'⚽' },
  { id:12, name:'Hamdi Nagguez', position:'DEF', team:'Espérance ST',   rating:76, price:4,  avatar:'🛡️' },
  { id:13, name:'Yassine Meriah',position:'DEF', team:'CS Sfaxien',     rating:75, price:4,  avatar:'🛡️' },
  { id:14, name:'Anis Badri',    position:'MID', team:'Club Africain',  rating:77, price:5,  avatar:'⚙️' },
  { id:15, name:'Mohamed Ali',   position:'FWD', team:'US Monastir',    rating:74, price:5,  avatar:'⚽' },
];

const BASKETBALL_PLAYERS: Player[] = [
  { id:20, name:'Amine Dridi',     position:'PG', team:'Club Africain',  rating:85, price:9, avatar:'🏀' },
  { id:21, name:'Sofiene Alaya',   position:'SG', team:'Espérance ST',   rating:82, price:8, avatar:'🏀' },
  { id:22, name:'Tarek Ben Ali',   position:'SF', team:'US Monastir',    rating:79, price:6, avatar:'🏀' },
  { id:23, name:'Hamza Karray',    position:'PF', team:'CS Sfaxien',     rating:77, price:5, avatar:'🏀' },
  { id:24, name:'Lotfi Sassi',     position:'C',  team:'Stade Tunisien', rating:81, price:7, avatar:'🏀' },
  { id:25, name:'Wael Hamdi',      position:'PG', team:'CS Sfaxien',     rating:76, price:5, avatar:'🏀' },
  { id:26, name:'Mehdi Ben Slama', position:'SG', team:'Club Africain',  rating:80, price:7, avatar:'🏀' },
  { id:27, name:'Karim Souissi',   position:'SF', team:'Espérance ST',   rating:75, price:5, avatar:'🏀' },
];

const TENNIS_PLAYERS: Player[] = [
  { id:40, name:'Malek Jaziri',     position:'P1', team:'Tunisia', rating:88, price:12, avatar:'🎾' },
  { id:41, name:'Skander Mansouri', position:'P1', team:'Tunisia', rating:74, price:5,  avatar:'🎾' },
  { id:42, name:'Aziz Dougaz',      position:'P1', team:'Tunisia', rating:71, price:4,  avatar:'🎾' },
];

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

@Component({
  selector: 'fo-fantasy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { padding: 24px; max-width: 1300px; margin: 0 auto;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    .header { margin-bottom: 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .header h1 { font-size: 28px; font-weight: 800; color: #1d1d1f; }
    .team-name-input { flex: 1; min-width: 200px; max-width: 320px;
                       border: 1.5px solid #e0e0e5; border-radius: 10px;
                       padding: 8px 14px; font-size: 15px; font-weight: 600;
                       color: #1d1d1f; outline: none; }
    .team-name-input:focus { border-color: #1d1d1f; }

    .sport-tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .sport-tab { display: flex; align-items: center; gap: 8px; padding: 9px 18px;
                 border-radius: 12px; border: 1.5px solid #e0e0e5; background: white;
                 cursor: pointer; font-size: 13px; font-weight: 600; color: #6e6e73; transition: all .15s; }
    .sport-tab.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }

    .budget-bar { background: white; border: 1px solid #e0e0e5; border-radius: 14px;
                  padding: 12px 20px; display: flex; align-items: center; gap: 16px;
                  margin-bottom: 20px; flex-wrap: wrap; }
    .budget-item { display: flex; flex-direction: column; }
    .budget-label { font-size: 10px; font-weight: 600; color: #aeaeb2; text-transform: uppercase; letter-spacing:.04em; }
    .budget-value { font-size: 18px; font-weight: 800; color: #1d1d1f; }
    .budget-value.warn { color: #ff3b30; }
    .budget-sep { width: 1px; height: 32px; background: #e0e0e5; }
    .btn-group { margin-left: auto; display: flex; gap: 8px; align-items: center; }

    .save-btn { border: none; padding: 10px 20px; border-radius: 10px;
                font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; }
    .save-btn.idle    { background: #1d1d1f; color: white; }
    .save-btn.loading { background: #6e6e73; color: white; cursor: wait; }
    .save-btn.success { background: #34c759; color: white; }
    .save-btn.error   { background: #ff3b30; color: white; }
    .save-btn:disabled { opacity: .4; cursor: default; }

    .view-btn { border: 1.5px solid #1d1d1f; background: white; color: #1d1d1f;
                padding: 10px 20px; border-radius: 10px; font-size: 13px;
                font-weight: 600; cursor: pointer; }
    .view-btn:hover { background: #f5f5f7; }

    .delete-btn { border: 1.5px solid #ff3b30; background: white; color: #ff3b30;
                  padding: 10px 20px; border-radius: 10px; font-size: 13px;
                  font-weight: 600; cursor: pointer; transition: all .2s; }
    .delete-btn:hover { background: #fff2f2; }
    .delete-btn:disabled { opacity: .4; cursor: default; }

    .main-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; }
    .left-col { display: flex; flex-direction: column; gap: 16px; }

    .pitch-wrap { background: white; border: 1px solid #e0e0e5; border-radius: 20px; padding: 16px; }
    .pitch-title { font-size: 14px; font-weight: 700; color: #1d1d1f; margin-bottom: 12px; }
    .pitch { position: relative; width: 100%; border-radius: 12px; overflow: hidden; }
    .football-pitch   { padding-bottom: 130%; }
    .basketball-pitch { padding-bottom: 78%; }
    .tennis-pitch     { padding-bottom: 80%; }
    .pitch-lines { position: absolute; inset: 0; }

    .slot { position: absolute; transform: translate(-50%, -50%);
            display: flex; flex-direction: column; align-items: center; gap: 3px;
            cursor: pointer; z-index: 10; }
    .slot-circle { width: 50px; height: 50px; border-radius: 50%;
                   border: 2.5px dashed rgba(255,255,255,.6);
                   background: rgba(0,0,0,.25);
                   display: flex; align-items: center; justify-content: center;
                   transition: all .2s; font-size: 10px; font-weight: 700; color: rgba(255,255,255,.8); }
    .slot.drag-over .slot-circle { border-color: #34c759; background: rgba(52,199,89,.3); border-style: solid; transform: scale(1.12); }
    .slot.filled .slot-circle { border-style: solid; border-color: #fff; background: rgba(0,0,0,.5); }
    .slot-name { font-size: 10px; font-weight: 700; color: white;
                 text-shadow: 0 1px 4px rgba(0,0,0,.8); white-space: nowrap;
                 max-width: 68px; overflow: hidden; text-overflow: ellipsis; text-align: center; }
    .slot-pos { font-size: 9px; color: rgba(255,255,255,.75); text-shadow: 0 1px 3px rgba(0,0,0,.8); }
    .slot-remove { position: absolute; top: -4px; right: -4px; width: 16px; height: 16px;
                   border-radius: 50%; background: #ff3b30; border: none; color: white;
                   font-size: 9px; cursor: pointer; display: flex; align-items: center;
                   justify-content: center; font-weight: 800; z-index: 20; }

    .bench-wrap { background: white; border: 1px solid #e0e0e5; border-radius: 16px; padding: 14px 16px; }
    .bench-title { font-size: 13px; font-weight: 700; color: #6e6e73; margin-bottom: 10px; }
    .bench-slots { display: flex; gap: 8px; flex-wrap: wrap; }
    .bench-slot { width: 72px; display: flex; flex-direction: column; align-items: center; gap: 4px;
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

    .bank { background: white; border: 1px solid #e0e0e5; border-radius: 20px; padding: 16px; display: flex; flex-direction: column; }
    .bank-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .bank-title { font-size: 14px; font-weight: 700; color: #1d1d1f; }
    .bank-count { font-size: 11px; color: #aeaeb2; background: #f5f5f7; padding: 2px 8px; border-radius: 20px; }
    .pos-filter { display: flex; gap: 5px; margin-bottom: 12px; flex-wrap: wrap; }
    .pos-btn { padding: 4px 10px; border-radius: 20px; border: 1px solid #e0e0e5;
               font-size: 11px; font-weight: 600; background: white; color: #6e6e73; cursor: pointer; }
    .pos-btn.active { background: #1d1d1f; color: white; border-color: #1d1d1f; }
    .drag-hint { font-size: 11px; color: #aeaeb2; margin-bottom: 8px; text-align: center; }
    .bank-list { display: flex; flex-direction: column; gap: 6px; max-height: 480px; overflow-y: auto; }
    .bank-list::-webkit-scrollbar { width: 3px; }
    .bank-list::-webkit-scrollbar-thumb { background: #e0e0e5; border-radius: 3px; }

    .player-card { display: flex; align-items: center; gap: 8px; padding: 8px 10px;
                   border-radius: 10px; border: 1.5px solid #e0e0e5; background: #fafafa;
                   cursor: grab; transition: all .15s; user-select: none; }
    .player-card:active { cursor: grabbing; opacity: .7; }
    .player-card:hover  { border-color: #1d1d1f; background: white; }
    .player-card.owned  { opacity: .35; cursor: not-allowed; }
    .player-card.picking { border-color: #007aff; background: #f0f6ff; }
    .player-emoji { font-size: 20px; min-width: 28px; text-align: center; }
    .player-info  { flex: 1; min-width: 0; }
    .player-name  { font-size: 12px; font-weight: 700; color: #1d1d1f;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .player-meta  { font-size: 10px; color: #6e6e73; }
    .player-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .player-rating { font-size: 12px; font-weight: 800; color: #1d1d1f; }
    .player-price  { font-size: 10px; color: #6e6e73; }
    .pos-badge { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 20px;
                 background: #e8f0fe; color: #0D6EFD; }

    .picking-hint { background: #007aff; color: white; border-radius: 8px;
                    padding: 8px 12px; font-size: 12px; font-weight: 600;
                    margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
    .cancel-btn { background: rgba(255,255,255,.25); border: none; color: white;
                  border-radius: 5px; padding: 3px 8px; cursor: pointer; font-size: 11px; }
    .error-banner { background: #fff2f2; border: 1px solid #ffb3b3; border-radius: 8px;
                    padding: 8px 12px; font-size: 12px; color: #c62828; margin-bottom: 14px; }
    .empty { text-align: center; padding: 30px 16px; color: #aeaeb2; font-size: 13px; }

    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
             padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600;
             z-index: 999; box-shadow: 0 6px 24px rgba(0,0,0,.2); }
    .toast.success { background: #1d1d1f; color: white; }
    .toast.error   { background: #ff3b30; color: white; }

    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4);
                       display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .confirm-box { background: white; border-radius: 16px; padding: 28px 32px;
                   max-width: 360px; width: 90%; text-align: center; }
    .confirm-box h3 { font-size: 18px; font-weight: 800; color: #1d1d1f; margin-bottom: 8px; }
    .confirm-box p  { font-size: 14px; color: #6e6e73; margin-bottom: 24px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-cancel  { border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f;
                       padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .confirm-delete  { border: none; background: #ff3b30; color: white;
                       padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }

    .view-panel { background: white; border: 1px solid #e0e0e5; border-radius: 20px; padding: 24px; }
    .view-sport-nav { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
    .view-sport-btn { padding: 8px 16px; border-radius: 10px; border: 1.5px solid #e0e0e5;
                      background: white; font-size: 13px; font-weight: 600; color: #6e6e73; cursor: pointer; transition: all .15s; }
    .view-sport-btn.active   { background: #1d1d1f; color: white; border-color: #1d1d1f; }
    .view-sport-btn.has-team { border-color: #34c759; color: #1d1d1f; }
    .view-sport-btn.has-team.active { background: #1d1d1f; color: white; }
    .view-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .view-header h2 { font-size: 22px; font-weight: 800; color: #1d1d1f; flex: 1; }
    .edit-btn { border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f;
                padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .del-btn  { border: 1.5px solid #ff3b30; background: white; color: #ff3b30;
                padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .view-section-title { font-size: 11px; font-weight: 700; color: #aeaeb2;
                          text-transform: uppercase; letter-spacing: .06em; margin: 16px 0 8px; }
    .player-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f5; }
    .player-row:last-child { border-bottom: none; }
    .player-row .av   { font-size: 20px; width: 32px; text-align: center; }
    .player-row .inf  { flex: 1; }
    .player-row .pname { font-size: 13px; font-weight: 700; color: #1d1d1f; }
    .player-row .pmeta { font-size: 11px; color: #6e6e73; }
    .player-row .rat  { font-size: 13px; font-weight: 800; color: #1d1d1f; }
    .bench-row { opacity: .55; }
    .empty-sport { text-align: center; padding: 48px 24px; }
    .empty-sport .big-icon { font-size: 48px; margin-bottom: 12px; }
    .empty-sport p { font-size: 14px; color: #aeaeb2; margin-bottom: 16px; }
    .build-btn { background: #1d1d1f; color: white; border: none; padding: 11px 22px;
                 border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
  `],
  template: `
<div class="page">

  <!-- ═══ CONFIRM DELETE MODAL ═══ -->
  <div class="confirm-overlay" *ngIf="showConfirm">
    <div class="confirm-box">
      <h3>Delete team?</h3>
      <p>Your <strong>{{ viewSport }}</strong> team "<strong>{{ savedTeams[viewSport]?.teamName || 'My Team' }}</strong>" will be permanently deleted.</p>
      <div class="confirm-actions">
        <button class="confirm-cancel" (click)="showConfirm=false">Cancel</button>
        <button class="confirm-delete" (click)="confirmDelete()">🗑 Delete</button>
      </div>
    </div>
  </div>

  <!-- ═══ VIEW MODE ═══ -->
  <ng-container *ngIf="viewMode==='view'">
    <div class="view-panel">

      <div class="view-sport-nav">
        <button *ngFor="let s of allSports"
                class="view-sport-btn"
                [class.active]="viewSport===s.key"
                [class.has-team]="!!savedTeams[s.key] && viewSport!==s.key"
                (click)="switchViewSport(s.key)">
          {{ s.label }}
          <span *ngIf="savedTeams[s.key]" style="margin-left:4px;font-size:10px;color:#34c759;">●</span>
        </button>
      </div>

      <!-- No team -->
      <ng-container *ngIf="!savedTeams[viewSport]">
        <div class="empty-sport">
          <div class="big-icon">{{ viewSport==='FOOTBALL' ? '⚽' : viewSport==='BASKETBALL' ? '🏀' : '🎾' }}</div>
          <p>No team built for {{ viewSport }} yet</p>
          <button class="build-btn" (click)="goToBuild(viewSport)">Build this team →</button>
        </div>
      </ng-container>

      <!-- Team exists -->
      <ng-container *ngIf="savedTeams[viewSport] as t">
        <div class="view-header">
          <h2>{{ t.teamName || 'My Team' }}</h2>
          <span style="background:#e8f0fe;color:#0D6EFD;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700;">
            {{ viewSport }}
          </span>
          <button class="edit-btn" (click)="goToBuild(viewSport)">✏️ Edit</button>
          <button class="del-btn"  (click)="showConfirm=true">🗑 Delete</button>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px;">
          <div style="background:#f5f5f7;border-radius:10px;padding:10px 14px;">
            <div style="font-size:9px;font-weight:700;color:#aeaeb2;text-transform:uppercase;">Spent</div>
            <div style="font-size:18px;font-weight:800;color:#1d1d1f;">💰 {{ t.spent }}</div>
          </div>
          <div style="background:#f5f5f7;border-radius:10px;padding:10px 14px;">
            <div style="font-size:9px;font-weight:700;color:#aeaeb2;text-transform:uppercase;">Remaining</div>
            <div style="font-size:18px;font-weight:800;" [style.color]="t.remaining < 0 ? '#ff3b30' : '#34c759'">💰 {{ t.remaining }}</div>
          </div>
          <div style="background:#f5f5f7;border-radius:10px;padding:10px 14px;">
            <div style="font-size:9px;font-weight:700;color:#aeaeb2;text-transform:uppercase;">Squad</div>
            <div style="font-size:18px;font-weight:800;color:#1d1d1f;">{{ t.players.length }} players</div>
          </div>
        </div>

        <div class="view-section-title">Starters</div>
        <div *ngFor="let p of t.starters" class="player-row">
          <span class="av">{{ p.avatar }}</span>
          <div class="inf">
            <div class="pname">{{ p.name }}</div>
            <div class="pmeta">{{ p.team }} · {{ p.label }}</div>
          </div>
          <span class="rat">⭐ {{ p.rating }}</span>
        </div>

        <ng-container *ngIf="t.bench.length > 0">
          <div class="view-section-title">Bench</div>
          <div *ngFor="let p of t.bench" class="player-row bench-row">
            <span class="av">{{ p.avatar }}</span>
            <div class="inf">
              <div class="pname">{{ p.name }}</div>
              <div class="pmeta">{{ p.team }} · {{ p.label }}</div>
            </div>
            <span class="rat">⭐ {{ p.rating }}</span>
          </div>
        </ng-container>
      </ng-container>

    </div>
  </ng-container>

  <!-- ═══ BUILD MODE ═══ -->
  <ng-container *ngIf="viewMode==='build'">

    <div class="header">
      <h1>Fantasy Builder 🎮</h1>
      <input class="team-name-input" [(ngModel)]="teamName"
             placeholder="Name your team… ex: 1ère Ligue Fantasy" maxlength="40"/>
    </div>

    <div class="sport-tabs">
      <button class="sport-tab" [class.active]="selectedSport==='FOOTBALL'"   (click)="setSport('FOOTBALL')">⚽ Football</button>
      <button class="sport-tab" [class.active]="selectedSport==='BASKETBALL'" (click)="setSport('BASKETBALL')">🏀 Basketball</button>
      <button class="sport-tab" [class.active]="selectedSport==='TENNIS'"     (click)="setSport('TENNIS')">🎾 Tennis</button>
    </div>

    <div class="budget-bar">
      <div class="budget-item">
        <span class="budget-label">Budget</span>
        <span class="budget-value">💰 {{ totalBudget }}</span>
      </div>
      <div class="budget-sep"></div>
      <div class="budget-item">
        <span class="budget-label">Spent</span>
        <span class="budget-value" [class.warn]="spent > totalBudget">{{ spent }}</span>
      </div>
      <div class="budget-sep"></div>
      <div class="budget-item">
        <span class="budget-label">Remaining</span>
        <span class="budget-value" [class.warn]="remaining < 0">{{ remaining }}</span>
      </div>
      <div class="budget-sep"></div>
      <div class="budget-item">
        <span class="budget-label">Starters</span>
        <span class="budget-value">{{ filledSlots }} / {{ slots.length }}</span>
      </div>
      <div class="btn-group">
        <button class="view-btn" *ngIf="hasAnySavedTeam" (click)="viewMode='view'">👁 My teams</button>
        <button class="save-btn"
                [class.idle]="saveState==='idle'" [class.loading]="saveState==='loading'"
                [class.success]="saveState==='success'" [class.error]="saveState==='error'"
                [disabled]="filledSlots < slots.length || saveState==='loading'"
                (click)="saveTeam()">
          <span *ngIf="saveState==='idle'">{{ isUpdateMode ? '✏️ Update team' : '✓ Create team' }}</span>
          <span *ngIf="saveState==='loading'">{{ isUpdateMode ? 'Updating…' : 'Creating…' }}</span>
          <span *ngIf="saveState==='success'">{{ isUpdateMode ? 'Updated! ✅' : 'Created! ✅' }}</span>
          <span *ngIf="saveState==='error'">Retry ↻</span>
        </button>
      </div>
    </div>

    <div *ngIf="apiError" class="error-banner">⚠️ {{ apiError }}</div>

    <div class="main-grid">
      <div class="left-col">

        <div class="pitch-wrap">
          <div class="pitch-title">
            {{ selectedSport==='FOOTBALL' ? '⚽ 4-3-3' : selectedSport==='BASKETBALL' ? '🏀 Starting Five' : '🎾 Singles' }}
            <span style="font-size:11px;font-weight:400;color:#aeaeb2;margin-left:6px;">
              Drag from bank · or click slot → click player
            </span>
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
              <rect x="22" y="3" width="56" height="20" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
              <rect x="35" y="3" width="30" height="10" fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".6"/>
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
                 [class.filled]="!!slot.player"
                 [class.drag-over]="dragOverSlotId===slot.id"
                 [style.left.%]="slot.x" [style.top.%]="slot.y"
                 (click)="onSlotClick(slot)"
                 (dragover)="onSlotDragOver($event, slot)"
                 (dragleave)="dragOverSlotId=null"
                 (drop)="onSlotDrop($event, slot)">
              <div class="slot-circle">
                <span *ngIf="slot.player" style="font-size:20px">{{ slot.player.avatar }}</span>
                <span *ngIf="!slot.player">{{ slot.label }}</span>
              </div>
              <span *ngIf="slot.player"  class="slot-name">{{ slot.player.name.split(' ')[1] || slot.player.name }}</span>
              <span *ngIf="!slot.player" class="slot-pos">{{ slot.position }}</span>
              <button *ngIf="slot.player" class="slot-remove" (click)="removePlayer(slot, $event)">×</button>
            </div>
          </ng-template>
        </div>

        <div class="bench-wrap" *ngIf="benchSlots.length > 0">
          <div class="bench-title">🪑 Bench <span style="font-size:11px;font-weight:400;color:#aeaeb2;">(optional)</span></div>
          <div class="bench-slots">
            <div *ngFor="let slot of benchSlots" class="bench-slot"
                 [class.filled]="!!slot.player"
                 [class.drag-over]="dragOverSlotId===slot.id"
                 (click)="onSlotClick(slot)"
                 (dragover)="onSlotDragOver($event, slot)"
                 (dragleave)="dragOverSlotId=null"
                 (drop)="onSlotDrop($event, slot)">
              <span class="bench-avatar">{{ slot.player ? slot.player.avatar : '🪑' }}</span>
              <span *ngIf="slot.player"  class="bench-name">{{ slot.player.name.split(' ')[0] }}</span>
              <span *ngIf="!slot.player" class="bench-label">{{ slot.label }}</span>
              <button *ngIf="slot.player" class="bench-remove" (click)="removePlayer(slot, $event)">×</button>
            </div>
          </div>
        </div>

      </div>

      <div class="bank">
        <div class="bank-header">
          <span class="bank-title">Player Bank</span>
          <span class="bank-count">{{ filteredBank.length }}</span>
        </div>
        <div *ngIf="pickingSlot" class="picking-hint">
          Pick {{ pickingSlot.isBench ? 'bench ' : '' }}{{ pickingSlot.position }} → {{ pickingSlot.label }}
          <button class="cancel-btn" (click)="cancelPick()">Cancel</button>
        </div>
        <div class="pos-filter">
          <button class="pos-btn" [class.active]="posFilter==='ALL'" (click)="posFilter='ALL'">All</button>
          <button *ngFor="let pos of positions" class="pos-btn"
                  [class.active]="posFilter===pos" (click)="posFilter=pos">{{ pos }}</button>
        </div>
        <p class="drag-hint">drag onto pitch or bench · click to select</p>
        <div class="bank-list">
          <div *ngFor="let p of filteredBank" class="player-card"
               [class.owned]="isOwned(p)"
               [class.picking]="pickingSlot && pickingSlot.position===p.position && !isOwned(p)"
               draggable="true"
               (dragstart)="onDragStart($event, p)"
               (dragend)="onDragEnd()"
               (click)="selectPlayer(p)">
            <span class="player-emoji">{{ p.avatar }}</span>
            <div class="player-info">
              <div class="player-name">{{ p.name }}</div>
              <div class="player-meta">{{ p.team }}</div>
            </div>
            <div class="player-right">
              <span class="pos-badge">{{ p.position }}</span>
              <span class="player-rating">{{ p.rating }}</span>
              <span class="player-price">💰{{ p.price }}</span>
            </div>
          </div>
          <div *ngIf="filteredBank.length===0" class="empty">No players found</div>
        </div>
      </div>
    </div>

  </ng-container>

  <div *ngIf="toastMsg" class="toast" [class.success]="toastType==='success'" [class.error]="toastType==='error'">
    {{ toastMsg }}
  </div>

</div>
  `
})
export class FrontofficeFantasyComponent implements OnInit {

  selectedSport: Sport = 'FOOTBALL';
  viewSport: Sport     = 'FOOTBALL';
  slots: Slot[]        = footballSlots();
  benchSlots: Slot[]   = footballBench();
  pickingSlot: Slot | null = null;
  posFilter   = 'ALL';
  totalBudget = 100;
  teamName    = '';
  viewMode: ViewMode = 'build';
  showConfirm = false;

  saveState: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  apiError: string | null = null;
  toastMsg  = '';
  toastType: 'success' | 'error' = 'success';

  existingTeamId: number | null = null;
  isUpdateMode = false;

  private draggedPlayer: Player | null = null;
  dragOverSlotId: number | null = null;

  private readonly currentUserId = 1;

  savedTeams: Partial<Record<Sport, {
    teamName: string; spent: number; remaining: number;
    players: Player[];
    starters: Array<Player & { label: string }>;
    bench:    Array<Player & { label: string }>;
    dbId: number | null;
  }>> = {};

  allSports: Array<{ key: Sport; label: string }> = [
    { key: 'FOOTBALL',   label: '⚽ Football'   },
    { key: 'BASKETBALL', label: '🏀 Basketball' },
    { key: 'TENNIS',     label: '🎾 Tennis'     },
  ];

  private config: Record<Sport, { players: Player[]; positions: string[] }> = {
    FOOTBALL:   { players: FOOTBALL_PLAYERS,   positions: ['GK','DEF','MID','FWD'] },
    BASKETBALL: { players: BASKETBALL_PLAYERS, positions: ['PG','SG','SF','PF','C'] },
    TENNIS:     { players: TENNIS_PLAYERS,     positions: ['P1'] },
  };

  constructor(private teamService: VirtualTeamService) {}

  ngOnInit(): void { this.loadAllMyTeams(); }

  get bank():            Player[]  { return this.config[this.selectedSport].players; }
  get positions():       string[]  { return this.config[this.selectedSport].positions; }
  get filledSlots():     number    { return this.slots.filter(s => !!s.player).length; }
  get spent():           number    { return [...this.slots, ...this.benchSlots].reduce((s, sl) => s + (sl.player?.price ?? 0), 0); }
  get remaining():       number    { return this.totalBudget - this.spent; }
  get hasAnySavedTeam(): boolean   { return Object.keys(this.savedTeams).length > 0; }
  get filteredBank():    Player[]  { return this.posFilter === 'ALL' ? this.bank : this.bank.filter(p => p.position === this.posFilter); }

  isOwned(p: Player): boolean {
    return [...this.slots, ...this.benchSlots].some(s => s.player?.id === p.id);
  }

  // ── Load ALL teams from API on init ───────────────────────────────────────
  loadAllMyTeams(): void {
    this.teamService.getTeamsByUser(this.currentUserId).subscribe({
      next: (teams) => {
        for (const t of teams) {
          const sport = t.sportType as Sport;
          const allPlayers = this.config[sport].players;

          // Match playerIds from DB to local player objects
          const players: Player[] = (t.playerIds ?? [])
            .map((id: number) => allPlayers.find(p => p.id === id))
            .filter((p): p is Player => !!p);

          // Fill slots in order by position
          const freshSlots = sport === 'FOOTBALL'   ? footballSlots()
                           : sport === 'BASKETBALL' ? basketballSlots()
                           :                          tennisSlots();

          const freshBench = sport === 'FOOTBALL'   ? footballBench()
                           : sport === 'BASKETBALL' ? basketballBench()
                           :                          [];

          const usedIds = new Set<number>();

          for (const slot of freshSlots) {
            const match = players.find(p => p.position === slot.position && !usedIds.has(p.id));
            if (match) { slot.player = match; usedIds.add(match.id); }
          }
          for (const slot of freshBench) {
            const match = players.find(p => p.position === slot.position && !usedIds.has(p.id));
            if (match) { slot.player = match; usedIds.add(match.id); }
          }

          const starters = freshSlots
            .filter(s => !!s.player)
            .map(s => ({ ...s.player!, label: s.label }));

          const bench = freshBench
            .filter(s => !!s.player)
            .map(s => ({ ...s.player!, label: s.label }));

          const spent = players.reduce((acc, p) => acc + p.price, 0);

          this.savedTeams[sport] = {
            teamName: t.name ?? '',
            spent,
            remaining: this.totalBudget - spent,
            players,
            starters,
            bench,
            dbId: t.id,
          };

          if (sport === this.selectedSport) {
            this.existingTeamId = t.id;
            this.isUpdateMode   = true;
          }
        }

        // Auto go to view mode if at least one team exists
        if (Object.keys(this.savedTeams).length > 0) {
          const first = this.allSports.find(s => !!this.savedTeams[s.key]);
          if (first) {
            this.viewSport = first.key;
            this.viewMode  = 'view';
          }
        }
      },
      error: () => {}
    });
  }

  // ── Sport switch (build) ──────────────────────────────────────────────────
  setSport(sport: Sport): void {
    this.selectedSport = sport;
    this.posFilter     = 'ALL';
    this.pickingSlot   = null;
    this.apiError      = null;
    this.teamName      = '';
    this.slots      = sport === 'FOOTBALL' ? footballSlots() : sport === 'BASKETBALL' ? basketballSlots() : tennisSlots();
    this.benchSlots = sport === 'FOOTBALL' ? footballBench() : sport === 'BASKETBALL' ? basketballBench() : [];
    const existing = this.savedTeams[sport];
    this.existingTeamId = existing?.dbId ?? null;
    this.isUpdateMode   = !!existing;
  }

  // ── Sport switch (view) ───────────────────────────────────────────────────
  switchViewSport(sport: Sport): void { this.viewSport = sport; }

  // ── Go to build — pre-fill if team exists ────────────────────────────────
  goToBuild(sport: Sport): void {
    this.selectedSport = sport;
    this.posFilter     = 'ALL';
    this.pickingSlot   = null;
    this.viewMode      = 'build';

    const saved = this.savedTeams[sport];

    if (saved) {
      this.teamName       = saved.teamName;
      this.existingTeamId = saved.dbId;
      this.isUpdateMode   = true;

      const freshSlots = sport === 'FOOTBALL'   ? footballSlots()
                       : sport === 'BASKETBALL' ? basketballSlots()
                       :                          tennisSlots();

      for (const slot of freshSlots) {
        const match = saved.starters.find(sp => sp.label === slot.label);
        if (match) {
          const full = this.config[sport].players.find(p => p.id === match.id);
          if (full) slot.player = full;
        }
      }
      this.slots = freshSlots;

      const freshBench = sport === 'FOOTBALL'   ? footballBench()
                       : sport === 'BASKETBALL' ? basketballBench()
                       :                          [];

      for (const slot of freshBench) {
        const match = saved.bench.find(sp => sp.label === slot.label);
        if (match) {
          const full = this.config[sport].players.find(p => p.id === match.id);
          if (full) slot.player = full;
        }
      }
      this.benchSlots = freshBench;

    } else {
      this.teamName       = '';
      this.existingTeamId = null;
      this.isUpdateMode   = false;
      this.slots      = sport === 'FOOTBALL'   ? footballSlots()
                      : sport === 'BASKETBALL' ? basketballSlots() : tennisSlots();
      this.benchSlots = sport === 'FOOTBALL'   ? footballBench()
                      : sport === 'BASKETBALL' ? basketballBench() : [];
    }
  }

  private snapshotTeam(sport: Sport, dbId: number | null): void {
    const starters = this.slots
      .filter(s => !!s.player)
      .map(s => ({ ...s.player!, label: s.label }));

    const bench = this.benchSlots
      .filter(s => !!s.player)
      .map(s => ({ ...s.player!, label: s.label }));

    const players = [...starters, ...bench];
    const spent   = players.reduce((acc, p) => acc + p.price, 0);

    this.savedTeams[sport] = {
      teamName: this.teamName,
      spent,
      remaining: this.totalBudget - spent,
      players,
      starters,
      bench,
      dbId,
    };
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  confirmDelete(): void {
    this.showConfirm = false;
    const t = this.savedTeams[this.viewSport];
    if (!t?.dbId) {
      delete this.savedTeams[this.viewSport];
      this.showToast('🗑 Team deleted', 'success');
      return;
    }
    this.teamService.deleteTeam(t.dbId).subscribe({
      next: () => {
        delete this.savedTeams[this.viewSport];
        this.showToast('🗑 Team deleted', 'success');
        const next = this.allSports.find(s => s.key !== this.viewSport && !!this.savedTeams[s.key]);
        if (next) this.viewSport = next.key;
      },
      error: () => this.showToast('❌ Could not delete team', 'error')
    });
  }

  // ── Slot interactions ─────────────────────────────────────────────────────
  onSlotClick(slot: Slot): void {
    if (slot.player) return;
    this.pickingSlot = slot;
    this.posFilter   = slot.position;
  }

  cancelPick(): void { this.pickingSlot = null; this.posFilter = 'ALL'; }

  selectPlayer(p: Player): void {
    if (this.isOwned(p) || !this.pickingSlot) return;
    if (this.pickingSlot.position !== p.position) return;
    this.pickingSlot.player = p;
    this.pickingSlot = null;
    this.posFilter   = 'ALL';
  }

  removePlayer(slot: Slot, event: Event): void {
    event.stopPropagation();
    slot.player = null;
  }

  // ── Drag & drop ───────────────────────────────────────────────────────────
  onDragStart(event: DragEvent, player: Player): void {
    if (this.isOwned(player)) { event.preventDefault(); return; }
    this.draggedPlayer = player;
    event.dataTransfer?.setData('playerId', String(player.id));
  }

  onDragEnd(): void { this.draggedPlayer = null; this.dragOverSlotId = null; }

  onSlotDragOver(event: DragEvent, slot: Slot): void {
    event.preventDefault();
    if (this.draggedPlayer?.position === slot.position) this.dragOverSlotId = slot.id;
  }

  onSlotDrop(event: DragEvent, slot: Slot): void {
    event.preventDefault();
    this.dragOverSlotId = null;
    if (!this.draggedPlayer || this.draggedPlayer.position !== slot.position || this.isOwned(this.draggedPlayer)) return;
    slot.player = this.draggedPlayer;
    this.draggedPlayer = null;
    this.pickingSlot   = null;
  }

  onPitchDrop(event: DragEvent): void { event.preventDefault(); }

  // ── Save ──────────────────────────────────────────────────────────────────
  saveTeam(): void {
    this.saveState = 'loading';
    this.apiError  = null;

    const allIds = [...this.slots, ...this.benchSlots]
      .filter(s => !!s.player).map(s => s.player!.id);

    const dto = {
      sportType:    this.selectedSport as SportType,
       name:         this.teamName,
      userId:       this.currentUserId,
      playerIds:    allIds,
      earnedPoints: 0,
      weekPoints:   0,
    };

    const call$ = this.isUpdateMode && this.existingTeamId
      ? this.teamService.updateTeam(this.existingTeamId, dto)
      : this.teamService.createTeam(dto);

    call$.subscribe({
      next: (res) => {
        this.existingTeamId = res.id;
        this.isUpdateMode   = true;
        this.saveState      = 'success';
        this.snapshotTeam(this.selectedSport, res.id);
        this.viewSport = this.selectedSport;
        this.showToast(`✅ "${this.teamName || 'Team'}" saved!`, 'success');
        setTimeout(() => { this.saveState = 'idle'; this.viewMode = 'view'; }, 1500);
      },
      error: (err: { error?: { message?: string } }) => {
        this.saveState = 'error';
        this.apiError  = err?.error?.message ?? 'Server error — please try again.';
        this.showToast('❌ Failed', 'error');
        setTimeout(() => this.saveState = 'idle', 3000);
      }
    });
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toastMsg  = msg;
    this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}