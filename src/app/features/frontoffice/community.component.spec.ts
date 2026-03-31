import { ComponentFixture, TestBed, fakeAsync, tick, flush, flushMicrotasks } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommunityComponent } from './community.component';
import { By } from '@angular/platform-browser';

// ── Shared constants ─────────────────────────────────────────────────────────
const BASE = 'http://localhost:8089/SpringSecurity';

// ── Shared mock data ─────────────────────────────────────────────────────────
const mockPost = {
  id: 1,
  content: 'Hello world',
  creationDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  userId: 1,
  username: 'Me',
};

const mockLike = {
  id: 10, postId: 1, likeType: 'LIKE', userId: 1,
  creationDate: new Date().toISOString(),
};

const mockComment = {
  id: 5, content: 'Nice post',
  creationDate: new Date(Date.now() - 60 * 1000).toISOString(),
  userId: 2, username: 'Other', postId: 1,
};

const mockReaction = {
  id: 20, likeType: 'LOVE', creationDate: new Date().toISOString(),
  commentId: 5, userId: 2, username: 'Other',
};

// ── Helper: build a fully enriched post object ───────────────────────────────
function enrichPost(overrides: any = {}): any {
  return {
    ...mockPost,
    likes: [], comments: [],
    showComments: false, newComment: '',
    userLike: null, showReactions: false,
    ...overrides,
  };
}

