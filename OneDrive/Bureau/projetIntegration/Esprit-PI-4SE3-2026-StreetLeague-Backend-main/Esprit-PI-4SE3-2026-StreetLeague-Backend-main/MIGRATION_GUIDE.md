# Migration Guide: Single User Table + Profile Tables

## ✅ Completed Steps

### 1. Domain Layer - DONE
- ✅ Created `User` entity (replaces AppUser)
- ✅ Created 7 Profile entities:
  - `CoachProfile`
  - `PlayerProfile`
  - `RefereeProfile`
  - `HealthProfessionalProfile`
  - `SponsorProfile`
  - `VenueOwnerProfile`
  - `AdminProfile`
- ✅ Updated all related entities to reference profiles instead of role entities

### 2. Updated Entities
- ✅ Team → references CoachProfile, PlayerProfile
- ✅ Training → references CoachProfile, PlayerProfile
- ✅ Match → references RefereeProfile
- ✅ MedicalRecord → references PlayerProfile, HealthProfessionalProfile
- ✅ Sponsorship → references SponsorProfile
- ✅ Venue → references VenueOwnerProfile
- ✅ Wallet, Post, Comment, Like, Cart → reference User
- ✅ Car, VirtualTeam, OwnedPlayer, Reward, Reservation → reference User

---

## 🔄 Next Steps (What YOU Need to Do)

### Step 3: Update Repositories
You need to update/create repositories for the new structure.

**Location**: `src/main/java/tn/esprit/pi/repository/`

#### Create New Repositories:
```java
// UserRepository.java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
}

// CoachProfileRepository.java
public interface CoachProfileRepository extends JpaRepository<CoachProfile, Long> {
    Optional<CoachProfile> findByUserId(Long userId);
}

// PlayerProfileRepository.java
public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, Long> {
    Optional<PlayerProfile> findByUserId(Long userId);
}

// RefereeProfileRepository.java
public interface RefereeProfileRepository extends JpaRepository<RefereeProfile, Long> {
    Optional<RefereeProfile> findByUserId(Long userId);
}

// HealthProfessionalProfileRepository.java
public interface HealthProfessionalProfileRepository extends JpaRepository<HealthProfessionalProfile, Long> {
    Optional<HealthProfessionalProfile> findByUserId(Long userId);
}

// SponsorProfileRepository.java
public interface SponsorProfileRepository extends JpaRepository<SponsorProfile, Long> {
    Optional<SponsorProfile> findByUserId(Long userId);
}

// VenueOwnerProfileRepository.java
public interface VenueOwnerProfileRepository extends JpaRepository<VenueOwnerProfile, Long> {
    Optional<VenueOwnerProfile> findByUserId(Long userId);
}

// AdminProfileRepository.java
public interface AdminProfileRepository extends JpaRepository<AdminProfile, Long> {
    Optional<AdminProfile> findByUserId(Long userId);
}
```

#### Delete Old Repositories:
- ❌ Delete `AppUserRepository.java`
- ❌ Delete `CoachRepository.java`
- ❌ Delete `PlayerRepository.java`
- ❌ Delete `RefereeRepository.java`
- ❌ Delete `HealthProfessionalRepository.java`
- ❌ Delete `SponsorRepository.java`
- ❌ Delete `VenueOwnerRepository.java`
- ❌ Delete `AdminRepository.java`

---

### Step 4: Update Services

**Location**: `src/main/java/tn/esprit/pi/service/`

#### Example: AuthService (Registration)
```java
@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CoachProfileRepository coachProfileRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public User registerCoach(CoachRegistrationDto dto) {
        // Create User
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.COACH);
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        
        // Create CoachProfile
        CoachProfile profile = new CoachProfile();
        profile.setUser(savedUser);
        profile.setCertificate(dto.getCertificate());
        profile.setExperienceYears(dto.getExperienceYears());
        profile.setSpecialty(dto.getSpecialty());
        profile.setVerified(false);
        
        coachProfileRepository.save(profile);
        
        return savedUser;
    }
}
```

#### Update All Services:
- Update `CoachService` → use `UserRepository` + `CoachProfileRepository`
- Update `PlayerService` → use `UserRepository` + `PlayerProfileRepository`
- Update `RefereeService` → use `UserRepository` + `RefereeProfileRepository`
- Update `HealthProfessionalService` → use `UserRepository` + `HealthProfessionalProfileRepository`
- Update `SponsorService` → use `UserRepository` + `SponsorProfileRepository`
- Update `VenueOwnerService` → use `UserRepository` + `VenueOwnerProfileRepository`
- Update `AdminService` → use `UserRepository` + `AdminProfileRepository`

---

### Step 5: Update Security Configuration

**Location**: `src/main/java/tn/esprit/pi/security/`

