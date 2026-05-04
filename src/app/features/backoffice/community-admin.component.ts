import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface Post {
  id: number;
  content: string;
  authorUsername?: string;
  authorEmail?: string;
  createdAt?: string;
  likesCount?: number;
  commentsCount?: number;
  reported?: boolean;
  // moderation
  flagged?: boolean;
  flagReason?: string;
  username?: string;
  userId?: number;
  creationDate?: string;
}

interface FlaggedComment {
  id: number;
  content: string;
  username: string;
  userId: number;
  postId: number;
  flagReason: string;
  creationDate: string;
  flagged: boolean;
}

@Component({
  selector: 'bo-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cm-page">

      <!-- Header -->
      <div class="cm-header">
        <div class="cm-header-left">
          <div class="cm-icon">💬</div>
          <div>
            <h1 class="cm-title">Community</h1>
            <p class="cm-sub">Manage posts, comments and content moderation</p>
          </div>
        </div>
        <button class="cm-refresh-btn" (click)="load()">
          <span [class.cm-spin]="loading">↻</span> Refresh
        </button>
      </div>

      <!-- KPIs -->
      <div class="cm-kpis">
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#f0f7ff">💬</div>
          <div class="cm-kpi-body">
            <div class="cm-kpi-val">{{ posts.length }}</div>
            <div class="cm-kpi-lbl">Total posts</div>
          </div>
        </div>
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#fff2f2">⚠️</div>
          <div class="cm-kpi-body">
            <div class="cm-kpi-val" style="color:#c62828">{{ flaggedPosts.length }}</div>
            <div class="cm-kpi-lbl">Flagged posts</div>
          </div>
        </div>
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#fff8e1">🚨</div>
          <div class="cm-kpi-body">
            <div class="cm-kpi-val" style="color:#e65100">{{ flaggedComments.length }}</div>
            <div class="cm-kpi-lbl">Flagged comments</div>
          </div>
        </div>
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#f0fff4">👍</div>
          <div class="cm-kpi-body">
            <div class="cm-kpi-val">{{ totalLikes }}</div>
            <div class="cm-kpi-lbl">Total likes</div>
          </div>
        </div>
      </div>

      <!-- ── Tabs ── -->
      <div class="cm-tabs">
        <button class="cm-tab" [class.cm-tab-active]="activeTab==='posts'" (click)="activeTab='posts'">
          All Posts ({{ posts.length }})
        </button>
        <button class="cm-tab" [class.cm-tab-active]="activeTab==='flagged-posts'" (click)="activeTab='flagged-posts'">
          🚩 Flagged Posts
          <span *ngIf="flaggedPosts.length > 0" class="cm-badge-red">{{ flaggedPosts.length }}</span>
        </button>
        <button class="cm-tab" [class.cm-tab-active]="activeTab==='flagged-comments'" (click)="activeTab='flagged-comments'">
          🚩 Flagged Comments
          <span *ngIf="flaggedComments.length > 0" class="cm-badge-red">{{ flaggedComments.length }}</span>
        </button>
      </div>

      <!-- Error / Loading -->
      <div class="cm-error" *ngIf="error">⚠ {{ error }}</div>
      <div class="cm-loading" *ngIf="loading">Loading…</div>

      <!-- ── All Posts Tab ── -->
      <div class="cm-card" *ngIf="!loading && activeTab==='posts'">
        <div class="cm-toolbar">
          <div class="cm-search-wrap">
            <span class="cm-search-icon">🔍</span>
            <input class="cm-search" [(ngModel)]="searchQ" placeholder="Search posts…" />
          </div>
        </div>
        <div class="cm-card-title">All posts ({{ filtered.length }})</div>
        <div *ngIf="filtered.length === 0" class="cm-empty">No posts found.</div>
        <table class="cm-table" *ngIf="filtered.length > 0">
          <thead>
            <tr>
              <th>#</th>
              <th>Author</th>
              <th>Content</th>
              <th>Flagged</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered" [class.cm-row-flagged]="p.flagged">
              <td style="color:#6e6e73;font-size:12px">{{ p.id }}</td>
              <td>
                <div style="font-weight:500;font-size:13px">{{ p.authorUsername || p.username || '—' }}</div>
                <div style="font-size:11px;color:#6e6e73">{{ p.authorEmail || '' }}</div>
              </td>
              <td class="cm-content-cell">{{ p.content }}</td>
              <td>
                <span *ngIf="p.flagged" class="cm-flag-chip">🚩 {{ p.flagReason }}</span>
                <span *ngIf="!p.flagged" style="color:#aeaeb2;font-size:12px">—</span>
              </td>
              <td style="font-size:12px;color:#6e6e73;white-space:nowrap">
                {{ (p.createdAt || p.creationDate) ? ((p.createdAt || p.creationDate) | date:'dd/MM/yy') : '—' }}
              </td>
              <td>
                <button class="cm-del-btn" (click)="confirmDelete(p)" title="Delete post">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Flagged Posts Tab ── -->
      <div class="cm-card" *ngIf="!loading && activeTab==='flagged-posts'">
        <div class="cm-card-title">
          🚩 Flagged Posts
          <span class="cm-badge-red" style="margin-left:8px">{{ flaggedPosts.length }} pending</span>
        </div>
        <div *ngIf="flaggedPosts.length === 0" class="cm-empty">✅ No flagged posts.</div>
        <table class="cm-table" *ngIf="flaggedPosts.length > 0">
          <thead>
            <tr>
              <th>#</th>
              <th>Author</th>
              <th>Content Preview</th>
              <th>Reason</th>
              <th>Date</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of flaggedPosts">
              <td class="cm-id">{{ p.id }}</td>
              <td>
                <div class="cm-author-cell">
                  <div class="cm-avatar">{{ (p.username || '?')[0].toUpperCase() }}</div>
                  <span style="font-weight:600;font-size:13px">{{ p.username || '—' }}</span>
                </div>
              </td>
              <td class="cm-content-cell" style="color:#c62828">{{ p.content }}</td>
              <td><span class="cm-reason-chip">{{ p.flagReason }}</span></td>
              <td style="font-size:12px;color:#6e6e73;white-space:nowrap">
                {{ p.creationDate ? (p.creationDate | date:'dd/MM/yy HH:mm') : '—' }}
              </td>
              <td style="text-align:right">
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button class="cm-approve-btn" [disabled]="actionId===p.id" (click)="approvePost(p)">
                    {{ actionId===p.id ? '…' : '✅ Approve' }}
                  </button>
                  <button class="cm-reject-btn" [disabled]="actionId===p.id" (click)="rejectPost(p)">
                    {{ actionId===p.id ? '…' : '🗑 Reject' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Flagged Comments Tab ── -->
      <div class="cm-card" *ngIf="!loading && activeTab==='flagged-comments'">
        <div class="cm-card-title">
          🚩 Flagged Comments
          <span class="cm-badge-red" style="margin-left:8px">{{ flaggedComments.length }} pending</span>
        </div>
        <div *ngIf="flaggedComments.length === 0" class="cm-empty">✅ No flagged comments.</div>
        <table class="cm-table" *ngIf="flaggedComments.length > 0">
          <thead>
            <tr>
              <th>#</th>
              <th>Author</th>
              <th>Comment</th>
              <th>Post #</th>
              <th>Reason</th>
              <th>Date</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of flaggedComments">
              <td class="cm-id">{{ c.id }}</td>
              <td>
                <div class="cm-author-cell">
                  <div class="cm-avatar" style="background:#e8f0fe;color:#185fa5">
                    {{ (c.username || '?')[0].toUpperCase() }}
                  </div>
                  <span style="font-weight:600;font-size:13px">{{ c.username || '—' }}</span>
                </div>
              </td>
              <td class="cm-content-cell" style="color:#c62828">{{ c.content }}</td>
              <td style="color:#6e6e73;font-size:12px">Post #{{ c.postId }}</td>
              <td><span class="cm-reason-chip">{{ c.flagReason }}</span></td>
              <td style="font-size:12px;color:#6e6e73;white-space:nowrap">
                {{ c.creationDate ? (c.creationDate | date:'dd/MM/yy HH:mm') : '—' }}
              </td>
              <td style="text-align:right">
                <div style="display:flex;gap:6px;justify-content:flex-end">
                  <button class="cm-approve-btn" [disabled]="actionId===c.id" (click)="approveComment(c)">
                    {{ actionId===c.id ? '…' : '✅ Approve' }}
                  </button>
                  <button class="cm-reject-btn" [disabled]="actionId===c.id" (click)="rejectComment(c)">
                    {{ actionId===c.id ? '…' : '🗑 Reject' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Delete modal (existing posts) -->
      <div class="cm-overlay" *ngIf="postToDelete">
        <div class="cm-modal">
          <div class="cm-modal-icon">🗑️</div>
          <div class="cm-modal-title">Delete post?</div>
          <div class="cm-modal-body">This will permanently remove the post by
            <strong>{{ postToDelete.authorUsername || postToDelete.username }}</strong>.
            This action cannot be undone.
          </div>
          <div class="cm-modal-actions">
            <button class="cm-modal-cancel" (click)="postToDelete = null">Cancel</button>
            <button class="cm-modal-confirm" (click)="deletePost()" [disabled]="deleting">
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div class="cm-toast" [class.cm-toast-ok]="toastType==='ok'" [class.cm-toast-err]="toastType==='err'" *ngIf="toastMsg">
        {{ toastMsg }}
      </div>

    </div>
  `,
  styles: [`
    .cm-page { padding:24px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#1d1d1f; }
    .cm-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
    .cm-header-left { display:flex; align-items:center; gap:12px; }
    .cm-icon { font-size:28px; }
    .cm-title { font-size:20px; font-weight:700; color:#1d1d1f; }
    .cm-sub { font-size:13px; color:#6e6e73; margin-top:2px; }
    .cm-refresh-btn { background:#f5f5f7; border:1px solid #e0e0e5; border-radius:8px; padding:8px 16px; cursor:pointer; font-size:13px; color:#1d1d1f; }
    .cm-refresh-btn:hover { background:#e8e8ed; }
    .cm-spin { display:inline-block; animation:spin 1s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }

    .cm-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .cm-kpi { background:white; border-radius:12px; padding:16px; border:1px solid #e0e0e5; display:flex; align-items:center; gap:12px; }
    .cm-kpi-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; }
    .cm-kpi-val { font-size:22px; font-weight:700; color:#1d1d1f; }
    .cm-kpi-lbl { font-size:12px; color:#6e6e73; margin-top:2px; }

    /* ── Tabs ── */
    .cm-tabs { display:flex; gap:6px; margin-bottom:16px; flex-wrap:wrap; }
    .cm-tab { padding:7px 16px; border:1px solid #e0e0e5; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#6e6e73; cursor:pointer; display:flex; align-items:center; gap:6px; }
    .cm-tab:hover { background:#f5f5f7; }
    .cm-tab.cm-tab-active { background:#1d1d1f; color:white; border-color:#1d1d1f; }
    .cm-badge-red { background:#c62828; color:white; font-size:11px; font-weight:700; padding:1px 7px; border-radius:20px; }

    .cm-toolbar { margin-bottom:12px; }
    .cm-search-wrap { position:relative; max-width:320px; }
    .cm-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); font-size:14px; }
    .cm-search { width:100%; padding:8px 12px 8px 32px; border:1px solid #e0e0e5; border-radius:8px; font-size:13px; outline:none; }
    .cm-search:focus { border-color:#007aff; }

    .cm-error { background:#fff2f2; border:1px solid #ffd0d0; color:#c62828; padding:12px 16px; border-radius:8px; margin-bottom:16px; font-size:13px; }
    .cm-loading { text-align:center; padding:40px; color:#6e6e73; font-size:14px; }
    .cm-card { background:white; border-radius:12px; padding:20px; border:1px solid #e0e0e5; margin-bottom:20px; }
    .cm-card-title { font-size:15px; font-weight:600; color:#1d1d1f; margin-bottom:16px; display:flex; align-items:center; }
    .cm-empty { text-align:center; padding:32px; color:#6e6e73; font-size:14px; }

    .cm-table { width:100%; border-collapse:collapse; font-size:13px; }
    .cm-table th { text-align:left; padding:8px 12px; border-bottom:2px solid #f0f0f0; color:#6e6e73; font-weight:500; font-size:11px; text-transform:uppercase; }
    .cm-table td { padding:10px 12px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .cm-table tr:last-child td { border-bottom:none; }
    .cm-content-cell { max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#3a3a3c; }
    .cm-id { font-size:11px; font-weight:600; color:#c0c0c5; }

    .cm-row-flagged { background:#fff8f8; }
    .cm-flag-chip { background:#fff2f2; color:#c62828; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; }
    .cm-reason-chip { background:#fff3e0; color:#e65100; font-size:11px; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; }

    .cm-author-cell { display:flex; align-items:center; gap:8px; }
    .cm-avatar { width:28px; height:28px; border-radius:8px; background:#1d1d1f; color:white; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

    .cm-approve-btn { padding:5px 12px; background:#1a7f4b; color:white; border:none; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; }
    .cm-approve-btn:hover:not(:disabled) { background:#15683e; }
    .cm-approve-btn:disabled { opacity:.4; cursor:not-allowed; }
    .cm-reject-btn { padding:5px 12px; background:#c62828; color:white; border:none; border-radius:7px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; }
    .cm-reject-btn:hover:not(:disabled) { background:#a31f1f; }
    .cm-reject-btn:disabled { opacity:.4; cursor:not-allowed; }

    .cm-del-btn { background:none; border:1px solid #e0e0e5; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:13px; }
    .cm-del-btn:hover { background:#fff2f2; border-color:#ffb3b3; }

    .cm-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .cm-modal { background:white; border-radius:16px; padding:32px; max-width:400px; width:90%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.3); }
    .cm-modal-icon { font-size:40px; margin-bottom:12px; }
    .cm-modal-title { font-size:18px; font-weight:700; color:#1d1d1f; margin-bottom:8px; }
    .cm-modal-body { font-size:13px; color:#6e6e73; line-height:1.5; margin-bottom:24px; }
    .cm-modal-actions { display:flex; gap:12px; justify-content:center; }
    .cm-modal-cancel { background:#f5f5f7; border:none; border-radius:8px; padding:10px 20px; cursor:pointer; font-size:13px; font-weight:500; }
    .cm-modal-confirm { background:#c62828; color:white; border:none; border-radius:8px; padding:10px 20px; cursor:pointer; font-size:13px; font-weight:500; }
    .cm-modal-confirm:disabled { opacity:0.6; cursor:not-allowed; }

    .cm-toast { position:fixed; bottom:24px; right:24px; padding:12px 20px; border-radius:10px; font-size:13px; font-weight:500; z-index:2000; box-shadow:0 4px 20px rgba(0,0,0,0.15); animation:slideIn 0.3s ease; }
    .cm-toast-ok { background:#1a7f4b; color:white; }
    .cm-toast-err { background:#c62828; color:white; }
    @keyframes slideIn { from { transform:translateY(10px); opacity:0; } to { transform:translateY(0); opacity:1; } }

    @media (max-width:768px) { .cm-kpis { grid-template-columns:repeat(2,1fr); } }
  `]
})
export class BackofficeCommunityComponent implements OnInit {
  posts: Post[] = [];
  flaggedPosts: Post[] = [];
  flaggedComments: FlaggedComment[] = [];
  loading = false;
  error = '';
  searchQ = '';
  postToDelete: Post | null = null;
  deleting = false;
  toastMsg = '';
  toastType: 'ok' | 'err' = 'ok';
  activeTab: 'posts' | 'flagged-posts' | 'flagged-comments' = 'posts';
  actionId: number | null = null;

  get filtered(): Post[] {
    const q = this.searchQ.toLowerCase();
    if (!q) return this.posts;
    return this.posts.filter(p =>
      (p.content || '').toLowerCase().includes(q) ||
      (p.authorUsername || p.username || '').toLowerCase().includes(q) ||
      (p.authorEmail || '').toLowerCase().includes(q)
    );
  }

  get totalLikes(): number {
    return this.posts.reduce((s, p) => s + (p.likesCount ?? 0), 0);
  }

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit() { this.load(); }

  private headers(): HttpHeaders {
    const token = this.auth.getToken?.() || localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  load() {
    this.loading = true;
    this.error = '';

    this.http.get<Post[]>(`${environment.baseUrl}/posts`, { headers: this.headers() }).subscribe({
      next: data => {
        this.posts = data.map(p => ({ ...p, username: (p as any).username || (p as any).authorUsername }));
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load posts.'; this.loading = false; }
    });

    this.http.get<Post[]>(`${environment.baseUrl}/admin/moderation/flagged-posts`, { headers: this.headers() }).subscribe({
      next: data => { this.flaggedPosts = data; },
      error: () => {}
    });

    this.http.get<FlaggedComment[]>(`${environment.baseUrl}/admin/moderation/flagged-comments`, { headers: this.headers() }).subscribe({
      next: data => { this.flaggedComments = data; },
      error: () => {}
    });
  }

  confirmDelete(p: Post) { this.postToDelete = p; }

  deletePost() {
    if (!this.postToDelete) return;
    this.deleting = true;
    const id = this.postToDelete.id;
    this.http.delete(`${environment.baseUrl}/posts/${id}`, { headers: this.headers() }).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== id);
        this.postToDelete = null;
        this.deleting = false;
        this.showToast('Post deleted', 'ok');
      },
      error: () => { this.deleting = false; this.showToast('Delete failed', 'err'); }
    });
  }

  approvePost(p: Post) {
    this.actionId = p.id;
    this.http.put(`${environment.baseUrl}/admin/moderation/posts/${p.id}/approve`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.flaggedPosts = this.flaggedPosts.filter(x => x.id !== p.id);
        this.actionId = null;
        this.showToast('Post approved', 'ok');
      },
      error: () => { this.actionId = null; this.showToast('Failed to approve', 'err'); }
    });
  }

  rejectPost(p: Post) {
    this.actionId = p.id;
    this.http.put(`${environment.baseUrl}/admin/moderation/posts/${p.id}/reject`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.flaggedPosts = this.flaggedPosts.filter(x => x.id !== p.id);
        this.posts = this.posts.filter(x => x.id !== p.id);
        this.actionId = null;
        this.showToast('Post rejected and deleted', 'ok');
      },
      error: () => { this.actionId = null; this.showToast('Failed to reject', 'err'); }
    });
  }

  approveComment(c: FlaggedComment) {
    this.actionId = c.id;
    this.http.put(`${environment.baseUrl}/admin/moderation/comments/${c.id}/approve`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.flaggedComments = this.flaggedComments.filter(x => x.id !== c.id);
        this.actionId = null;
        this.showToast('Comment approved', 'ok');
      },
      error: () => { this.actionId = null; this.showToast('Failed to approve', 'err'); }
    });
  }

  rejectComment(c: FlaggedComment) {
    this.actionId = c.id;
    this.http.put(`${environment.baseUrl}/admin/moderation/comments/${c.id}/reject`, {}, { headers: this.headers() }).subscribe({
      next: () => {
        this.flaggedComments = this.flaggedComments.filter(x => x.id !== c.id);
        this.actionId = null;
        this.showToast('Comment rejected and deleted', 'ok');
      },
      error: () => { this.actionId = null; this.showToast('Failed to reject', 'err'); }
    });
  }

  private showToast(msg: string, type: 'ok' | 'err') {
    this.toastMsg = msg;
    this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3200);
  }
}