// ── Helper: build a fully enriched comment object ────────────────────────────
function enrichComment(overrides: any = {}): any {
  return {
    ...mockComment,
    replies: [], showReplies: false, newReply: '',
    reactions: [], showReactions: false, userReaction: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('CommunityComponent', () => {
  let component: CommunityComponent;
  let fixture:   ComponentFixture<CommunityComponent>;
  let http:      HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityComponent, HttpClientTestingModule, FormsModule],
    }).compileComponents();

    fixture   = TestBed.createComponent(CommunityComponent);
    component = fixture.componentInstance;
    http      = TestBed.inject(HttpTestingController);
  });

  // Flush the initial loadPosts() call (triggered by detectChanges / ngOnInit)
  beforeEach(fakeAsync(() => {
    fixture.detectChanges();                             // ngOnInit → loadPosts()
    http.expectOne(`${BASE}/posts`).flush([]);           // empty feed
    flushMicrotasks();                                   // resolve async Promise.all
    fixture.detectChanges();
  }));

  afterEach(() => http.verify());

  // ══════════════════════════════════════════════════════════════════
  // 1. INITIALIZATION
  // ══════════════════════════════════════════════════════════════════
  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should start with an empty post list', () => {
      expect(component.posts.length).toBe(0);
    });

    it('should set loading to false after posts are loaded', () => {
      expect(component.loading).toBeFalse();
    });

    it('userInitial should return first letter of currentUsername uppercased', () => {
      expect(component.userInitial).toBe('M');
    });

    it('should start with empty newPostContent', () => {
      expect(component.newPostContent).toBe('');
    });

    it('should start with posting = false', () => {
      expect(component.posting).toBeFalse();
    });

    it('should start with confirmTarget = null', () => {
      expect(component.confirmTarget).toBeNull();
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 2. LOAD POSTS
  // ══════════════════════════════════════════════════════════════════
  describe('loadPosts', () => {
    it('should populate posts array on success', fakeAsync(() => {
      component.loadPosts();
      http.expectOne(`${BASE}/posts`).flush([mockPost]);
      http.expectOne(`${BASE}/likes/post/1`).flush([]);
      http.expectOne(`${BASE}/comments/post/1`).flush([]);
      flushMicrotasks();

      expect(component.posts.length).toBe(1);
      expect(component.posts[0].content).toBe('Hello world');
    }));

    it('should set userLike when the current user has liked a post', fakeAsync(() => {
      component.loadPosts();
      http.expectOne(`${BASE}/posts`).flush([mockPost]);
      http.expectOne(`${BASE}/likes/post/1`).flush([mockLike]);
      http.expectOne(`${BASE}/comments/post/1`).flush([]);
      flushMicrotasks();

      expect(component.posts[0].userLike).toEqual(mockLike);
    }));

    it('should leave userLike null when current user has not liked', fakeAsync(() => {
      const otherLike = { ...mockLike, userId: 99, id: 99 };
      component.loadPosts();
      http.expectOne(`${BASE}/posts`).flush([mockPost]);
      http.expectOne(`${BASE}/likes/post/1`).flush([otherLike]);
      http.expectOne(`${BASE}/comments/post/1`).flush([]);
      flushMicrotasks();

      expect(component.posts[0].userLike).toBeNull();
    }));

    it('should load comment details when comments are returned', fakeAsync(() => {
      component.loadPosts();
      http.expectOne(`${BASE}/posts`).flush([mockPost]);
      http.expectOne(`${BASE}/likes/post/1`).flush([]);
      http.expectOne(`${BASE}/comments/post/1`).flush([mockComment]);
      http.expectOne(`${BASE}/comments/5/replies`).flush([]);
      const ownReaction = { ...mockReaction, userId: 1 };
      http.expectOne(`${BASE}/comment-reactions/comment/5`).flush([ownReaction]);
      flushMicrotasks();

      expect(component.posts[0].comments?.length).toBe(1);
      expect(component.posts[0].comments?.[0].userReaction).toEqual(ownReaction);
    }));

    it('should filter replies (parentCommentId set) out of top-level comments', fakeAsync(() => {
      const reply = { ...mockComment, id: 6, parentCommentId: 5 };
      component.loadPosts();
      http.expectOne(`${BASE}/posts`).flush([mockPost]);
      http.expectOne(`${BASE}/likes/post/1`).flush([]);
      http.expectOne(`${BASE}/comments/post/1`).flush([mockComment, reply]);
      http.expectOne(`${BASE}/comments/5/replies`).flush([]);
      http.expectOne(`${BASE}/comment-reactions/comment/5`).flush([]);
      flushMicrotasks();

      expect(component.posts[0].comments?.length).toBe(1);
      expect(component.posts[0].comments?.[0].id).toBe(5);
    }));

    it('should show error toast and stop loading when request fails', fakeAsync(() => {
      component.loadPosts();
      http.expectOne(`${BASE}/posts`).flush('error', { status: 500, statusText: 'Server Error' });
      flushMicrotasks();

      expect(component.loading).toBeFalse();
      expect(component.toastMsg).toContain('Failed to load');
      flush(); // drain toast timer
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 3. CREATE POST
  // ══════════════════════════════════════════════════════════════════
  describe('createPost', () => {
    it('should NOT make a request when content is empty', () => {
      component.newPostContent = '';
      component.createPost();
      http.expectNone(req => req.url === `${BASE}/posts` && req.method === 'POST');
      expect(component.posting).toBeFalse();
    });

    it('should NOT make a request when content is only whitespace', () => {
      component.newPostContent = '   ';
      component.createPost();
      http.expectNone(req => req.url === `${BASE}/posts` && req.method === 'POST');
      expect(component.posting).toBeFalse();
    });

    it('should set posting=true while request is in flight', () => {
      component.newPostContent = 'Hello!';
      component.createPost();
      expect(component.posting).toBeTrue();
      http.expectOne(req => req.url === `${BASE}/posts` && req.method === 'POST').flush(mockPost);
    });

    it('should prepend the new post, clear input, and show success toast', fakeAsync(() => {
      component.newPostContent = 'Hello!';
      component.createPost();
      http.expectOne(req => req.url === `${BASE}/posts` && req.method === 'POST').flush(mockPost);

      expect(component.posts.length).toBe(1);
      expect(component.posts[0].content).toBe('Hello world');
      expect(component.newPostContent).toBe('');
      expect(component.posting).toBeFalse();
      expect(component.toastMsg).toContain('Post shared');
      flush(); // drain toast timer
    }));

    it('should set posting=false and show error toast on failure', fakeAsync(() => {
      component.newPostContent = 'Hello!';
      component.createPost();
      http.expectOne(req => req.url === `${BASE}/posts` && req.method === 'POST')
          .flush('err', { status: 500, statusText: 'Error' });

      expect(component.posting).toBeFalse();
      expect(component.toastMsg).toContain('Failed to post');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 4. DELETE
  // ══════════════════════════════════════════════════════════════════
  describe('askDelete / executeDelete', () => {
    it('askDelete should set confirmTarget and confirmType for post', () => {
      component.askDelete(1, 'post');
      expect(component.confirmTarget).toBe(1);
      expect(component.confirmType).toBe('post');
    });

    it('askDelete should set confirmTarget and confirmType for comment', () => {
      component.askDelete(5, 'comment');
      expect(component.confirmTarget).toBe(5);
      expect(component.confirmType).toBe('comment');
    });

    it('executeDelete should do nothing when confirmTarget is null', () => {
      component.confirmTarget = null;
      component.executeDelete();
      http.expectNone(req => req.method === 'DELETE');
      expect(component.confirmTarget).toBeNull();
    });

    it('executeDelete should clear confirmTarget immediately', () => {
      component.posts = [enrichPost()];
      component.askDelete(1, 'post');
      component.executeDelete();
      expect(component.confirmTarget).toBeNull();
      http.expectOne(`${BASE}/posts/1`).flush(null); // satisfy verify
    });

    it('should DELETE post URL and remove post from list on success', fakeAsync(() => {
      component.posts = [enrichPost()];
      component.askDelete(1, 'post');
      component.executeDelete();

      const req = http.expectOne(`${BASE}/posts/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(component.posts.length).toBe(0);
      expect(component.toastMsg).toContain('Deleted');
      flush();
    }));

    it('should DELETE comment URL and remove comment from post on success', fakeAsync(() => {
      component.posts = [enrichPost({ comments: [enrichComment()] })];
      component.askDelete(5, 'comment');
      component.executeDelete();

      http.expectOne(`${BASE}/comments/5`).flush(null);
      expect(component.posts[0].comments?.length).toBe(0);
      flush();
    }));

    it('should remove reply from comment.replies when deleting a reply', fakeAsync(() => {
      const reply = enrichComment({ id: 99 });
      component.posts = [enrichPost({
        comments: [enrichComment({ replies: [reply] })]
      })];
      component.askDelete(99, 'comment');
      component.executeDelete();

      http.expectOne(`${BASE}/comments/99`).flush(null);
      expect(component.posts[0].comments?.[0].replies?.length).toBe(0);
      flush();
    }));

    it('should show error toast when delete fails', fakeAsync(() => {
      component.posts = [enrichPost()];
      component.askDelete(1, 'post');
      component.executeDelete();

      http.expectOne(`${BASE}/posts/1`).flush('err', { status: 500, statusText: 'Error' });
      expect(component.toastMsg).toContain('Failed to delete');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 5. LIKE / REACTIONS ON POSTS
  // ══════════════════════════════════════════════════════════════════
  describe('toggleLike', () => {
    it('should POST a new LIKE when post has no existing userLike', () => {
      const post = enrichPost();
      component.toggleLike(post);
      const req = http.expectOne(r => r.url === `${BASE}/likes` && r.method === 'POST');
      req.flush(mockLike);
      expect(post.userLike).toEqual(mockLike);
      expect(post.likes).toContain(mockLike);
    });

    it('should DELETE the existing like when post is already liked', () => {
      const post = enrichPost({ userLike: mockLike, likes: [mockLike] });
      component.toggleLike(post);
      const req = http.expectOne(`${BASE}/likes/${mockLike.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(post.userLike).toBeNull();
      expect(post.likes.length).toBe(0);
    });

    it('should hide reaction picker after unliking', () => {
      const post = enrichPost({ userLike: mockLike, likes: [mockLike], showReactions: true });
      component.toggleLike(post);
      http.expectOne(`${BASE}/likes/${mockLike.id}`).flush(null);
      expect(post.showReactions).toBeFalse();
    });
  });

  describe('reactToPost', () => {
    it('should close reaction picker immediately', () => {
      const post = enrichPost({ showReactions: true });
      component.reactToPost(post, 'LOVE');
      expect(post.showReactions).toBeFalse();
      http.expectOne(r => r.url === `${BASE}/likes` && r.method === 'POST').flush({ ...mockLike, likeType: 'LOVE' });
    });

    it('should POST new like when there is no existing userLike', () => {
      const post = enrichPost();
      component.reactToPost(post, 'HAHA');
      const req = http.expectOne(r => r.url === `${BASE}/likes` && r.method === 'POST');
      req.flush({ ...mockLike, likeType: 'HAHA' });
      expect(post.userLike?.likeType).toBe('HAHA');
    });

    it('should replace existing reaction: DELETE then POST new type', () => {
      const post = enrichPost({ userLike: { ...mockLike, likeType: 'LIKE' }, likes: [mockLike] });
      component.reactToPost(post, 'LOVE');

      http.expectOne(`${BASE}/likes/${mockLike.id}`).flush(null);
      http.expectOne(r => r.url === `${BASE}/likes` && r.method === 'POST')
          .flush({ ...mockLike, likeType: 'LOVE' });

      expect(post.userLike?.likeType).toBe('LOVE');
    });

    it('should show error toast when adding like fails', fakeAsync(() => {
      const post = enrichPost();
      component.reactToPost(post, 'WOW');
      http.expectOne(r => r.url === `${BASE}/likes` && r.method === 'POST')
          .flush('err', { status: 500, statusText: 'Error' });
      expect(component.toastMsg).toContain('Could not react');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 6. COMMENT REACTIONS
  // ══════════════════════════════════════════════════════════════════
  describe('toggleCommentReaction', () => {
    it('should POST LIKE when comment has no existing reaction', () => {
      const comment = enrichComment();
      component.toggleCommentReaction(comment);
      const req = http.expectOne(r => r.url === `${BASE}/comment-reactions` && r.method === 'POST');
      req.flush(mockReaction);
      expect(comment.userReaction).toEqual(mockReaction);
    });

    it('should DELETE reaction when comment already has userReaction', () => {
      const comment = enrichComment({ userReaction: mockReaction, reactions: [mockReaction] });
      component.toggleCommentReaction(comment);
      const req = http.expectOne(`${BASE}/comment-reactions/${mockReaction.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
      expect(comment.userReaction).toBeNull();
      expect(comment.reactions.length).toBe(0);
    });

    it('should hide reaction picker after removing reaction', () => {
      const comment = enrichComment({ userReaction: mockReaction, reactions: [mockReaction], showReactions: true });
      component.toggleCommentReaction(comment);
      http.expectOne(`${BASE}/comment-reactions/${mockReaction.id}`).flush(null);
      expect(comment.showReactions).toBeFalse();
    });
  });

  describe('reactToComment', () => {
    it('should close comment reaction picker immediately', () => {
      const comment = enrichComment({ showReactions: true });
      component.reactToComment(comment, 'HAHA');
      expect(comment.showReactions).toBeFalse();
      http.expectOne(r => r.url === `${BASE}/comment-reactions` && r.method === 'POST').flush(mockReaction);
    });

    it('should replace existing comment reaction: DELETE then POST', () => {
      const comment = enrichComment({ userReaction: mockReaction, reactions: [mockReaction] });
      component.reactToComment(comment, 'WOW');

      http.expectOne(`${BASE}/comment-reactions/${mockReaction.id}`).flush(null);
      http.expectOne(r => r.url === `${BASE}/comment-reactions` && r.method === 'POST')
          .flush({ ...mockReaction, likeType: 'WOW' });

      expect(comment.userReaction?.likeType).toBe('WOW');
    });

    it('should show error toast when adding reaction fails', fakeAsync(() => {
      const comment = enrichComment();
      component.reactToComment(comment, 'SAD');
      http.expectOne(r => r.url === `${BASE}/comment-reactions` && r.method === 'POST')
          .flush('err', { status: 500, statusText: 'Error' });
      expect(component.toastMsg).toContain('Could not react');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 7. COMMENTS
  // ══════════════════════════════════════════════════════════════════
  describe('toggleComments', () => {
    it('should toggle showComments on post', () => {
      const post = enrichPost({ showComments: false });
      component.toggleComments(post);
      expect(post.showComments).toBeTrue();
      component.toggleComments(post);
      expect(post.showComments).toBeFalse();
    });
  });

  describe('submitComment', () => {
    it('should NOT POST when newComment is empty', () => {
      const post = enrichPost({ newComment: '' });
      component.submitComment(post);
      http.expectNone(r => r.url === `${BASE}/comments` && r.method === 'POST');
      expect(post.comments.length).toBe(0);
    });

    it('should NOT POST when newComment is only whitespace', () => {
      const post = enrichPost({ newComment: '   ' });
      component.submitComment(post);
      http.expectNone(r => r.url === `${BASE}/comments` && r.method === 'POST');
      expect(post.comments.length).toBe(0);
    });

    it('should POST comment and append to post.comments on success', () => {
      const post = enrichPost({ newComment: 'Great post!' });
      component.submitComment(post);
      const req = http.expectOne(r => r.url === `${BASE}/comments` && r.method === 'POST');
      req.flush(mockComment);

      expect(post.comments?.length).toBe(1);
      expect(post.comments?.[0].content).toBe('Nice post');
      expect(post.newComment).toBe('');
    });

    it('should initialise enriched fields on the new comment', () => {
      const post = enrichPost({ newComment: 'Wow!' });
      component.submitComment(post);
      http.expectOne(r => r.url === `${BASE}/comments` && r.method === 'POST').flush(mockComment);

      const added = post.comments?.[0] as any;
      expect(added.replies).toEqual([]);
      expect(added.reactions).toEqual([]);
      expect(added.userReaction).toBeNull();
    });

    it('should show error toast when comment submission fails', fakeAsync(() => {
      const post = enrichPost({ newComment: 'Wow!' });
      component.submitComment(post);
      http.expectOne(r => r.url === `${BASE}/comments` && r.method === 'POST')
          .flush('err', { status: 500, statusText: 'Error' });
      expect(component.toastMsg).toContain('Could not post comment');
      flush();
    }));
  });

  describe('submitReply', () => {
    it('should NOT POST when newReply is empty', () => {
      const comment = enrichComment({ newReply: '' });
      component.submitReply(comment);
      http.expectNone(r => r.url.includes('/comments/reply') && r.method === 'POST');
      expect(comment.replies.length).toBe(0);
    });

    it('should NOT POST when newReply is only whitespace', () => {
      const comment = enrichComment({ newReply: '  ' });
      component.submitReply(comment);
      http.expectNone(r => r.url.includes('/comments/reply') && r.method === 'POST');
      expect(comment.replies.length).toBe(0);
    });

    it('should POST reply and append to comment.replies', () => {
      const comment = enrichComment({ newReply: 'Great point!' });
      component.submitReply(comment);
      const req = http.expectOne(r => r.url === `${BASE}/comments/reply` && r.method === 'POST');
      req.flush({ ...mockComment, id: 99, content: 'Great point!' });

      expect(comment.replies?.length).toBe(1);
      expect(comment.newReply).toBe('');
      expect(comment.showReplies).toBeTrue();
    });

    it('should show error toast when reply submission fails', fakeAsync(() => {
      const comment = enrichComment({ newReply: 'Nice!' });
      component.submitReply(comment);
      http.expectOne(r => r.url === `${BASE}/comments/reply` && r.method === 'POST')
          .flush('err', { status: 500, statusText: 'Error' });
      expect(component.toastMsg).toContain('Could not post reply');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 8. HOVER TIMERS
  // ══════════════════════════════════════════════════════════════════
  describe('Hover timers — post reactions', () => {
    it('scheduleHideReactions should set showReactions=false after 500ms', fakeAsync(() => {
      const post: any = { ...mockPost, showReactions: true };
      component.scheduleHideReactions(post);
      tick(500);
      expect(post.showReactions).toBeFalse();
    }));

    it('clearHideTimer should cancel the scheduled hide', fakeAsync(() => {
      const post: any = { ...mockPost, showReactions: true };
      component.scheduleHideReactions(post);
      component.clearHideTimer(post);
      tick(500);
      expect(post.showReactions).toBeTrue();
    }));
  });

  describe('Hover timers — comment reactions', () => {
    it('scheduleHideCommentReactions should set showReactions=false after 500ms', fakeAsync(() => {
      const comment: any = { ...mockComment, showReactions: true };
      component.scheduleHideCommentReactions(comment);
      tick(500);
      expect(comment.showReactions).toBeFalse();
    }));

    it('clearCommentHideTimer should cancel the scheduled hide', fakeAsync(() => {
      const comment: any = { ...mockComment, showReactions: true };
      component.scheduleHideCommentReactions(comment);
      component.clearCommentHideTimer(comment);
      tick(500);
      expect(comment.showReactions).toBeTrue();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 9. HELPERS
  // ══════════════════════════════════════════════════════════════════
  describe('reactionEmoji', () => {
    it('should return correct emoji for each known reaction type', () => {
      expect(component.reactionEmoji('LIKE')).toBe('👍');
      expect(component.reactionEmoji('LOVE')).toBe('❤️');
      expect(component.reactionEmoji('HAHA')).toBe('😂');
      expect(component.reactionEmoji('WOW')).toBe('😮');
      expect(component.reactionEmoji('SAD')).toBe('😢');
      expect(component.reactionEmoji('ANGRY')).toBe('😡');
    });

    it('should fall back to 👍 for unknown type', () => {
      expect(component.reactionEmoji('UNKNOWN')).toBe('👍');
    });
  });

  describe('capitalize', () => {
    it('should uppercase first letter and lowercase the rest', () => {
      expect(component.capitalize('LIKE')).toBe('Like');
      expect(component.capitalize('love')).toBe('Love');
      expect(component.capitalize('hAhA')).toBe('Haha');
    });
  });

  describe('formatTime', () => {
    it('should return empty string for empty input', () => {
      expect(component.formatTime('')).toBe('');
    });

    it('should return "Just now" for a time < 60 seconds ago', () => {
      const date = new Date(Date.now() - 10_000).toISOString();
      expect(component.formatTime(date)).toBe('Just now');
    });

    it('should return "Xm ago" for a time in minutes', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(component.formatTime(date)).toBe('5m ago');
    });

    it('should return "Xh ago" for a time in hours', () => {
      const date = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
      expect(component.formatTime(date)).toBe('3h ago');
    });

    it('should return a localised date string for times older than 24h', () => {
      const date = new Date(Date.now() - 2 * 86400 * 1000).toISOString();
      const result = component.formatTime(date);
      expect(result).not.toContain('ago');
      expect(result).not.toBe('Just now');
    });
  });

  describe('getReactionSummary', () => {
    it('should return empty array when no likes', () => {
      expect(component.getReactionSummary([])).toEqual([]);
    });

    it('should group likes by type and count them', () => {
      const likes = [
        { ...mockLike, id: 1, likeType: 'LIKE' },
        { ...mockLike, id: 2, likeType: 'LIKE' },
        { ...mockLike, id: 3, likeType: 'LOVE' },
      ];
      const summary = component.getReactionSummary(likes);
      expect(summary.length).toBe(2);
      expect(summary.find(s => s.emoji === '👍')?.count).toBe(2);
      expect(summary.find(s => s.emoji === '❤️')?.count).toBe(1);
    });
  });

  describe('getCommentReactionSummary', () => {
    it('should return empty array when no reactions', () => {
      expect(component.getCommentReactionSummary([])).toEqual([]);
    });

    it('should group reactions by type and count them', () => {
      const reactions = [
        { ...mockReaction, id: 1, likeType: 'LOVE' },
        { ...mockReaction, id: 2, likeType: 'LOVE' },
        { ...mockReaction, id: 3, likeType: 'HAHA' },
      ];
      const summary = component.getCommentReactionSummary(reactions);
      expect(summary.length).toBe(2);
      expect(summary.find(s => s.emoji === '❤️')?.count).toBe(2);
      expect(summary.find(s => s.emoji === '😂')?.count).toBe(1);
    });
  });

  // ══════════════════════════════════════════════════════════════════
  // 10. SHARE
  // ══════════════════════════════════════════════════════════════════
  describe('sharePost', () => {
    it('should write to clipboard and show success toast', fakeAsync(() => {
      const post = enrichPost();
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      component.sharePost(post);
      tick(); // resolve clipboard promise
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(component.toastMsg).toContain('Link copied');
      flush();
    }));

    it('should show error toast when clipboard write fails', fakeAsync(() => {
      const post = enrichPost();
      spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.reject(new Error('denied')));
      component.sharePost(post);
      tick();
      expect(component.toastMsg).toContain('Could not copy link');
      flush();
    }));
  });

  // ══════════════════════════════════════════════════════════════════
  // 11. TEMPLATE — rendering
  // ══════════════════════════════════════════════════════════════════
  describe('Template — rendering', () => {
    it('should render the page header with "Community"', () => {
      const h1 = fixture.debugElement.query(By.css('.page-header h1'));
      expect(h1.nativeElement.textContent).toContain('Community');
    });

    it('should show loading indicator when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      const loading = fixture.debugElement.query(By.css('.loading'));
      expect(loading).toBeTruthy();
    });

    it('should show empty state when no posts and not loading', () => {
      component.posts = [];
      component.loading = false;
      fixture.detectChanges();
      const empty = fixture.debugElement.query(By.css('.empty'));
      expect(empty).toBeTruthy();
    });

    it('should NOT show empty state when posts exist', () => {
      component.posts = [enrichPost()];
      component.loading = false;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.empty'))).toBeFalsy();
    });

    it('should render one card per post', () => {
      component.posts = [enrichPost(), enrichPost({ id: 2 })];
      component.loading = false;
      fixture.detectChanges();
      const cards = fixture.debugElement.queryAll(By.css('.post-card'));
      expect(cards.length).toBe(2);
    });

    it('post button should be disabled when newPostContent is empty', () => {
      component.newPostContent = '';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.post-btn'));
      expect(btn.nativeElement.disabled).toBeTrue();
    });

    it('post button should be enabled when newPostContent has content', () => {
      component.newPostContent = 'Something';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.post-btn'));
      expect(btn.nativeElement.disabled).toBeFalse();
    });

    it('should show delete (✕) button only on posts owned by the current user', () => {
      component.posts = [
        enrichPost({ userId: 1 }),
        enrichPost({ id: 2, userId: 99 }),
      ];
      component.loading = false;
      fixture.detectChanges();
      const menuBtns = fixture.debugElement.queryAll(By.css('.post-menu'));
      expect(menuBtns.length).toBe(1);
    });

    it('should show toast when toastMsg is set', () => {
      component.toastMsg  = 'Hello toast';
      component.toastType = 'success';
      fixture.detectChanges();
      const toast = fixture.debugElement.query(By.css('.toast'));
      expect(toast).toBeTruthy();
      expect(toast.nativeElement.textContent.trim()).toBe('Hello toast');
    });

    it('should NOT show toast when toastMsg is empty', () => {
      component.toastMsg = '';
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.toast'))).toBeFalsy();
    });

    it('should show delete confirm modal when confirmTarget is set', () => {
      component.confirmTarget = 1;
      component.confirmType   = 'post';
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.confirm-overlay'))).toBeTruthy();
    });

    it('should NOT show delete confirm modal when confirmTarget is null', () => {
      component.confirmTarget = null;
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.confirm-overlay'))).toBeFalsy();
    });

    it('should show comments section when post.showComments is true', () => {
      component.posts = [enrichPost({ showComments: true, comments: [] })];
      component.loading = false;
      fixture.detectChanges();
      const section = fixture.debugElement.query(By.css('.comments-section'));
      expect(section).toBeTruthy();
    });

    it('should NOT show comments section when post.showComments is false', () => {
      component.posts = [enrichPost({ showComments: false })];
      component.loading = false;
      fixture.detectChanges();
      const section = fixture.debugElement.query(By.css('.comments-section'));
      expect(section).toBeFalsy();
    });
  });
});
