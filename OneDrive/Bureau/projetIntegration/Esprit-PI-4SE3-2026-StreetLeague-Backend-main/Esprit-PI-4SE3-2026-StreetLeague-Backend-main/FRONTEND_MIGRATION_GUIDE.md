# Frontend Migration Guide - Backend API Changes

## 🔴 BREAKING CHANGES - Action Required

The backend has migrated from **inheritance-based user system** to **single user table + profile system**. All frontend code interacting with user data must be updated.

---

## 📋 What Changed

### Old Structure (Before):
```
User types were separate entities:
- Coach (with certificate, experienceYears, specialty)
- Player (with dateOfBirth, level)
- Sponsor (with companyName, budget)
- etc.
```

### New Structure (Now):
```
Single User entity + separate Profile entities:
- User (id, email, username, role, phone, address)
- CoachProfile (certificate, experienceYears, specialty)
- PlayerProfile (dateOfBirth, level)
- SponsorProfile (companyName, budget)
- etc.
```

---

## 🔧 API Changes

### 1. Registration (No Changes Needed ✅)

**Endpoint:** `POST /auth/register`

Still works the same way:
```json
{
  "fullName": "John Coach",
  "email": "coach@test.com",
  "password": "password123",
  "role": "COACH",
  "certificate": "UEFA A",
  "specialty": "Youth Development",
  "experienceYears": 5
}
```

### 2. Login (No Changes Needed ✅)

**Endpoint:** `POST /auth/login`

Still returns:
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "coach@test.com",
  "role": "ROLE_COACH"
}
```

### 3. Get Profile (⚠️ RESPONSE CHANGED)

**Endpoint:** `GET /sponsors/my-profile`

#### Old Response:
```json
{
  "id": 1,
  "email": "sponsor@test.com",
  "username": "Nike Inc",
  "role": "SPONSOR",
  "companyName": "Nike",
  "logo": "nike-logo.png",
  "contactEmail": "contact@nike.com",
  "budget": 100000.0
}
```

#### New Response:
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "email": "sponsor@test.com",
    "username": "Nike Inc",
    "role": "SPONSOR",
    "phone": null,
    "address": null
  },
  "companyName": "Nike",
  "logo": "nike-logo.png",
  "contactEmail": "contact@nike.com",
  "budget": 100000.0
}
```

### 4. Update Profile (⚠️ REQUEST CHANGED)

**Endpoint:** `PUT /sponsors/update`

#### Old Request:
```json
{
  "companyName": "Nike Updated",
  "logo": "new-logo.png",
  "contactEmail": "new@nike.com",
  "budget": 150000.0,
  "email": "sponsor@test.com",
  "username": "Nike Inc"
}
```

#### New Request (Profile data only):
```json
{
  "companyName": "Nike Updated",
  "logo": "new-logo.png",
  "contactEmail": "new@nike.com",
  "budget": 150000.0
}
```

**Note:** User data (email, username, phone) should be updated via a separate user endpoint (if needed).

---

## 🔨 Frontend Code Updates

### TypeScript/Angular Models

#### Before:
```typescript
export interface Sponsor {
  id: number;
  email: string;
  username: string;
  role: string;
  companyName: string;
  logo: string;
  contactEmail: string;
  budget: number;
}
```

#### After:
```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  phone?: string;
  address?: string;
  enabled: boolean;
  createdAt: string;
}

export interface SponsorProfile {
  id: number;
  user: User;
  companyName: string;
  logo: string;
  contactEmail: string;
  budget: number;
}

export interface CoachProfile {
  id: number;
  user: User;
  certificate: string;
  experienceYears: number;
  specialty: string;
  verified: boolean;
}

export interface PlayerProfile {
  id: number;
  user: User;
  dateOfBirth: string;
  level: string;
}
```

### Service Updates

#### Before:
```typescript
getSponsorProfile(): Observable<Sponsor> {
  return this.http.get<Sponsor>(`${API_URL}/sponsors/my-profile`);
}

updateSponsor(sponsor: Sponsor): Observable<Sponsor> {
  return this.http.put<Sponsor>(`${API_URL}/sponsors/update`, sponsor);
}
```

#### After:
```typescript
getSponsorProfile(): Observable<SponsorProfile> {
  return this.http.get<SponsorProfile>(`${API_URL}/sponsors/my-profile`);
}

updateSponsorProfile(profile: Partial<SponsorProfile>): Observable<SponsorProfile> {
  // Only send profile fields, not user fields
  const profileData = {
    companyName: profile.companyName,
    logo: profile.logo,
    contactEmail: profile.contactEmail,
    budget: profile.budget
  };
  return this.http.put<SponsorProfile>(`${API_URL}/sponsors/update`, profileData);
}
```

### Component Updates

#### Before:
```typescript
export class SponsorProfileComponent implements OnInit {
  sponsor: Sponsor;

  ngOnInit() {
    this.sponsorService.getSponsorProfile().subscribe(data => {
      this.sponsor = data;
      console.log(this.sponsor.email);
      console.log(this.sponsor.companyName);
    });
  }

  updateProfile() {
    this.sponsorService.updateSponsor(this.sponsor).subscribe();
  }
}
```

