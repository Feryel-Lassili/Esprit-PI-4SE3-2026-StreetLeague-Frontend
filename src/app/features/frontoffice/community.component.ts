import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// ─── Models ────────────────────────────────────────────────────────────────────
interface PostDto {
  id: number;
  content: string;
  creationDate: string;
  userId: number;
  username: string;
  likes?: LikeDto[];
  comments?: CommentDto[];
  showComments?: boolean;
  newComment?: string;
  userLike?: LikeDto | null;
  showReactions?: boolean;
}

interface CommentDto {
  id: number;
  content: string;
  creationDate: string;
  userId: number;
  username: string;
  postId: number;
  parentCommentId?: number;
  replies?: CommentDto[];
  showReplies?: boolean;
  newReply?: string;
  reactions?: CommentReactionDto[];
  showReactions?: boolean;
  userReaction?: CommentReactionDto | null;
}

interface LikeDto {
  id: number;
  postId: number;
  likeType: string;
  userId: number;
  creationDate: string;
}

interface CommentReactionDto {
  id: number;
  likeType: string;
  creationDate: string;
  commentId: number;
  userId: number;
  username: string;
}

const REACTIONS = [
  { type: 'LIKE',  emoji: '👍', label: 'Like'  },
  { type: 'LOVE',  emoji: '❤️', label: 'Love'  },
  { type: 'HAHA',  emoji: '😂', label: 'Haha'  },
  { type: 'WOW',   emoji: '😮', label: 'Wow'   },
  { type: 'SAD',   emoji: '😢', label: 'Sad'   },
  { type: 'ANGRY', emoji: '😡', label: 'Angry' },
];

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .page { max-width: 680px; margin: 0 auto; padding: 24px 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 28px; font-weight: 900; color: #1d1d1f; letter-spacing: -.02em; }
    .page-header p  { font-size: 14px; color: #6e6e73; margin-top: 4px; }

    .compose { background: white; border: 1px solid #e0e0e5; border-radius: 20px;
               padding: 16px; margin-bottom: 20px; }
    .compose-top    { display: flex; gap: 10px; align-items: flex-start; }
    .compose-avatar { width: 38px; height: 38px; border-radius: 50%; background: #e8f0fe;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 14px; font-weight: 700; color: #185fa5; flex-shrink: 0; }
    .compose-input  { flex: 1; border: none; outline: none; resize: none; font-size: 15px;
                      color: #1d1d1f; background: transparent; font-family: inherit;
                      min-height: 60px; line-height: 1.5; }
    .compose-input::placeholder { color: #aeaeb2; }
    .compose-footer { display: flex; justify-content: flex-end; margin-top: 10px;
                      padding-top: 10px; border-top: 1px solid #f0f0f5; }
    .post-btn { background: #1d1d1f; color: white; border: none; padding: 8px 20px;
                border-radius: 20px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .post-btn:disabled { opacity: .4; cursor: default; }

    .feed { display: flex; flex-direction: column; gap: 14px; }

    .post-card { background: white; border: 1px solid #e0e0e5; border-radius: 20px; overflow: visible; }
    .post-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px 0; }
    .post-avatar { width: 40px; height: 40px; border-radius: 50%;
                   background: linear-gradient(135deg,#667eea,#764ba2);
                   display: flex; align-items: center; justify-content: center;
                   font-size: 15px; font-weight: 700; color: white; flex-shrink: 0; }
    .post-meta   { flex: 1; }
    .post-author { font-size: 14px; font-weight: 700; color: #1d1d1f; }
    .post-time   { font-size: 11px; color: #aeaeb2; margin-top: 1px; }
    .post-menu   { background: none; border: none; cursor: pointer; color: #aeaeb2;
                   font-size: 18px; padding: 4px 8px; border-radius: 8px; }
    .post-menu:hover { background: #f5f5f7; }
    .post-content { padding: 12px 16px; font-size: 15px; color: #1d1d1f; line-height: 1.55; }

    .reaction-summary { padding: 4px 16px 8px; display: flex; align-items: center;
                        justify-content: space-between; }
    .reaction-pills   { display: flex; gap: 4px; }
    .reaction-pill    { background: #f5f5f7; border-radius: 20px; padding: 2px 8px;
                        font-size: 12px; display: flex; align-items: center; gap: 3px; }
    .reaction-pill-count { font-weight: 700; color: #1d1d1f; }
    .comment-count { font-size: 12px; color: #6e6e73; cursor: pointer; }
    .comment-count:hover { text-decoration: underline; }

    .post-actions { display: flex; border-top: 1px solid #f0f0f5; position: relative; }
    .like-wrap { flex: 1; position: relative; }

    .action-btn { width: 100%; display: flex; align-items: center; justify-content: center;
                  gap: 6px; padding: 10px; background: none; border: none; cursor: pointer;
                  font-size: 13px; font-weight: 600; color: #6e6e73; transition: all .15s; }
    .action-btn:hover   { background: #f5f5f7; color: #1d1d1f; }
    .action-btn.reacted { color: #007aff; }
    .action-btn.loved   { color: #ff3b30; }
    .action-btn-icon    { font-size: 16px; }

    .reaction-picker {
      position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
      background: white; border: 1px solid #e0e0e5; border-radius: 40px; padding: 8px 14px;
      display: flex; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.15);
      z-index: 9999; white-space: nowrap; pointer-events: all;
    }
    .reaction-option { font-size: 26px; cursor: pointer; transition: transform .15s;
                       line-height: 1; display: inline-block; }
    .reaction-option:hover { transform: scale(1.5) translateY(-4px); }

    .action-btn-plain { flex: 1; display: flex; align-items: center; justify-content: center;
                        gap: 6px; padding: 10px; background: none; border: none; cursor: pointer;
                        font-size: 13px; font-weight: 600; color: #6e6e73; transition: all .15s; }
    .action-btn-plain:hover { background: #f5f5f7; color: #1d1d1f; }

    .comments-section { border-top: 1px solid #f0f0f5; padding: 12px 16px; }
    .comment-item   { display: flex; gap: 8px; margin-bottom: 12px; }
    .comment-avatar { width: 32px; height: 32px; border-radius: 50%; background: #f0f0f5;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 11px; font-weight: 700; color: #6e6e73; flex-shrink: 0; }
    .comment-bubble { flex: 1; min-width: 0; }
    .comment-box    { background: #f5f5f7; border-radius: 14px; padding: 8px 12px;
                      display: inline-block; max-width: 100%; }
    .comment-author { font-size: 12px; font-weight: 700; color: #1d1d1f; }
    .comment-text   { font-size: 13px; color: #1d1d1f; margin-top: 2px; line-height: 1.4; }

    .comment-reaction-pills { display: flex; gap: 3px; margin-top: 3px; padding-left: 4px; flex-wrap: wrap; }
    .comment-reaction-pill  { background: white; border: 1px solid #e0e0e5; border-radius: 20px;
                               padding: 1px 7px; font-size: 11px; display: flex;
                               align-items: center; gap: 2px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }
    .comment-reaction-pill-count { font-weight: 700; color: #1d1d1f; font-size: 10px; }

    .comment-footer { display: flex; align-items: center; gap: 8px; margin-top: 4px;
                      padding-left: 4px; flex-wrap: wrap; }
    .comment-time   { font-size: 11px; color: #aeaeb2; }
    .comment-action { font-size: 11px; font-weight: 700; color: #6e6e73; cursor: pointer;
                      background: none; border: none; padding: 0; }
    .comment-action:hover   { color: #007aff; }
    .comment-action.reacted { color: #007aff; }

    .comment-reaction-wrap   { position: relative; display: inline-block; }
    .comment-reaction-picker {
      position: absolute; bottom: calc(100% + 6px); left: 0;
      background: white; border: 1px solid #e0e0e5; border-radius: 40px; padding: 6px 12px;
      display: flex; gap: 6px; box-shadow: 0 4px 20px rgba(0,0,0,.12);
      z-index: 9999; white-space: nowrap; pointer-events: all;
    }
    .comment-reaction-option { font-size: 20px; cursor: pointer; transition: transform .15s;
                               line-height: 1; display: inline-block; }
    .comment-reaction-option:hover { transform: scale(1.4) translateY(-3px); }

    .replies-section { margin-top: 6px; padding-left: 40px; }
    .reply-item   { display: flex; gap: 8px; margin-bottom: 8px; }
    .reply-avatar { width: 26px; height: 26px; border-radius: 50%; background: #e8f0fe;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 9px; font-weight: 700; color: #185fa5; flex-shrink: 0; }

    .add-comment { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
    .add-reply   { display: flex; gap: 6px; align-items: center; margin-top: 6px; }
    .comment-input-wrap { flex: 1; display: flex; align-items: center;
                          background: #f5f5f7; border-radius: 20px; padding: 8px 14px; gap: 8px; }
    .comment-input { flex: 1; border: none; outline: none; background: transparent;
                     font-size: 13px; color: #1d1d1f; font-family: inherit; }
    .comment-input::placeholder { color: #aeaeb2; }
    .send-btn { background: #007aff; color: white; border: none; width: 28px; height: 28px;
                border-radius: 50%; cursor: pointer; font-size: 12px; display: flex;
                align-items: center; justify-content: center; flex-shrink: 0; }
    .send-btn:hover    { background: #0066cc; }
    .send-btn:disabled { opacity: .4; cursor: default; }

    .loading { text-align: center; padding: 40px; color: #aeaeb2; font-size: 14px; }
    .empty   { text-align: center; padding: 48px 24px; }
    .empty-icon { font-size: 48px; margin-bottom: 12px; }
    .empty p    { font-size: 14px; color: #aeaeb2; }

    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
             padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 600;
             z-index: 9999; box-shadow: 0 6px 24px rgba(0,0,0,.2); white-space: nowrap; }
    .toast.success { background: #1d1d1f; color: white; }
    .toast.error   { background: #ff3b30; color: white; }

    .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4);
                       display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .confirm-box     { background: white; border-radius: 16px; padding: 28px 32px;
                       max-width: 340px; width: 90%; text-align: center; }
    .confirm-box h3  { font-size: 18px; font-weight: 800; color: #1d1d1f; margin-bottom: 8px; }
    .confirm-box p   { font-size: 14px; color: #6e6e73; margin-bottom: 24px; }
    .confirm-actions { display: flex; gap: 10px; justify-content: center; }
    .confirm-cancel  { border: 1.5px solid #e0e0e5; background: white; color: #1d1d1f;
                       padding: 10px 24px; border-radius: 10px; font-size: 13px;
                       font-weight: 600; cursor: pointer; }
    .confirm-delete  { border: none; background: #ff3b30; color: white; padding: 10px 24px;
                       border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
  `],
  template: `
<div class="page">

  <!-- Delete confirm -->
  <div class="confirm-overlay" *ngIf="confirmTarget">
    <div class="confirm-box">
      <h3>Delete {{ confirmType }}?</h3>
      <p>This action cannot be undone.</p>
      <div class="confirm-actions">
        <button class="confirm-cancel" (click)="confirmTarget=null">Cancel</button>
        <button class="confirm-delete" (click)="executeDelete()">🗑 Delete</button>
      </div>
    </div>
  </div>

  <!-- Header -->
  <div class="page-header">
    <h1>Community 💬</h1>
    <p>Share what's on your mind with the StreetLeague community</p>
  </div>

  <!-- Compose -->
  <div class="compose">
    <div class="compose-top">
      <div class="compose-avatar">{{ userInitial }}</div>
      <textarea class="compose-input" [(ngModel)]="newPostContent"
                placeholder="What's on your mind?" rows="3"></textarea>
    </div>
    <div class="compose-footer">
      <button class="post-btn" [disabled]="!newPostContent.trim() || posting"
              (click)="createPost()">
        {{ posting ? 'Posting…' : 'Post' }}
      </button>
    </div>
  </div>

  <!-- Loading -->
  <div *ngIf="loading" class="loading">⏳ Loading posts…</div>

  <!-- Empty -->
  <div *ngIf="!loading && posts.length === 0" class="empty">
    <div class="empty-icon">💬</div>
    <p>No posts yet — be the first to share!</p>
  </div>

  <!-- Feed -->
  <div class="feed" *ngIf="!loading">
    <div *ngFor="let post of posts" class="post-card">

      <!-- Post header -->
      <div class="post-header">
        <div class="post-avatar">{{ post.username[0].toUpperCase() }}</div>
        <div class="post-meta">
          <div class="post-author">{{ post.username }}</div>
          <div class="post-time">{{ formatTime(post.creationDate) }}</div>
        </div>
        <button class="post-menu" *ngIf="post.userId === currentUserId"
                (click)="askDelete(post.id, 'post')">✕</button>
      </div>

      <!-- Post content -->
      <div class="post-content">{{ post.content }}</div>

      <!-- Reaction summary -->
      <div class="reaction-summary"
           *ngIf="(post.likes?.length || 0) > 0 || (post.comments?.length || 0) > 0">
        <div class="reaction-pills">
          <span *ngFor="let r of getReactionSummary(post.likes || [])" class="reaction-pill">
            <span>{{ r.emoji }}</span>
            <span class="reaction-pill-count">{{ r.count }}</span>
          </span>
        </div>
        <span class="comment-count"
              *ngIf="(post.comments?.length || 0) > 0"
              (click)="post.showComments = !post.showComments">
          {{ getTotalCommentCount(post) }} comment{{ getTotalCommentCount(post) !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Action bar -->
      <div class="post-actions">
        <div class="like-wrap">
          <button class="action-btn"
                  [class.reacted]="post.userLike && post.userLike.likeType === 'LIKE'"
                  [class.loved]="post.userLike && post.userLike.likeType === 'LOVE'"
                  (click)="toggleLike(post)"
                  (mouseenter)="post.showReactions = true"
                  (mouseleave)="scheduleHideReactions(post)">
            <span class="action-btn-icon">
              {{ post.userLike ? reactionEmoji(post.userLike.likeType) : '👍' }}
            </span>
            {{ post.userLike ? capitalize(post.userLike.likeType) : 'Like' }}
          </button>
          <div class="reaction-picker"
               *ngIf="post.showReactions"
               (mouseenter)="clearHideTimer(post)"
               (mouseleave)="scheduleHideReactions(post)">
            <span *ngFor="let r of reactions"
                  class="reaction-option"
                  [title]="r.label"
                  (click)="reactToPost(post, r.type)">{{ r.emoji }}</span>
          </div>
        </div>
        <button class="action-btn-plain" (click)="toggleComments(post)">
          <span class="action-btn-icon">💬</span> Comment
        </button>
        <button class="action-btn-plain" (click)="sharePost(post)">
          <span class="action-btn-icon">↗️</span> Share
        </button>
      </div>

      <!-- Comments section -->
      <div class="comments-section" *ngIf="post.showComments">

        <div *ngFor="let comment of post.comments" class="comment-item">
          <div class="comment-avatar">{{ comment.username[0].toUpperCase() }}</div>
          <div class="comment-bubble">

            <div class="comment-box">
              <div class="comment-author">{{ comment.username }}</div>
              <div class="comment-text">{{ comment.content }}</div>
            </div>

            <div class="comment-reaction-pills"
                 *ngIf="comment.reactions && comment.reactions.length > 0">
              <span *ngFor="let r of getCommentReactionSummary(comment.reactions)"
                    class="comment-reaction-pill">
                <span>{{ r.emoji }}</span>
                <span class="comment-reaction-pill-count">{{ r.count }}</span>
              </span>
            </div>

            <div class="comment-footer">
              <span class="comment-time">{{ formatTime(comment.creationDate) }}</span>
              <div class="comment-reaction-wrap">
                <button class="comment-action"
                        [class.reacted]="comment.userReaction"
                        (click)="toggleCommentReaction(comment)"
                        (mouseenter)="comment.showReactions = true"
                        (mouseleave)="scheduleHideCommentReactions(comment)">
                  {{ comment.userReaction ? reactionEmoji(comment.userReaction.likeType) : '👍' }}
                  {{ comment.userReaction ? capitalize(comment.userReaction.likeType) : 'Like' }}
                </button>
                <div class="comment-reaction-picker"
                     *ngIf="comment.showReactions"
                     (mouseenter)="clearCommentHideTimer(comment)"
                     (mouseleave)="scheduleHideCommentReactions(comment)">
                  <span *ngFor="let r of reactions"
                        class="comment-reaction-option"
                        [title]="r.label"
                        (click)="reactToComment(comment, r.type)">{{ r.emoji }}</span>
                </div>
              </div>
              <button class="comment-action"
                      (click)="comment.showReplies = !comment.showReplies">
                💬
                <span *ngIf="comment.replies && comment.replies.length > 0">
                  {{ comment.replies.length }}
                </span>
                {{ comment.showReplies ? 'Cancel' : 'Reply' }}
              </button>
              <button class="comment-action"
                      *ngIf="comment.userId === currentUserId"
                      (click)="askDelete(comment.id, 'comment')">Delete</button>
            </div>

            <!-- Replies list -->
            <div class="replies-section"
                 *ngIf="comment.replies && comment.replies.length > 0">
              <div *ngFor="let reply of comment.replies" class="reply-item">
                <div class="reply-avatar">{{ reply.username[0].toUpperCase() }}</div>
                <div class="comment-bubble">
                  <div class="comment-box">
                    <div class="comment-author">{{ reply.username }}</div>
                    <div class="comment-text">{{ reply.content }}</div>
                  </div>
                  <!-- ✅ FIX: Reply button added here -->
                  <div class="comment-footer">
                    <span class="comment-time">{{ formatTime(reply.creationDate) }}</span>
                    <button class="comment-action"
                            (click)="comment.showReplies = true; comment.newReply = '@' + reply.username + ' '">
                      💬 Reply
                    </button>
                    <button class="comment-action"
                            *ngIf="reply.userId === currentUserId"
                            (click)="askDelete(reply.id, 'comment')">Delete</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Reply input -->
            <div class="replies-section" *ngIf="comment.showReplies">
              <div class="add-reply">
                <div class="reply-avatar">{{ userInitial }}</div>
                <div class="comment-input-wrap">
                  <input class="comment-input"
                         [(ngModel)]="comment.newReply"
                         placeholder="Write a reply…"
                         (keyup.enter)="submitReply(comment)"/>
                  <button class="send-btn"
                          [disabled]="!comment.newReply?.trim()"
                          (click)="submitReply(comment)">↑</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Add comment -->
        <div class="add-comment">
          <div class="comment-avatar">{{ userInitial }}</div>
          <div class="comment-input-wrap">
            <input class="comment-input"
                   [(ngModel)]="post.newComment"
                   placeholder="Write a comment…"
                   (keyup.enter)="submitComment(post)"/>
            <button class="send-btn"
                    [disabled]="!post.newComment?.trim()"
                    (click)="submitComment(post)">↑</button>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Toast -->
  <div *ngIf="toastMsg" class="toast"
       [class.success]="toastType==='success'"
       [class.error]="toastType==='error'">
    {{ toastMsg }}
  </div>

</div>
  `
})
export class CommunityComponent implements OnInit {

  readonly BASE            = 'http://localhost:8089/SpringSecurity';
  readonly currentUserId   = 1;
  readonly currentUsername = 'Me';
  readonly reactions       = REACTIONS;

  posts:         PostDto[] = [];
  loading        = true;
  posting        = false;
  newPostContent = '';
  toastMsg       = '';
  toastType: 'success' | 'error' = 'success';
  confirmTarget: number | null   = null;
  confirmType:   'post' | 'comment' = 'post';

  private hideTimers = new Map<any, any>();

  get userInitial(): string { return this.currentUsername[0].toUpperCase(); }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadPosts(); }

  loadPosts(): void {
    this.loading = true;
    this.http.get<PostDto[]>(`${this.BASE}/posts`).subscribe({
      next: async (posts) => {
        this.posts = posts.map(p => ({
          ...p, likes: [], comments: [],
          showComments: false, newComment: '',
          userLike: null, showReactions: false
        }));
        await Promise.all(this.posts.map(p => this.loadPostDetails(p)));
        this.loading = false;
      },
      error: () => { this.loading = false; this.showToast('Failed to load posts', 'error'); }
    });
  }

  private loadPostDetails(post: PostDto): Promise<void> {
    return new Promise(resolve => {
      let done = 0;
      const check = () => { if (++done === 2) resolve(); };

      this.http.get<LikeDto[]>(`${this.BASE}/likes/post/${post.id}`).subscribe({
        next: (likes) => {
          post.likes    = likes;
          post.userLike = likes.find(l => l.userId === this.currentUserId) ?? null;
          check();
        },
        error: () => check()
      });

      this.http.get<CommentDto[]>(`${this.BASE}/comments/post/${post.id}`).subscribe({
        next: (comments) => {
          post.comments = comments
            .filter(c => !c.parentCommentId)
            .map(c => ({
              ...c, replies: [], showReplies: false, newReply: '',
              reactions: [], showReactions: false, userReaction: null
            }));
          post.comments.forEach(c => this.loadCommentDetails(c));
          check();
        },
        error: () => check()
      });
    });
  }

  private loadCommentDetails(comment: CommentDto): void {
    this.http.get<CommentDto[]>(`${this.BASE}/comments/${comment.id}/replies`).subscribe({
      next: (replies) => { comment.replies = replies; }
    });
    this.http.get<CommentReactionDto[]>(`${this.BASE}/comment-reactions/comment/${comment.id}`).subscribe({
      next: (reactions) => {
        comment.reactions    = reactions;
        comment.userReaction = reactions.find(r => r.userId === this.currentUserId) ?? null;
      }
    });
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.posting = true;
    this.http.post<PostDto>(`${this.BASE}/posts`, null, {
      params: { userId: this.currentUserId, content: this.newPostContent.trim() }
    }).subscribe({
      next: (post) => {
        this.posts.unshift({
          ...post, likes: [], comments: [],
          showComments: false, newComment: '',
          userLike: null, showReactions: false
        });
        this.newPostContent = '';
        this.posting = false;
        this.showToast('Post shared! 🎉', 'success');
      },
      error: () => { this.posting = false; this.showToast('Failed to post', 'error'); }
    });
  }

  askDelete(id: number, type: 'post' | 'comment'): void {
    this.confirmTarget = id;
    this.confirmType   = type;
  }

  executeDelete(): void {
    if (!this.confirmTarget) return;
    const id   = this.confirmTarget;
    const type = this.confirmType;
    this.confirmTarget = null;

    const url = type === 'post'
      ? `${this.BASE}/posts/${id}`
      : `${this.BASE}/comments/${id}`;

    this.http.delete(url).subscribe({
      next: () => {
        if (type === 'post') {
          this.posts = this.posts.filter(p => p.id !== id);
        } else {
          this.posts.forEach(p => {
            p.comments = p.comments?.filter(c => c.id !== id);
            p.comments?.forEach(c => { c.replies = c.replies?.filter(r => r.id !== id); });
          });
        }
        this.showToast('Deleted ✓', 'success');
      },
      error: () => this.showToast('Failed to delete', 'error')
    });
  }

  toggleLike(post: PostDto): void {
    if (post.userLike) {
      this.http.delete(`${this.BASE}/likes/${post.userLike.id}`).subscribe({
        next: () => {
          post.likes    = post.likes?.filter(l => l.id !== post.userLike!.id);
          post.userLike = null;
          post.showReactions = false;
        }
      });
    } else {
      this.reactToPost(post, 'LIKE');
    }
  }

  reactToPost(post: PostDto, likeType: string): void {
    post.showReactions = false;
    if (post.userLike) {
      this.http.delete(`${this.BASE}/likes/${post.userLike.id}`).subscribe({
        next: () => {
          post.likes    = post.likes?.filter(l => l.id !== post.userLike!.id);
          post.userLike = null;
          this.addLike(post, likeType);
        }
      });
    } else {
      this.addLike(post, likeType);
    }
  }

  private addLike(post: PostDto, likeType: string): void {
    this.http.post<LikeDto>(`${this.BASE}/likes`, null, {
      params: { postId: post.id, userId: this.currentUserId, likeType }
    }).subscribe({
      next: (like) => { post.likes?.push(like); post.userLike = like; },
      error: () => this.showToast('Could not react', 'error')
    });
  }

  toggleCommentReaction(comment: CommentDto): void {
    if (comment.userReaction) {
      this.http.delete(`${this.BASE}/comment-reactions/${comment.userReaction.id}`).subscribe({
        next: () => {
          comment.reactions    = comment.reactions?.filter(r => r.id !== comment.userReaction!.id);
          comment.userReaction = null;
          comment.showReactions = false;
        }
      });
    } else {
      this.reactToComment(comment, 'LIKE');
    }
  }

  reactToComment(comment: CommentDto, likeType: string): void {
    comment.showReactions = false;
    if (comment.userReaction) {
      this.http.delete(`${this.BASE}/comment-reactions/${comment.userReaction.id}`).subscribe({
        next: () => {
          comment.reactions    = comment.reactions?.filter(r => r.id !== comment.userReaction!.id);
          comment.userReaction = null;
          this.addCommentReaction(comment, likeType);
        }
      });
    } else {
      this.addCommentReaction(comment, likeType);
    }
  }

  private addCommentReaction(comment: CommentDto, likeType: string): void {
    this.http.post<CommentReactionDto>(`${this.BASE}/comment-reactions`, null, {
      params: { commentId: comment.id, userId: this.currentUserId, likeType }
    }).subscribe({
      next: (reaction) => {
        comment.reactions?.push(reaction);
        comment.userReaction = reaction;
      },
      error: () => this.showToast('Could not react', 'error')
    });
  }

  toggleComments(post: PostDto): void { post.showComments = !post.showComments; }

  submitComment(post: PostDto): void {
    if (!post.newComment?.trim()) return;
    this.http.post<CommentDto>(`${this.BASE}/comments`, null, {
      params: { postId: post.id, userId: this.currentUserId, content: post.newComment.trim() }
    }).subscribe({
      next: (comment) => {
        post.comments?.push({
          ...comment, replies: [], showReplies: false, newReply: '',
          reactions: [], showReactions: false, userReaction: null
        });
        post.newComment = '';
      },
      error: () => this.showToast('Could not post comment', 'error')
    });
  }

  submitReply(comment: CommentDto): void {
    if (!comment.newReply?.trim()) return;
    this.http.post<CommentDto>(`${this.BASE}/comments/reply`, null, {
      params: { parentCommentId: comment.id, userId: this.currentUserId, content: comment.newReply.trim() }
    }).subscribe({
      next: (reply) => {
        comment.replies?.push(reply);
        comment.newReply    = '';
        comment.showReplies = true;
      },
      error: () => this.showToast('Could not post reply', 'error')
    });
  }

  sharePost(post: PostDto): void {
    navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`)
      .then(() => this.showToast('Link copied! 🔗', 'success'))
      .catch(() => this.showToast('Could not copy link', 'error'));
  }

  scheduleHideReactions(post: PostDto): void {
    const t = setTimeout(() => { post.showReactions = false; }, 500);
    this.hideTimers.set(post, t);
  }
  clearHideTimer(post: PostDto): void {
    clearTimeout(this.hideTimers.get(post));
    this.hideTimers.delete(post);
  }
  scheduleHideCommentReactions(comment: CommentDto): void {
    const t = setTimeout(() => { comment.showReactions = false; }, 500);
    this.hideTimers.set(comment, t);
  }
  clearCommentHideTimer(comment: CommentDto): void {
    clearTimeout(this.hideTimers.get(comment));
    this.hideTimers.delete(comment);
  }

  getTotalCommentCount(post: PostDto): number {
    const comments = post.comments ?? [];
    const repliesCount = comments.reduce((sum, c) => sum + (c.replies?.length ?? 0), 0);
    return comments.length + repliesCount;
  }

  getReactionSummary(likes: LikeDto[]): { emoji: string; count: number }[] {
    const map = new Map<string, number>();
    likes.forEach(l => map.set(l.likeType, (map.get(l.likeType) ?? 0) + 1));
    return Array.from(map.entries()).map(([type, count]) => ({
      emoji: this.reactions.find(r => r.type === type)?.emoji ?? '👍', count
    }));
  }

  getCommentReactionSummary(reactions: CommentReactionDto[]): { emoji: string; count: number }[] {
    const map = new Map<string, number>();
    reactions.forEach(r => map.set(r.likeType, (map.get(r.likeType) ?? 0) + 1));
    return Array.from(map.entries()).map(([type, count]) => ({
      emoji: this.reactions.find(r => r.type === type)?.emoji ?? '👍', count
    }));
  }

  reactionEmoji(type: string): string {
    return this.reactions.find(r => r.type === type)?.emoji ?? '👍';
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)    return 'Just now';
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  private showToast(msg: string, type: 'success' | 'error'): void {
    this.toastMsg = msg; this.toastType = type;
    setTimeout(() => this.toastMsg = '', 3000);
  }
}