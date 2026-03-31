package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String phone;
    private String email;
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;
    
    private Boolean enabled;
    private String address;
    private Integer rank;
    private LocalDateTime createdAt;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Wallet wallet;
    
    @ManyToMany
    @JoinTable(name = "user_badge",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "badge_id"))
    private Set<Badge> badges;
    
    @OneToMany(mappedBy = "user")
    private Set<Post> posts;
    
    @OneToMany(mappedBy = "user")
    private Set<Comment> comments;
    
    @OneToMany(mappedBy = "user")
    private Set<Like> likes;
    
    @OneToMany(mappedBy = "user")
    private Set<Cart> carts;
    
    @OneToMany(mappedBy = "driver")
    private Set<Car> cars;
    
    @OneToMany(mappedBy = "user")
    private Set<VirtualTeam> virtualTeams;
    
    @OneToMany(mappedBy = "user")
    private Set<OwnedPlayer> ownedPlayers;
    
    @OneToMany(mappedBy = "user")
    private Set<Reward> rewards;
    
    @OneToMany(mappedBy = "user")
    private Set<Reservation> reservations;
    
    // Profile relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private CoachProfile coachProfile;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private PlayerProfile playerProfile;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private RefereeProfile refereeProfile;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private HealthProfessionalProfile healthProfessionalProfile;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private SponsorProfile sponsorProfile;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private VenueOwnerProfile venueOwnerProfile;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private AdminProfile adminProfile;
}