#### After:
```typescript
export class SponsorProfileComponent implements OnInit {
  profile: SponsorProfile;

  ngOnInit() {
    this.sponsorService.getSponsorProfile().subscribe(data => {
      this.profile = data;
      console.log(this.profile.user.email);        // ⚠️ Changed
      console.log(this.profile.companyName);       // ✅ Same
    });
  }

  updateProfile() {
    // Only send profile data
    const profileUpdate = {
      companyName: this.profile.companyName,
      logo: this.profile.logo,
      contactEmail: this.profile.contactEmail,
      budget: this.profile.budget
    };
    this.sponsorService.updateSponsorProfile(profileUpdate).subscribe();
  }
}
```

### Template Updates

#### Before:
```html
<div class="profile">
  <h2>{{ sponsor.username }}</h2>
  <p>Email: {{ sponsor.email }}</p>
  <p>Company: {{ sponsor.companyName }}</p>
  <p>Budget: {{ sponsor.budget }}</p>
</div>
```

#### After:
```html
<div class="profile">
  <h2>{{ profile.user.username }}</h2>
  <p>Email: {{ profile.user.email }}</p>
  <p>Company: {{ profile.companyName }}</p>
  <p>Budget: {{ profile.budget }}</p>
</div>
```

---

## 🎯 Quick Migration Checklist

### For Each User Role (Coach, Player, Sponsor, etc.):

- [ ] Update TypeScript interfaces/models
- [ ] Update service methods
- [ ] Update component properties (e.g., `sponsor` → `profile`)
- [ ] Update template bindings (e.g., `sponsor.email` → `profile.user.email`)
- [ ] Update form submissions (only send profile data)
- [ ] Test profile retrieval
- [ ] Test profile updates

---

## 📝 All Profile Types

### 1. Coach Profile
```typescript
interface CoachProfile {
  id: number;
  user: User;
  certificate: string;
  experienceYears: number;
  specialty: string;
  verified: boolean;
}
```

### 2. Player Profile
```typescript
interface PlayerProfile {
  id: number;
  user: User;
  dateOfBirth: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
}
```

### 3. Referee Profile
```typescript
interface RefereeProfile {
  id: number;
  user: User;
  certificate: string;
  experienceYears: number;
  licenseNumber: string;
  verified: boolean;
}
```

### 4. Health Professional Profile
```typescript
interface HealthProfessionalProfile {
  id: number;
  user: User;
  certificate: string;
  specialty: string;
  licenseNumber: string;
  verified: boolean;
}
```

### 5. Sponsor Profile
```typescript
interface SponsorProfile {
  id: number;
  user: User;
  companyName: string;
  logo: string;
  contactEmail: string;
  budget: number;
}
```

### 6. Venue Owner Profile
```typescript
interface VenueOwnerProfile {
  id: number;
  user: User;
  companyName: string;
  phone: string;
  verified: boolean;
}
```

### 7. Admin Profile
```typescript
interface AdminProfile {
  id: number;
  user: User;
  roleLevel: number;
}
```

---

## 🔍 Common Patterns

### Accessing User Data:
```typescript
// Before
const email = sponsor.email;
const username = sponsor.username;

// After
const email = profile.user.email;
const username = profile.user.username;
```

### Accessing Profile Data:
```typescript
// Before
const company = sponsor.companyName;
const budget = sponsor.budget;

// After (Same!)
const company = profile.companyName;
const budget = profile.budget;
```

### Updating Profile:
```typescript
// Before - sent everything
updateSponsor({
  id: 1,
  email: "sponsor@test.com",
  username: "Nike",
  companyName: "Nike Inc",
  budget: 100000
});

// After - only profile fields
updateSponsorProfile({
  companyName: "Nike Inc",
  budget: 100000
});
```

---

## 🚨 Important Notes

1. **User data is read-only in profile endpoints** - To update email/username/phone, you'll need a separate user update endpoint (not implemented yet, request if needed)

2. **Profile ID = User ID** - They share the same ID due to @MapsId annotation

3. **Authentication unchanged** - JWT tokens work exactly the same

4. **Role checking unchanged** - Still use `user.role` or `ROLE_COACH` format

5. **Nested user object** - All profiles now have a `user` property containing user data

---

## 🧪 Testing Endpoints

### Get Profile:
```bash
GET /sponsors/my-profile
Authorization: Bearer <token>
```

### Update Profile:
```bash
PUT /sponsors/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Updated Company",
  "budget": 200000
}
```

### Get All Sponsors (Admin):
```bash
GET /sponsors
Authorization: Bearer <admin-token>
```

---

## ❓ FAQ

**Q: Do I need to change registration forms?**
A: No, registration API is unchanged.

**Q: Do I need to change login?**
A: No, login API is unchanged.

**Q: Can I update user email from profile endpoint?**
A: No, profile endpoints only update profile data. Request a user update endpoint if needed.

**Q: What if I have cached user data?**
A: Clear cache and refetch. The structure is different.

**Q: Do I need to update localStorage/sessionStorage?**
A: Yes, if you're storing user objects. Update the structure.

---

## 📞 Need Help?

If you encounter issues:
1. Check the new response structure in browser DevTools
2. Verify you're accessing `profile.user.email` not `profile.email`
3. Ensure update requests only send profile fields
4. Test with Postman first to see exact API responses

---

## ✅ Summary

**Main Change:** User data is now nested under `profile.user` instead of being at the root level.

**Quick Fix Pattern:**
```typescript
// Find and replace in your code:
sponsor.email        → profile.user.email
sponsor.username     → profile.user.username
sponsor.role         → profile.user.role
sponsor.companyName  → profile.companyName  (unchanged)
```

Good luck with the migration! 🚀
