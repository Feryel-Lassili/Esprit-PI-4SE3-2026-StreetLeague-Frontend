import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../../core/services/team.service';
import { AuthService } from '../../../core/services/auth.service';

interface Player {
  id?: number;
  fullName?: string;
  username?: string;
  email?: string;
}

interface Team {
  id: number;
  name: string;
  logo?: string;
  type?: string;
  captainId?: number;
  players?: Player[];
}

interface JoinRequest {
  id: number;
  team: Team;
  player: Player;
  type: string;
  status: string;
}

@Component({
  selector: 'fo-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./teams.component.scss'],
  templateUrl: './teams.component.html'
})
export class FrontofficeTeamsComponent implements OnInit {

  allTeams: Team[] = [];
  filteredTeams: Team[] = [];
  selectedTeam: Team | null = null;

  loading = false;
  error = '';
  searchQuery = '';
  currentFilter = 'ALL';

  // ── Current user ───────────────────────────────────────────────────────────
  currentUserId: number | null = null;

  // ── Create / Edit modal ────────────────────────────────────────────────────
  showModal = false;
  editingTeam: Team | null = null;
  modalLoading = false;
  modalError = '';
  form = { name: '', type: '', logo: '' };
  formTouched = false;
  logoPreview = '';
  isDragOver = false;

  // ── Delete confirm ─────────────────────────────────────────────────────────
  showDeleteConfirm = false;
  teamToDelete: Team | null = null;

  // ── Pending requests modal (captain view) ──────────────────────────────────
  showRequestsModal = false;
  pendingRequests: JoinRequest[] = [];
  requestsLoading = false;

  // ── Invite player modal (captain) ──────────────────────────────────────────
  showInviteModal = false;
  allPlayers: Player[] = [];
  inviteSearch = '';
  inviteLoading = false;

  // ── Transfer captain modal (captain) ──────────────────────────────────────
  showTransferModal = false;
  transferTargetId: number | null = null;

  // ── View filter (ALL | MY_TEAMS | CAPTAIN) ────────────────────────────────
  viewFilter = 'ALL';

  // ── Notifications modal (invitations + captain requests) ──────────────────
  showInvitationsModal = false;
  myInvitations: JoinRequest[] = [];
  allCaptainRequests: JoinRequest[] = [];   // join requests across ALL captain teams
  invitationsCount = 0;
  captainRequestsCount = 0;
  notifLoading = false;

  get notificationCount(): number { return this.invitationsCount + this.captainRequestsCount; }