#### Update UserDetailsService:
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        return org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail())
            .password(user.getPassword())
            .authorities("ROLE_" + user.getRole().name())
            .build();
    }
}
```

#### Update JWT Token Generation:
```java
public String generateToken(User user) {
    return Jwts.builder()
        .setSubject(user.getEmail())
        .claim("role", user.getRole().name())
        .claim("userId", user.getId())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
        .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
        .compact();
}
```

---

### Step 6: Update Controllers

**Location**: `src/main/java/tn/esprit/pi/controller/`

#### Example: CoachController
```java
@RestController
@RequestMapping("/coach")
public class CoachController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CoachProfileRepository coachProfileRepository;
    
    @GetMapping("/profile")
    public ResponseEntity<CoachProfile> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        CoachProfile profile = coachProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Coach profile not found"));
        
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<CoachProfile> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CoachProfileDto dto) {
        User user = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        CoachProfile profile = coachProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new RuntimeException("Coach profile not found"));
        
        profile.setCertificate(dto.getCertificate());
        profile.setExperienceYears(dto.getExperienceYears());
        profile.setSpecialty(dto.getSpecialty());
        
        return ResponseEntity.ok(coachProfileRepository.save(profile));
    }
}
```

---

### Step 7: Database Migration

#### Option A: Fresh Start (Development Only)
```sql
-- Drop all old tables
DROP TABLE IF EXISTS coach;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS referee;
DROP TABLE IF EXISTS health_professional;
DROP TABLE IF EXISTS sponsor;
DROP TABLE IF EXISTS venue_owner;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS app_user;

-- Let JPA create new tables
-- Just run the application with spring.jpa.hibernate.ddl-auto=create
```

#### Option B: Migrate Existing Data (Production)
```sql
-- 1. Create new users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255),
    phone VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50),
    enabled BOOLEAN,
    address VARCHAR(255),
    rank INT,
    created_at DATETIME
);

-- 2. Migrate data from app_user to users
INSERT INTO users (id, username, phone, email, password, role, enabled, address, rank, created_at)
SELECT id, username, phone, email, password, role, enabled, address, rank, created_at
FROM app_user;

-- 3. Create profile tables
CREATE TABLE coach_profile (
    user_id BIGINT PRIMARY KEY,
    certificate VARCHAR(255),
    experience_years INT,
    specialty VARCHAR(255),
    verified BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Migrate coach data
INSERT INTO coach_profile (user_id, certificate, experience_years, specialty, verified)
SELECT id, certificate, experience_years, specialty, verified
FROM coach;

-- Repeat for all other profile tables...

-- 5. Update foreign keys in related tables
ALTER TABLE team MODIFY COLUMN coach_id BIGINT;
ALTER TABLE team ADD CONSTRAINT fk_team_coach FOREIGN KEY (coach_id) REFERENCES coach_profile(user_id);

-- Repeat for all relationships...

-- 6. Drop old tables
DROP TABLE coach;
DROP TABLE player;
-- etc...
```

---

### Step 8: Update application.properties

```properties
# Change table naming if needed
spring.jpa.hibernate.ddl-auto=update

# For fresh start (development only):
# spring.jpa.hibernate.ddl-auto=create-drop
```

---

### Step 9: Testing Checklist

- [ ] Test user registration for each role
- [ ] Test user login and JWT generation
- [ ] Test profile retrieval for each role
- [ ] Test profile updates
- [ ] Test relationships (Team → Coach, Match → Referee, etc.)
- [ ] Test authorization (role-based access)
- [ ] Test existing features (posts, comments, wallet, etc.)

---

## 📝 Summary of Changes

### Before (Inheritance):
```
AppUser (base)
├── Coach extends AppUser
├── Player extends AppUser
├── Referee extends AppUser
└── ... (5 more)
```

### After (Composition):
```
User (single table)
├── CoachProfile (one-to-one)
├── PlayerProfile (one-to-one)
├── RefereeProfile (one-to-one)
└── ... (5 more profiles)
```

### Benefits:
✅ Faster authentication (no joins on login)
✅ Cleaner user management
✅ Easier to add new roles
✅ Better separation of concerns

### Trade-offs:
⚠️ More repositories to manage
⚠️ Need to fetch profile separately
⚠️ Migration effort required

---

## 🚨 Important Notes

1. **Don't delete old entities yet** - Keep them until migration is complete
2. **Test thoroughly** - This is a major structural change
3. **Backup database** - Before running migration scripts
4. **Update DTOs** - Create separate DTOs for User and Profiles
5. **Update frontend** - API responses will change structure

---

## Need Help?

If you encounter issues:
1. Check entity relationships are correct
2. Verify repository methods
3. Test with Postman before frontend integration
4. Check database constraints and foreign keys
