import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HealthService, MedicalRecord, Injury } from '../../../core/services/health.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'fo-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent implements OnInit {

  // ── State ─────────────────────────────────────────────────
  record: MedicalRecord | null = null;
  injuries: Injury[] = [];
  saving  = false;
  error   = '';
  success = '';

  showCreateRecord = false;
  editingRecord    = false;
  showInjuryForm   = false;
  severityFilter   = 'ALL';

  // ── Form errors ───────────────────────────────────────────
  formErrors: { [key: string]: string } = {};
  injuryErrors: { [key: string]: string } = {};

  bloodTypes = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  form: MedicalRecord = {
    weight: 0, height: 0, bloodType: 'A+',
    chronicDiseases: '', allergies: '', lastCheckup: ''
  };

  injuryForm: Partial<Injury> = { report: '', date: '', severity: 'MINOR' };

  notifications = [
    { message: '👨‍⚕️ Dr. Ahmed added a recommendation to your knee injury', time: '2 hours ago', type: 'blue', unread: true },
    { message: '🏋️ Coach Karim left a fitness note for you', time: 'Yesterday', type: 'orange', unread: false },
    { message: '📋 Your medical record was reviewed', time: '3 days ago', type: 'green', unread: false },
  ];

  healthTips = [
    { icon: '💧', text: 'Drink at least 2L of water daily, especially on training days.' },
    { icon: '😴', text: 'Aim for 7–9 hours of sleep for optimal muscle recovery.' },
    { icon: '🥗', text: 'Maintain a balanced diet rich in protein and complex carbs.' },
    { icon: '🧘', text: 'Include stretching after every training session.' },
    { icon: '🩺', text: 'Schedule a checkup at least once every 6 months.' },
  ];

  // ── Health Pro state ──────────────────────────────────────
  allProInjuries: Injury[] = [];
  allProRecords: MedicalRecord[] = [];
  proActiveTab = 'ALL';
  mainTab = 'INJURIES';
  editingRecoId: number | null = null;
  recoText = '';
  recoError = '';

  proTabs = [
    { key: 'ALL',      label: '📋 All Cases',  count: 0 },
    { key: 'PENDING',  label: '⏳ Pending',    count: 0 },
    { key: 'REVIEWED', label: '✓ Reviewed',    count: 0 },
    { key: 'SEVERE',   label: '🔴 Severe',     count: 0 },
  ];

  proStats = { pending: 0, reviewed: 0, severe: 0, players: 0 };

  constructor(
    private healthService: HealthService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // ── Role helpers ──────────────────────────────────────────
  isPlayer():    boolean { return this.authService.hasRole('PLAYER'); }
  isHealthPro(): boolean { return this.authService.hasRole('HEALTH_PROFESSIONAL'); }

  // ── Init ──────────────────────────────────────────────────
  ngOnInit() {
    if (this.isHealthPro()) {
      this.loadAllInjuriesForPro();
      this.loadAllRecordsForPro();
    }

    if (this.isPlayer()) {
      const profileId = this.authService.getProfileId();
      if (profileId) {
        this.healthService.getRecordByPlayer(profileId).subscribe({
          next: (r: MedicalRecord) => {
            this.record = r;
            this.cdr.detectChanges();
            if (r.id) this.loadInjuries(r.id);
          },
          error: (err: any) => {
            if (err.status === 404 || err.status === 403) {
              this.record = null;
              this.showCreateRecord = true;
              this.injuries = [];
              this.error = '';
            } else {
              this.error = 'Error loading medical record';
            }
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  // ── Form validation ───────────────────────────────────────
  validateForm(): boolean {
    this.formErrors = {};

    if (!this.form.weight || this.form.weight <= 0) {
      this.formErrors['weight'] = 'Weight is required and must be positive';
    } else if (this.form.weight < 20 || this.form.weight > 300) {
      this.formErrors['weight'] = 'Weight must be between 20 and 300 kg';
    }

    if (!this.form.height || this.form.height <= 0) {
      this.formErrors['height'] = 'Height is required and must be positive';
    } else if (this.form.height < 0.5 || this.form.height > 2.5) {
      this.formErrors['height'] = 'Height must be between 0.50 and 2.50 m';
    }

    if (!this.form.bloodType) {
      this.formErrors['bloodType'] = 'Blood type is required';
    }

    if (!this.form.lastCheckup) {
      this.formErrors['lastCheckup'] = 'Last checkup date is required';
    } else {
      const checkupDate = new Date(this.form.lastCheckup);
      const today = new Date();
      if (checkupDate > today) {
        this.formErrors['lastCheckup'] = 'Last checkup cannot be in the future';
      }
    }

    return Object.keys(this.formErrors).length === 0;
  }

  validateInjuryForm(): boolean {
    this.injuryErrors = {};

    if (!this.injuryForm.report || this.injuryForm.report.trim().length < 10) {
      this.injuryErrors['report'] = 'Please describe the injury in at least 10 characters';
    }

    if (!this.injuryForm.date) {
      this.injuryErrors['date'] = 'Injury date is required';
    } else {
      const injDate = new Date(this.injuryForm.date);
      const today = new Date();
      if (injDate > today) {
        this.injuryErrors['date'] = 'Injury date cannot be in the future';
      }
    }

    if (!this.injuryForm.severity) {
      this.injuryErrors['severity'] = 'Severity is required';
    }

    return Object.keys(this.injuryErrors).length === 0;
  }

  validateReco(): boolean {
    this.recoError = '';
    if (!this.recoText || this.recoText.trim().length < 10) {
      this.recoError = 'Recommendation must be at least 10 characters';
      return false;
    }
    return true;
  }

  // ── Health Pro methods ────────────────────────────────────
  loadAllInjuriesForPro() {
    this.healthService.getAllInjuries().subscribe({
      next: (injuries: Injury[]) => {
        this.allProInjuries = injuries;
        this.updateProStats();
        this.updateProTabs();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load injury cases'; this.cdr.detectChanges(); }
    });
  }

  loadAllRecordsForPro() {
    this.healthService.getAllRecords().subscribe({
      next: (records: MedicalRecord[]) => { this.allProRecords = records; this.cdr.detectChanges(); },
      error: () => { this.allProRecords = []; this.cdr.detectChanges(); }
    });
  }

  calcBmi(rec: MedicalRecord): string {
    if (!rec.height || rec.height === 0) return '—';
    return (rec.weight / (rec.height ** 2)).toFixed(1);
  }

  updateProStats() {
    const inj = this.allProInjuries;
    this.proStats = {
      pending:  inj.filter(i => !i.recommendation).length,
      reviewed: inj.filter(i => !!i.recommendation).length,
      severe:   inj.filter(i => i.severity === 'SEVERE').length,
      players:  new Set(inj.map(i => i.medicalRecordId)).size
    };
  }

  updateProTabs() {
    const inj = this.allProInjuries;
    this.proTabs = [
      { key: 'ALL',      label: '📋 All Cases',  count: inj.length },
      { key: 'PENDING',  label: '⏳ Pending',    count: inj.filter(i => !i.recommendation).length },
      { key: 'REVIEWED', label: '✓ Reviewed',    count: inj.filter(i => !!i.recommendation).length },
      { key: 'SEVERE',   label: '🔴 Severe',     count: inj.filter(i => i.severity === 'SEVERE').length },
    ];
  }

  get filteredProInjuries(): Injury[] {
    switch (this.proActiveTab) {
      case 'PENDING':  return this.allProInjuries.filter(i => !i.recommendation);
      case 'REVIEWED': return this.allProInjuries.filter(i => !!i.recommendation);
      case 'SEVERE':   return this.allProInjuries.filter(i => i.severity === 'SEVERE');
      default:         return this.allProInjuries;
    }
  }

  startEditReco(inj: Injury) {
    this.editingRecoId = inj.id!;
    this.recoText = inj.recommendation ?? '';
    this.recoError = '';
  }
  cancelReco() { this.editingRecoId = null; this.recoText = ''; this.recoError = ''; }

  submitReco(inj: Injury) {
    if (!this.validateReco()) return;
    this.saving = true;
    this.clearMessages();
    this.healthService.addRecommendation(inj.id!, this.recoText).subscribe({
      next: (updated: Injury) => {
        const idx = this.allProInjuries.findIndex(i => i.id === inj.id);
        if (idx !== -1) this.allProInjuries[idx] = updated;
        this.updateProStats();
        this.updateProTabs();
        this.success = 'Recommendation submitted!';
        this.saving = false;
        this.cancelReco();
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to submit recommendation'; this.saving = false; this.cdr.detectChanges(); }
    });
  }

  // ── Player computed ───────────────────────────────────────
  get bmi(): string {
    if (!this.record?.height) return '—';
    return (this.record.weight / (this.record.height ** 2)).toFixed(1);
  }

  get bmiLabel(): string {
    const v = parseFloat(this.bmi);
    if (isNaN(v)) return '';
    if (v < 18.5) return 'Underweight';
    if (v < 25)   return 'Normal';
    if (v < 30)   return 'Overweight';
    return 'Obese';
  }

  get bmiColor(): string {
    const v = parseFloat(this.bmi);
    if (isNaN(v)) return '';
    if (v < 18.5) return 'bmi-under';
    if (v < 25)   return 'bmi-normal';
    if (v < 30)   return 'bmi-over';
    return 'bmi-obese';
  }

  get bodyStats() {
    if (!this.record) return [];
    return [
      { label: 'Weight', pct: Math.min(100, (this.record.weight / 120) * 100), color: 'black'  },
      { label: 'Height', pct: Math.min(100, (this.record.height / 2.2)  * 100), color: 'gray'  },
      { label: 'BMI',    pct: Math.min(100, (parseFloat(this.bmi) / 35)  * 100), color: 'light' },
    ];
  }

  get pendingReco(): number  { return this.injuries.filter(i => !i.recommendation).length; }
  get newRecos(): number     { return this.injuries.filter(i => !!i.recommendation).length; }
  get recoCount(): number    { return this.injuriesWithReco.length; }
  get injuriesWithReco()     { return this.injuries.filter(i => !!i.recommendation); }

  get injuryInsights() {
    const total = this.injuries.length || 1;
    const c: { [key: string]: number } = { MINOR: 0, MODERATE: 0, SEVERE: 0 };
    this.injuries.forEach(i => c[i.severity]++);
    return [
      { label: 'Minor',    count: c['MINOR'],    pct: (c['MINOR']    / total) * 100, color: 'black'  },
      { label: 'Moderate', count: c['MODERATE'], pct: (c['MODERATE'] / total) * 100, color: 'gray'   },
      { label: 'Severe',   count: c['SEVERE'],   pct: (c['SEVERE']   / total) * 100, color: 'light'  },
    ];
  }

  // ── Player actions ────────────────────────────────────────
  openCreate() {
    this.form = { weight: 0, height: 0, bloodType: 'A+', chronicDiseases: '', allergies: '', lastCheckup: '' };
    this.formErrors = {};
    this.showCreateRecord = true;
  }

  startEdit() {
    this.form = { ...this.record! };
    this.formErrors = {};
    this.editingRecord = true;
  }

  saveRecord() {
    if (!this.validateForm()) return;

    this.saving = true;
    this.clearMessages();
    const profileId = this.authService.getProfileId();
    const formWithProfile: MedicalRecord = { ...this.form, playerProfileId: profileId ?? undefined };
    const call = this.record
      ? this.healthService.updateRecord(this.record.id!, formWithProfile)
      : this.healthService.createRecord(formWithProfile);

    call.subscribe({
      next: (r: MedicalRecord) => {
        this.record = r;
        this.saving = false;
        this.editingRecord = false;
        this.showCreateRecord = false;
        this.formErrors = {};
        this.success = 'Medical record saved!';
        this.cdr.detectChanges();
        this.loadInjuries(r.id);
      },
      error: () => { this.error = 'Failed to save record'; this.saving = false; this.cdr.detectChanges(); }
    });
  }

  loadInjuries(id?: number) {
    const rid = id ?? this.record?.id;
    if (!rid) return;
    const obs = this.severityFilter === 'ALL'
      ? this.healthService.getInjuriesByRecord(rid)
      : this.healthService.filterBySeverity(rid, this.severityFilter);
    obs.subscribe({
      next: (i: Injury[]) => { this.injuries = i; this.cdr.detectChanges(); },
      error: () => { this.injuries = []; this.cdr.detectChanges(); }
    });
  }

  applyFilter(s: string) { this.severityFilter = s; this.loadInjuries(); }

  declareInjury() {
    if (!this.validateInjuryForm()) return;
    if (!this.record) return;
    this.saving = true;
    this.clearMessages();
    const dto: Injury = {
      report: this.injuryForm.report!,
      date: this.injuryForm.date!,
      severity: this.injuryForm.severity as any,
      medicalRecordId: this.record.id!
    };
    this.healthService.declareInjury(dto).subscribe({
      next: () => {
        this.success = 'Injury reported!';
        this.saving = false;
        this.showInjuryForm = false;
        this.injuryForm = { report: '', date: '', severity: 'MINOR' };
        this.injuryErrors = {};
        this.cdr.detectChanges();
        this.loadInjuries();
      },
      error: () => { this.error = 'Failed to submit injury'; this.saving = false; this.cdr.detectChanges(); }
    });
  }

  deleteInjury(id: number) {
    this.healthService.deleteInjury(id).subscribe({
      next: () => { this.success = 'Injury deleted'; this.cdr.detectChanges(); this.loadInjuries(); },
      error: () => { this.error = 'Failed to delete injury'; this.cdr.detectChanges(); }
    });
  }

  cancelForm() {
    this.showCreateRecord = false;
    this.editingRecord = false;
    this.formErrors = {};
    if (this.record) this.form = { ...this.record };
  }

  sevIcon(s: string): string {
    return s === 'SEVERE' ? '🔴' : s === 'MODERATE' ? '🟠' : '🟢';
  }

  clearMessages() { this.error = ''; this.success = ''; }
}