  getRequestsCountForTeam(teamId: number): number {
    return this.allCaptainRequests.filter(r => r.team.id === teamId).length;
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  toastVisible = false;
  toastMessage = '';
  toastColor = '#16a34a';
  private toastTimer: any;

  readonly avatarColors = ['#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#009688', '#ff5722'];

  private readonly sportConfig: Record<string, any> = {
    FOOTBALL:   { emoji: '⚽', color: '#16a34a', bg: 'linear-gradient(135deg,#dcfce7,#bbf7d0)',   badgeBg: 'rgba(22,163,74,.12)' },
    BASKETBALL: { emoji: '🏀', color: '#ea580c', bg: 'linear-gradient(135deg,#ffedd5,#fed7aa)',   badgeBg: 'rgba(234,88,12,.12)' },
    TENNIS:     { emoji: '🎾', color: '#ca8a04', bg: 'linear-gradient(135deg,#fef9c3,#fef08a)',   badgeBg: 'rgba(202,138,4,.12)' },
    VOLLEYBALL: { emoji: '🏐', color: '#0284c7', bg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)',   badgeBg: 'rgba(2,132,199,.12)' },
    HANDBALL:   { emoji: '🤾', color: '#dc2626', bg: 'linear-gradient(135deg,#fee2e2,#fecaca)',   badgeBg: 'rgba(220,38,38,.12)' },
  };

  get totalPlayers(): number {
    return this.allTeams.reduce((s, t) => s + (t.players?.length || 0), 0);
  }

  get filteredInvitablePlayers(): Player[] {
    const q = this.inviteSearch.toLowerCase();
    const memberIds = new Set((this.selectedTeam?.players || []).map(p => p.id));
    return this.allPlayers.filter(p =>
      p.id !== this.currentUserId &&
      !memberIds.has(p.id) &&
      (p.fullName?.toLowerCase().includes(q) || p.email?.toLowerCase().includes(q))
    );
  }

  constructor(
    public teamService: TeamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = (user as any)?.id ?? null;
    this.loadAllTeams();
    if (this.currentUserId) {
      this.loadMyInvitations();
    }
  }

  loadCaptainRequestsCount(): void {
    if (!this.currentUserId) return;
    const captainTeams = this.allTeams.filter(t => this.isCaptain(t));
    if (!captainTeams.length) { this.captainRequestsCount = 0; return; }
    let total = 0;
    let done = 0;
    captainTeams.forEach(team => {
      this.teamService.getPendingRequests(team.id).subscribe({
        next: reqs => {
          total += reqs.length;
          done++;
          if (done === captainTeams.length) this.captainRequestsCount = total;
        },
        error: () => { done++; if (done === captainTeams.length) this.captainRequestsCount = total; }
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  isCaptain(team: Team): boolean {
    return !!this.currentUserId && team.captainId === this.currentUserId;
  }

  isMember(team: Team): boolean {
    return !!this.currentUserId && !!(team.players?.some(p => p.id === this.currentUserId));
  }

  getPlayerName(p: Player): string {
    return p.fullName || p.username || p.email || 'Player';
  }

  getInitial(p: Player, i: number): string {
    const name = p.fullName || p.username || '';
    return name[0]?.toUpperCase() || String.fromCharCode(65 + i);
  }

  // ── Load ───────────────────────────────────────────────────────────────────

  loadAllTeams(): void {
    this.loading = true;
    this.error = '';
    this.teamService.getAllTeams().subscribe({
      next: data => {
        this.allTeams = data;
        this.loading = false;
        this.applyFilter();
        this.loadCaptainRequestsCount();
      },
      error: () => { this.error = 'Failed to load teams.'; this.loading = false; }
    });
  }

  loadMyInvitations(): void {
    if (!this.currentUserId) return;
    this.teamService.getMyInvitations(this.currentUserId).subscribe({
      next: data => { this.myInvitations = data; this.invitationsCount = data.length; },
      error: () => {}
    });
  }

  // ── Filter / search ────────────────────────────────────────────────────────

  applyFilter(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredTeams = this.allTeams.filter(t => {
      const matchesSport = this.currentFilter === 'ALL' || t.type === this.currentFilter;
      const matchesView = this.viewFilter === 'ALL'
        || (this.viewFilter === 'MY_TEAMS' && this.isMember(t))
        || (this.viewFilter === 'CAPTAIN'  && this.isCaptain(t));
      const matchesSearch = t.name.toLowerCase().includes(q);
      return matchesSport && matchesView && matchesSearch;
    });
  }

  setFilter(sport: string): void { this.currentFilter = sport; this.applyFilter(); }
  setViewFilter(view: string): void { this.viewFilter = view; this.applyFilter(); }

  // ── Detail ─────────────────────────────────────────────────────────────────

  openDetail(team: Team): void {
    this.selectedTeam = team;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeDetail(): void { this.selectedTeam = null; }

  // ── Create / Edit ──────────────────────────────────────────────────────────

  openCreateModal(): void {
    this.editingTeam = null;
    this.form = { name: '', type: '', logo: '' };
    this.formTouched = false;
    this.logoPreview = '';
    this.modalError = '';
    this.showModal = true;
  }

  openEditModal(team: Team, event?: Event): void {
    event?.stopPropagation();
    this.editingTeam = team;
    this.form = { name: team.name, type: team.type || '', logo: team.logo || '' };
    this.formTouched = false;
    this.logoPreview = team.logo || '';
    this.modalError = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingTeam = null;
    this.formTouched = false;
    this.logoPreview = '';
    this.modalError = '';
  }

  onLogoFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.logoPreview = result;
      this.form.logo = result;
    };
    reader.readAsDataURL(file);
  }

  onLogoDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.logoPreview = result;
        this.form.logo = result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveTeam(): void {
    this.formTouched = true;
    if (!this.form.name.trim())              { this.modalError = 'Team name is required.'; return; }
    if (this.form.name.trim().length < 2)    { this.modalError = 'Name must be at least 2 characters.'; return; }
    if (this.form.name.trim().length > 80)   { this.modalError = 'Name cannot exceed 80 characters.'; return; }
    if (!this.form.type)                     { this.modalError = 'Please select a sport.'; return; }
    this.modalLoading = true;
    this.modalError = '';
    const isEditing = !!this.editingTeam;
    const payload: any = { ...this.form };
    if (!isEditing && this.currentUserId) {
      payload.captainId = this.currentUserId;
    }
    const obs = isEditing
      ? this.teamService.updateTeam(this.editingTeam!.id, payload)
      : this.teamService.createTeam(payload);
    obs.subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeModal();
        this.loadAllTeams();
        this.showToast(isEditing ? '✅ Team updated!' : '✅ Team created!');
      },
      error: err => {
        this.modalError = err?.error?.message || err?.message || 'Operation failed.';
        this.modalLoading = false;
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  confirmDelete(team: Team, event?: Event): void {
    event?.stopPropagation();
    this.teamToDelete = team;
    this.showDeleteConfirm = true;
  }

  deleteTeam(): void {
    if (!this.teamToDelete) return;
    const deletedId = this.teamToDelete.id;
    this.teamService.deleteTeam(deletedId).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.teamToDelete = null;
        if (this.selectedTeam?.id === deletedId) this.closeDetail();
        this.loadAllTeams();
        this.showToast('🗑 Team deleted', '#ef4444');
      },
      error: () => { this.showDeleteConfirm = false; this.showToast('❌ Failed to delete', '#ef4444'); }
    });
  }

  // ── Request to join ────────────────────────────────────────────────────────

  requestJoin(team: Team): void {
    if (!this.currentUserId) return;
    this.teamService.requestJoin(team.id, this.currentUserId).subscribe({
      next: () => this.showToast('📨 Request sent!'),
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── Pending requests (captain) ─────────────────────────────────────────────

  openRequestsModal(team: Team, event?: Event): void {
    event?.stopPropagation();
    this.selectedTeam = team;
    this.requestsLoading = true;
    this.showRequestsModal = true;
    this.teamService.getPendingRequests(team.id).subscribe({
      next: data => { this.pendingRequests = data; this.requestsLoading = false; },
      error: () => { this.requestsLoading = false; }
    });
  }

  acceptRequest(req: JoinRequest): void {
    this.teamService.acceptRequest(req.id).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== req.id);
        this.allCaptainRequests = this.allCaptainRequests.filter(r => r.id !== req.id);
        this.captainRequestsCount = this.allCaptainRequests.length;
        this.loadAllTeams();
        this.showToast('✅ Request accepted!');
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  refuseRequest(req: JoinRequest): void {
    this.teamService.refuseRequest(req.id).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== req.id);
        this.allCaptainRequests = this.allCaptainRequests.filter(r => r.id !== req.id);
        this.captainRequestsCount = this.allCaptainRequests.length;
        this.showToast('Request refused', '#6b7280');
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── Invite player (captain) ────────────────────────────────────────────────

  openInviteModal(team: Team, event?: Event): void {
    event?.stopPropagation();
    this.selectedTeam = team;
    this.inviteSearch = '';
    this.inviteLoading = true;
    this.showInviteModal = true;
    this.teamService.getAllPlayers().subscribe({
      next: data => { this.allPlayers = data; this.inviteLoading = false; },
      error: () => { this.inviteLoading = false; }
    });
  }

  invitePlayer(player: Player): void {
    if (!this.selectedTeam || !player.id) return;
    this.teamService.invitePlayer(this.selectedTeam.id, player.id).subscribe({
      next: () => this.showToast(`📨 Invitation sent to ${this.getPlayerName(player)}!`),
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── Transfer captain ───────────────────────────────────────────────────────

  openTransferModal(team: Team, event?: Event): void {
    event?.stopPropagation();
    this.selectedTeam = team;
    this.transferTargetId = null;
    this.showTransferModal = true;
  }

  confirmTransfer(): void {
    if (!this.selectedTeam || !this.transferTargetId) return;
    this.teamService.transferCaptain(this.selectedTeam.id, this.transferTargetId).subscribe({
      next: () => {
        this.showTransferModal = false;
        this.loadAllTeams();
        this.showToast('👑 Captain transferred!');
        this.closeDetail();
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── Leave team (player himself) ────────────────────────────────────────────

  leaveTeam(team: Team, event?: Event): void {
    event?.stopPropagation();
    if (!this.currentUserId) return;
    if (!confirm(`Leave "${team.name}"?`)) return;
    this.teamService.leaveTeam(team.id, this.currentUserId).subscribe({
      next: () => {
        if (this.selectedTeam?.id === team.id) this.closeDetail();
        this.loadAllTeams();
        this.showToast('👋 You left the team', '#6b7280');
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── Remove player (captain) ────────────────────────────────────────────────

  removePlayer(team: Team, player: Player, event?: Event): void {
    event?.stopPropagation();
    if (!player.id) return;
    this.teamService.removePlayer(team.id, player.id).subscribe({
      next: () => {
        if (this.selectedTeam?.id === team.id) {
          this.selectedTeam = {
            ...this.selectedTeam,
            players: this.selectedTeam!.players?.filter(p => p.id !== player.id)
          };
        }
        this.loadAllTeams();
        this.showToast('Player removed', '#6b7280');
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── My invitations (player) ────────────────────────────────────────────────

  openInvitationsModal(): void {
    this.showInvitationsModal = true;
    this.notifLoading = true;
    if (!this.currentUserId) { this.notifLoading = false; return; }

    // Load invitations sent to me
    this.teamService.getMyInvitations(this.currentUserId).subscribe({
      next: data => { this.myInvitations = data; this.invitationsCount = data.length; this.checkNotifDone(); },
      error: () => this.checkNotifDone()
    });

    // Load pending join requests for all teams I captain
    const captainTeams = this.allTeams.filter(t => this.isCaptain(t));
    if (!captainTeams.length) { this.allCaptainRequests = []; this.captainRequestsCount = 0; this.checkNotifDone(); return; }

    let done = 0;
    const collected: JoinRequest[] = [];
    captainTeams.forEach(team => {
      this.teamService.getPendingRequests(team.id).subscribe({
        next: reqs => {
          collected.push(...reqs);
          done++;
          if (done === captainTeams.length) {
            this.allCaptainRequests = collected;
            this.captainRequestsCount = collected.length;
            this.checkNotifDone();
          }
        },
        error: () => { done++; if (done === captainTeams.length) this.checkNotifDone(); }
      });
    });
  }

  private checkNotifDone(): void {
    // Turn off loading once both fetches have completed
    // We use a simple flag approach: loading off when invitations are set
    this.notifLoading = false;
  }

  acceptInvitation(req: JoinRequest): void {
    this.teamService.acceptRequest(req.id).subscribe({
      next: () => {
        this.myInvitations = this.myInvitations.filter(r => r.id !== req.id);
        this.invitationsCount = this.myInvitations.length;
        this.loadAllTeams();
        this.showToast('✅ Invitation accepted!');
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  refuseInvitation(req: JoinRequest): void {
    this.teamService.refuseRequest(req.id).subscribe({
      next: () => {
        this.myInvitations = this.myInvitations.filter(r => r.id !== req.id);
        this.invitationsCount = this.myInvitations.length;
        this.showToast('Invitation declined', '#6b7280');
      },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#ef4444')
    });
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  showToast(msg: string, color = '#16a34a'): void {
    clearTimeout(this.toastTimer);
    this.toastMessage = msg;
    this.toastColor = color;
    this.toastVisible = true;
    this.toastTimer = setTimeout(() => this.toastVisible = false, 3200);
  }

  // ── Sport helpers ──────────────────────────────────────────────────────────

  getSportEmoji(t?: string): string  { return this.sportConfig[t || '']?.emoji   || '🏆'; }
  getSportColor(t?: string): string  { return this.sportConfig[t || '']?.color   || '#0284c7'; }
  getBannerBg(t?: string):  string   { return this.sportConfig[t || '']?.bg      || 'linear-gradient(135deg,#f1f5f9,#e2e8f0)'; }
  getBadgeBg(t?: string):   string   { return this.sportConfig[t || '']?.badgeBg || 'rgba(2,132,199,.12)'; }
}
