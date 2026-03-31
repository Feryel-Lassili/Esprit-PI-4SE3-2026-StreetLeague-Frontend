import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../venue/services/venue.service';
import { VenueDTO, ReservationDTO } from '../venue/models/venue.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'fo-venues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .page { padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .page-header { margin-bottom: 24px; }
    .page-title { font-size: 22px; font-weight: 700; color: #1d1d1f; }
    .page-sub { font-size: 13px; color: #6e6e73; margin-top: 4px; }
    /* Tabs */
    .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid #e0e0e5; }
    .tab { padding: 10px 18px; font-size: 13px; font-weight: 500; color: #6e6e73; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all .15s; }
    .tab.active { color: #000; border-bottom-color: #000; font-weight: 700; }
    /* Browse */
    .toolbar { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input { border: 1px solid #e0e0e5; border-radius: 8px; padding: 8px 12px; font-size: 13px; width: 220px; outline: none; }
    .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .pill { padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #e0e0e5; background: #fff; cursor: pointer; color: #1d1d1f; transition: all .15s; }
    .pill.active { background: #000; color: #fff; border-color: #000; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
    .card { background: #fff; border-radius: 14px; border: 1px solid #e0e0e5; overflow: hidden; transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 6px 20px rgba(0,0,0,.1); }
    .card-img { height: 160px; background: #f5f5f7; display: flex; align-items: center; justify-content: center; font-size: 48px; overflow: hidden; }
    .card-img img { width: 100%; height: 100%; object-fit: cover; }
    .card-body { padding: 14px; }
    .card-name { font-size: 15px; font-weight: 700; color: #1d1d1f; margin-bottom: 4px; }
    .card-addr { font-size: 12px; color: #6e6e73; margin-bottom: 8px; }
    .card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
    .badge { padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-sport { background: #e8f0fe; color: #185fa5; }
    .badge-price { background: #f1f8e9; color: #2e7d32; }
    .badge-cap { background: #f3e5f5; color: #6a1b9a; }
    .badge-unverified { background: #fff3e0; color: #e65100; }
    .btn-book { width: 100%; background: #000; color: #fff; border: none; border-radius: 8px; padding: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity .15s; }
    .btn-book:hover { opacity: .85; }
    .btn-book:disabled { opacity: .4; cursor: not-allowed; }
    .empty { text-align: center; padding: 60px; color: #aeaeb2; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    /* My reservations table */
    .table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e0e0e5; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: .04em; padding: 10px 14px; border-bottom: 1px solid #e0e0e5; }
    td { padding: 12px 14px; font-size: 13px; color: #1d1d1f; border-bottom: 1px solid #f5f5f7; }
    tr:last-child td { border-bottom: none; }
    .status-pill { padding: 3px 9px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .PENDING   { background: #fffde7; color: #f57f17; }
    .CONFIRMED { background: #f1f8e9; color: #2e7d32; }
    .CANCELLED { background: #fff2f2; color: #c62828; }
    .COMPLETED { background: #e8f0fe; color: #185fa5; }
    .btn-sm { background: none; border: 1px solid #e0e0e5; border-radius: 6px; padding: 3px 10px; font-size: 12px; cursor: pointer; color: #c62828; }
    .btn-sm:hover { background: #fff2f2; }
    .btn-pay { background: #185fa5; color: #fff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 12px; cursor: pointer; font-weight: 600; }
    .btn-pay:hover { opacity: .85; }
    /* Book modal */
    .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; }
    .modal-wide { background: #fff; border-radius: 16px; width: 580px; max-width: 100%; max-height: 92vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
    .modal-title { font-size: 16px; font-weight: 700; color: #1d1d1f; }
    .modal-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #6e6e73; line-height: 1; padding: 2px 6px; border-radius: 6px; }
    .modal-close:hover { background: #f5f5f7; }
    /* Calendar */
    .cal-section { padding: 16px 24px; }
    .cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .cal-month-label { font-size: 15px; font-weight: 700; color: #1d1d1f; }
    .cal-arrow { background: none; border: 1px solid #e0e0e5; border-radius: 6px; padding: 4px 12px; font-size: 18px; cursor: pointer; color: #1d1d1f; line-height: 1; }
    .cal-arrow:hover { background: #f5f5f7; }
    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
    .cal-day-header { text-align: center; font-size: 11px; font-weight: 700; color: #aeaeb2; padding: 4px 0 8px; }
    .cal-day { text-align: center; padding: 8px 2px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; min-height: 36px; display: flex; align-items: center; justify-content: center; }
    .cal-day.empty { cursor: default; }
    .cal-day.past { color: #d0d0d5; cursor: not-allowed; background: none !important; }
    .cal-day.available { color: #2e7d32; background: #f1f8e9; }
    .cal-day.available:hover { background: #c8e6c9; }
    .cal-day.partial { color: #e65100; background: #fff3e0; }
    .cal-day.partial:hover { background: #ffe0b2; }
    .cal-day.full { color: #c62828; background: #fff2f2; cursor: not-allowed; }
    .cal-day.selected { background: #000 !important; color: #fff !important; }
    .cal-legend { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .leg { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
    .leg.available { background: #f1f8e9; color: #2e7d32; }
    .leg.partial   { background: #fff3e0; color: #e65100; }
    .leg.full      { background: #fff2f2; color: #c62828; }
    /* Time slots */
    .slots-section { padding: 0 24px 16px; border-top: 1px solid #f0f0f5; }
    .slots-title { font-size: 13px; font-weight: 700; color: #1d1d1f; margin: 14px 0 10px; }
    .dur-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
    .dur-label { font-size: 12px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: .04em; }
    .dur-btns { display: flex; gap: 6px; }
    .dur-btn { padding: 5px 14px; border: 1px solid #e0e0e5; border-radius: 8px; font-size: 13px; cursor: pointer; background: #fff; color: #1d1d1f; transition: all .15s; }
    .dur-btn.active { background: #000; color: #fff; border-color: #000; }
    .slots-grid { display: flex; flex-wrap: wrap; gap: 6px; }
    .slot { padding: 7px 13px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; transition: all .15s; }
    .slot.avail { background: #f1f8e9; color: #2e7d32; border-color: #a5d6a7; }
    .slot.avail:hover { background: #c8e6c9; }
    .slot.avail.sel { background: #000; color: #fff; border-color: #000; }
    .slot.booked { background: #f5f5f7; color: #c0c0c5; border-color: #e0e0e5; cursor: not-allowed; text-decoration: line-through; }
    /* Summary */
    .book-summary { margin: 0 24px 16px; padding: 14px; background: #f5f5f7; border-radius: 10px; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #1d1d1f; margin-bottom: 4px; }
    .summary-total { font-size: 18px; font-weight: 700; }
    /* Modal actions */
    .error-msg { color: #c62828; font-size: 12px; margin: 0 24px 10px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding: 0 24px 20px; }
    .btn-cancel { background: none; border: 1px solid #e0e0e5; border-radius: 8px; padding: 9px 18px; font-size: 13px; cursor: pointer; color: #1d1d1f; }
    .btn-confirm { background: #000; color: #fff; border: none; border-radius: 8px; padding: 9px 20px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-confirm:hover { opacity: .85; }
    .btn-confirm:disabled { opacity: .4; cursor: not-allowed; }
    /* Pay modal */
    .pay-modal { background: #fff; border-radius: 16px; padding: 28px; width: 400px; max-width: 95vw; }
    .pay-modal-title { font-size: 16px; font-weight: 700; color: #1d1d1f; margin-bottom: 16px; }
    .pay-amount-box { background: #f5f5f7; border-radius: 10px; padding: 14px; margin-bottom: 18px; }
    .pay-venue { font-size: 12px; color: #6e6e73; margin-bottom: 4px; }
    .pay-amount { font-size: 22px; font-weight: 700; color: #1d1d1f; }
    .form-row { margin-bottom: 14px; }
    .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
    .form-label { font-size: 11px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: .04em; display: block; margin-bottom: 5px; }
    .form-input { width: 100%; border: 1px solid #e0e0e5; border-radius: 8px; padding: 9px 12px; font-size: 13px; outline: none; }
    .form-input:focus { border-color: #000; }
    .pay-success { text-align: center; padding: 12px 0 4px; }
    .pay-success-icon { font-size: 56px; margin-bottom: 12px; }
    .pay-success-msg { font-size: 15px; font-weight: 700; color: #2e7d32; margin-bottom: 6px; }
    .pay-success-sub { font-size: 13px; color: #6e6e73; }
    /* Toast */
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 10px; color: #fff; font-size: 13px; font-weight: 600; z-index: 9999; box-shadow: 0 4px 16px rgba(0,0,0,.2); }
  `],
  template: `
    <div class="page">

      <div class="page-header">
        <div class="page-title">Venues</div>
        <div class="page-sub">Book a sports venue near you</div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <div class="tab" [class.active]="tab==='browse'" (click)="tab='browse'">Browse Venues</div>
        <div class="tab" [class.active]="tab==='my'" (click)="tab='my'; loadMyReservations()">My Reservations</div>
      </div>

      <!-- BROWSE TAB -->
      <ng-container *ngIf="tab==='browse'">
        <div class="toolbar">
          <input class="search-input" type="text" placeholder="Search venues..." [(ngModel)]="searchQ" (input)="applyFilter()"/>
          <div class="filter-pills">
            <span class="pill" [class.active]="sportFilter==='ALL'"        (click)="sportFilter='ALL';        applyFilter()">All</span>
            <span class="pill" [class.active]="sportFilter==='FOOTBALL'"   (click)="sportFilter='FOOTBALL';   applyFilter()">⚽ Football</span>
            <span class="pill" [class.active]="sportFilter==='BASKETBALL'" (click)="sportFilter='BASKETBALL'; applyFilter()">🏀 Basketball</span>
            <span class="pill" [class.active]="sportFilter==='TENNIS'"     (click)="sportFilter='TENNIS';     applyFilter()">🎾 Tennis</span>
            <span class="pill" [class.active]="sportFilter==='VOLLEYBALL'" (click)="sportFilter='VOLLEYBALL'; applyFilter()">🏐 Volleyball</span>
            <span class="pill" [class.active]="sportFilter==='HANDBALL'"   (click)="sportFilter='HANDBALL';   applyFilter()">🤾 Handball</span>
          </div>
        </div>

        <div *ngIf="loading" style="text-align:center;padding:40px;color:#6e6e73;">Loading venues…</div>

        <div class="grid" *ngIf="!loading">
          <div class="card" *ngFor="let v of filtered">
            <div class="card-img">
              <img *ngIf="v.photoUrl" [src]="backendBase + v.photoUrl" [alt]="v.name"
                   (error)="$any($event.target).style.display='none'"/>
              <span *ngIf="!v.photoUrl">{{ sportEmoji(v.sportType) }}</span>
            </div>
            <div class="card-body">
              <div class="card-name">{{ v.name }}</div>
              <div class="card-addr">📍 {{ v.address }}</div>
              <div class="card-meta">
                <span class="badge badge-sport">{{ v.sportType }}</span>
                <span class="badge badge-price">{{ v.pricePerHour }} TND/h</span>
                <span class="badge badge-cap">👥 {{ v.capacity }}</span>
                <span class="badge badge-unverified" *ngIf="!v.verified">⏳ Not verified</span>
              </div>
              <button class="btn-book" (click)="openBook(v)" [disabled]="!v.available">
                {{ v.available ? 'Book now' : 'Unavailable' }}
              </button>
            </div>
          </div>
          <div class="empty" *ngIf="filtered.length === 0">
            <div class="empty-icon">🏟️</div>
            <div>No venues found</div>
            <div style="font-size:12px;margin-top:4px;">Try a different sport or search term</div>
          </div>
        </div>
      </ng-container>

      <!-- MY RESERVATIONS TAB -->
      <ng-container *ngIf="tab==='my'">
        <div *ngIf="resLoading" style="text-align:center;padding:40px;color:#6e6e73;">Loading…</div>
        <div class="table-wrap" *ngIf="!resLoading">
          <table>
            <thead>
              <tr>
                <th>Venue</th><th>Date</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of myReservations">
                <td>
                  <div style="font-weight:600;">{{ r.venueName }}</div>
                  <div style="font-size:11px;color:#6e6e73;">{{ r.venueAddress }}</div>
                </td>
                <td>{{ r.date | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>{{ r.duration }}h</td>
                <td style="font-weight:600;">{{ r.price | number:'1.2-2' }} TND</td>
                <td><span class="status-pill" [class]="r.status">{{ r.status }}</span></td>
                <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                  <button class="btn-sm" *ngIf="r.status==='PENDING'" (click)="cancelRes(r)">✕ Cancel</button>
                  <button class="btn-pay" *ngIf="r.status==='CONFIRMED'" (click)="openPay(r)">💳 Pay</button>
                </td>
              </tr>
              <tr *ngIf="myReservations.length === 0">
                <td colspan="6" style="text-align:center;color:#aeaeb2;padding:32px;">No reservations yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

    </div>

    <!-- ══════════════════ BOOK MODAL WITH CALENDAR ══════════════════ -->
    <div class="modal-bg" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-wide" (click)="$event.stopPropagation()">

        <div class="modal-header">
          <div class="modal-title">📅 Book — {{ bookingVenue?.name }}</div>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>

        <!-- Calendar -->
        <div class="cal-section">
          <div class="cal-nav">
            <button class="cal-arrow" (click)="prevMonth()">‹</button>
            <span class="cal-month-label">{{ monthNames[calMonth] }} {{ calYear }}</span>
            <button class="cal-arrow" (click)="nextMonth()">›</button>
          </div>
          <div class="cal-grid">
            <div class="cal-day-header" *ngFor="let h of dayHeaders">{{ h }}</div>
            <ng-container *ngFor="let day of calDays">
              <div class="cal-day"
                [class.empty]="!day"
                [class.past]="day && dayStatus(day)==='past'"
                [class.available]="day && dayStatus(day)==='available'"
                [class.partial]="day && dayStatus(day)==='partial'"
                [class.full]="day && dayStatus(day)==='full'"
                [class.selected]="day && isSameDay(day, selectedDay)"
                (click)="day && dayStatus(day)!=='past' && dayStatus(day)!=='full' ? selectDay(day) : null">
                {{ day ? day.getDate() : '' }}
              </div>
            </ng-container>
          </div>
          <div class="cal-legend">
            <span class="leg available">● Available</span>
            <span class="leg partial">● Partially booked</span>
            <span class="leg full">● Fully booked</span>
          </div>
        </div>

        <!-- Time slots (shown after day is selected) -->
        <div class="slots-section" *ngIf="selectedDay">
          <div class="slots-title">{{ selectedDay | date:'EEEE, MMMM d' }} — Choose a time slot</div>

          <div class="dur-row">
            <span class="dur-label">Duration:</span>
            <div class="dur-btns">
              <button *ngFor="let d of [1,2,3,4,5,6]" class="dur-btn" [class.active]="bookDuration===d"
                (click)="bookDuration=d; selectedHour=null">{{ d }}h</button>
            </div>
          </div>

          <div *ngIf="venueResLoading" style="color:#6e6e73;font-size:13px;padding:4px 0 8px;">
            Loading availability…
          </div>
          <div class="slots-grid" *ngIf="!venueResLoading">
            <div class="slot"
              *ngFor="let s of timeSlots"
              [class.avail]="s.available"
              [class.booked]="!s.available"
              [class.sel]="selectedHour === s.hour && s.available"
              (click)="s.available ? selectHour(s.hour) : null">
              {{ s.label }}
            </div>
          </div>
        </div>

        <!-- Summary (shown after slot selected) -->
        <div class="book-summary" *ngIf="selectedDay && selectedHour !== null">
          <div class="summary-row">
            <span>📅 {{ selectedDay | date:'dd/MM/yyyy' }} at {{ selectedHour }}:00</span>
            <span>{{ bookDuration }}h</span>
          </div>
          <div class="summary-row">
            <span>Price per hour</span>
            <span>{{ bookingVenue?.pricePerHour }} TND</span>
          </div>
          <div class="summary-row" style="margin-top:8px;padding-top:8px;border-top:1px solid #e0e0e5;">
            <span style="font-weight:700;">Total</span>
            <span class="summary-total">{{ (bookingVenue?.pricePerHour || 0) * bookDuration | number:'1.2-2' }} TND</span>
          </div>
        </div>

        <div class="error-msg" *ngIf="bookError">⚠️ {{ bookError }}</div>

        <div class="modal-actions">
          <button class="btn-cancel" (click)="closeModal()">Cancel</button>
          <button class="btn-confirm"
            [disabled]="!selectedDay || selectedHour === null || bookLoading"
            (click)="confirmBook()">
            {{ bookLoading ? 'Booking…' : 'Confirm Booking' }}
          </button>
        </div>

      </div>
    </div>

    <!-- ══════════════════ PAY MODAL ══════════════════ -->
    <div class="modal-bg" *ngIf="showPayModal" (click)="showPayModal=false">
      <div class="pay-modal" (click)="$event.stopPropagation()">

        <!-- Payment form -->
        <ng-container *ngIf="!payDone">
          <div class="pay-modal-title">💳 Secure Payment</div>
          <div class="pay-amount-box">
            <div class="pay-venue">{{ payingReservation?.venueName }} · {{ payingReservation?.date | date:'dd/MM/yyyy HH:mm' }}</div>
            <div class="pay-amount">{{ payingReservation?.price | number:'1.2-2' }} TND</div>
          </div>
          <div class="form-row">
            <label class="form-label">Card number</label>
            <input class="form-input" type="text" placeholder="1234 5678 9012 3456"
              [(ngModel)]="payCard" maxlength="19" (input)="formatCardNumber()"/>
          </div>
          <div class="form-row-2">
            <div>
              <label class="form-label">Expiry</label>
              <input class="form-input" type="text" placeholder="MM/YY" [(ngModel)]="payExpiry" maxlength="5"/>
            </div>
            <div>
              <label class="form-label">CVV</label>
              <input class="form-input" type="text" placeholder="123" [(ngModel)]="payCvv" maxlength="3"/>
            </div>
          </div>
          <div class="modal-actions" style="padding:0;margin-top:8px;">
            <button class="btn-cancel" (click)="showPayModal=false">Cancel</button>
            <button class="btn-confirm"
              [disabled]="payCard.length < 19 || payExpiry.length < 5 || payCvv.length < 3 || payLoading"
              (click)="confirmPay()">
              {{ payLoading ? 'Processing…' : '🔒 Pay Now' }}
            </button>
          </div>
        </ng-container>

        <!-- Success -->
        <div class="pay-success" *ngIf="payDone">
          <div class="pay-success-icon">✅</div>
          <div class="pay-success-msg">Payment Successful!</div>
          <div class="pay-success-sub">Your booking is confirmed. See you on the field!</div>
          <div style="margin-top:20px;">
            <button class="btn-confirm" (click)="showPayModal=false; payDone=false;">Close</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Toast -->
    <div class="toast" *ngIf="toastVisible" [style.background]="toastColor">{{ toastMsg }}</div>
  `
})
export class FrontofficeVenuesComponent implements OnInit {

  tab = 'browse';
  backendBase = 'http://localhost:8089/SpringSecurity';

  // Browse
  allVenues: VenueDTO[] = [];
  filtered: VenueDTO[] = [];
  loading = false;
  searchQ = '';
  sportFilter = 'ALL';

  // Calendar
  calYear  = new Date().getFullYear();
  calMonth = new Date().getMonth();
  dayHeaders  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  monthNames  = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'];
  selectedDay:  Date | null = null;
  selectedHour: number | null = null;

  // Venue existing reservations (for conflict check)
  venueReservations: ReservationDTO[] = [];
  venueResLoading = false;

  // Book modal
  showModal    = false;
  bookingVenue: VenueDTO | null = null;
  bookDuration = 2;
  bookLoading  = false;
  bookError    = '';

  // My reservations
  myReservations: ReservationDTO[] = [];
  resLoading = false;

  // Pay modal
  showPayModal:     boolean = false;
  payingReservation: ReservationDTO | null = null;
  payCard    = '';
  payExpiry  = '';
  payCvv     = '';
  payLoading = false;
  payDone    = false;

  // Toast
  toastVisible = false;
  toastMsg     = '';
  toastColor   = '#16a34a';

  constructor(private venueService: VenueService, private authService: AuthService) {}

  ngOnInit(): void { this.loadVenues(); }

  loadVenues(): void {
    this.loading = true;
    this.venueService.getAllVenues().subscribe({
      next: data => { this.allVenues = data; this.applyFilter(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilter(): void {
    const q = this.searchQ.toLowerCase();
    this.filtered = this.allVenues.filter(v =>
      (this.sportFilter === 'ALL' || v.sportType === this.sportFilter) &&
      v.name.toLowerCase().includes(q)
    );
  }

  // ── Calendar ──────────────────────────────────────────────────────────────────

  get calDays(): (Date | null)[] {
    const first = new Date(this.calYear, this.calMonth, 1);
    const last  = new Date(this.calYear, this.calMonth + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(this.calYear, this.calMonth, d));
    return days;
  }

  prevMonth(): void {
    if (this.calMonth === 0) { this.calMonth = 11; this.calYear--; }
    else this.calMonth--;
    this.selectedDay = null; this.selectedHour = null;
  }

  nextMonth(): void {
    if (this.calMonth === 11) { this.calMonth = 0; this.calYear++; }
    else this.calMonth++;
    this.selectedDay = null; this.selectedHour = null;
  }

  dayStatus(day: Date): 'past' | 'available' | 'partial' | 'full' {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (day < today) return 'past';
    const dayStr = day.toDateString();
    const dayRes = this.venueReservations.filter(r =>
      r.status !== 'CANCELLED' && new Date(r.date).toDateString() === dayStr
    );
    if (!dayRes.length) return 'available';
    const booked = dayRes.reduce((s, r) => s + (r.duration || 0), 0);
    return booked >= 15 ? 'full' : 'partial';
  }

  isSameDay(a: Date, b: Date | null): boolean {
    return !!b && a.toDateString() === b.toDateString();
  }

  selectDay(day: Date): void {
    this.selectedDay  = day;
    this.selectedHour = null;
    this.bookError    = '';
  }

  // ── Time slots ────────────────────────────────────────────────────────────────

  get timeSlots(): { hour: number; label: string; available: boolean }[] {
    if (!this.selectedDay) return [];
    const slots = [];
    for (let h = 7; h <= 21; h++) {
      const endH = h + this.bookDuration;
      if (endH > 22) break;
      const slotStart = new Date(this.selectedDay); slotStart.setHours(h, 0, 0, 0);
      const slotEnd   = new Date(this.selectedDay); slotEnd.setHours(endH, 0, 0, 0);
      const conflict  = this.venueReservations.some(r => {
        if (r.status === 'CANCELLED') return false;
        const rStart = new Date(r.date);
        const rEnd   = new Date(rStart.getTime() + (r.duration || 0) * 3_600_000);
        return slotStart < rEnd && rStart < slotEnd;
      });
      slots.push({ hour: h, label: `${h}:00 – ${endH}:00`, available: !conflict });
    }
    return slots;
  }

  selectHour(hour: number): void {
    this.selectedHour = hour;
    this.bookError    = '';
  }

  // ── Open / close booking modal ────────────────────────────────────────────────

  openBook(v: VenueDTO): void {
    this.bookingVenue     = v;
    this.showModal        = true;
    this.selectedDay      = null;
    this.selectedHour     = null;
    this.bookDuration     = 2;
    this.bookError        = '';
    this.venueReservations = [];
    const now = new Date();
    this.calYear  = now.getFullYear();
    this.calMonth = now.getMonth();
    this.venueResLoading = true;
    this.venueService.getVenueReservations(v.id).subscribe({
      next: data => { this.venueReservations = data; this.venueResLoading = false; },
      error: ()   => { this.venueResLoading = false; }
    });
  }

  closeModal(): void {
    this.showModal         = false;
    this.bookingVenue      = null;
    this.venueReservations = [];
  }

  // ── Confirm booking ───────────────────────────────────────────────────────────

  confirmBook(): void {
    if (!this.bookingVenue || !this.selectedDay || this.selectedHour === null) return;
    const d = new Date(this.selectedDay);
    d.setHours(this.selectedHour, 0, 0, 0);
    const isoDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:00:00`;
    this.bookLoading = true;
    this.bookError   = '';
    this.venueService.book(this.bookingVenue.id, isoDate, this.bookDuration).subscribe({
      next: () => {
        this.bookLoading = false;
        this.closeModal();
        this.showToast('✅ Booking confirmed! Check My Reservations.', '#16a34a');
      },
      error: err => {
        this.bookLoading = false;
        this.bookError = err?.error?.message || 'Booking failed. Try another slot.';
      }
    });
  }

  // ── My reservations ───────────────────────────────────────────────────────────

  loadMyReservations(): void {
    this.resLoading = true;
    this.venueService.getMyReservations().subscribe({
      next: data => { this.myReservations = data; this.resLoading = false; },
      error: ()   => { this.resLoading = false; }
    });
  }

  cancelRes(r: ReservationDTO): void {
    if (!confirm('Cancel this reservation?')) return;
    this.venueService.cancelMyReservation(r.id).subscribe({
      next: () => { r.status = 'CANCELLED'; this.showToast('Reservation cancelled', '#6b7280'); },
      error: ()  => this.showToast('Failed to cancel', '#c62828')
    });
  }

  // ── Pay (static) ──────────────────────────────────────────────────────────────

  openPay(r: ReservationDTO): void {
    this.payingReservation = r;
    this.payCard = ''; this.payExpiry = ''; this.payCvv = '';
    this.payDone = false; this.payLoading = false;
    this.showPayModal = true;
  }

  confirmPay(): void {
    this.payLoading = true;
    setTimeout(() => { this.payLoading = false; this.payDone = true; }, 1500);
  }

  formatCardNumber(): void {
    this.payCard = this.payCard.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────────

  sportEmoji(s?: string): string {
    const m: Record<string, string> = { FOOTBALL:'⚽', BASKETBALL:'🏀', TENNIS:'🎾', VOLLEYBALL:'🏐', HANDBALL:'🤾' };
    return m[s||''] || '🏟️';
  }

  showToast(msg: string, color: string): void {
    this.toastMsg = msg; this.toastColor = color; this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3500);
  }
}
