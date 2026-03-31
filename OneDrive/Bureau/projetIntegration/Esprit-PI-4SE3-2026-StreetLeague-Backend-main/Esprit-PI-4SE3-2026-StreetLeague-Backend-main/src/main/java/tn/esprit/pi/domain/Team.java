package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.domain.GestionTournoi.Tournament;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String logo;
    private LocalDateTime createdAt;
    
    @Enumerated(EnumType.STRING)
    private SportType sportType;
    
    @ManyToMany
    @JoinTable(name = "team_player",
        joinColumns = @JoinColumn(name = "team_id"),
        inverseJoinColumns = @JoinColumn(name = "player_id"))
    private Set<PlayerProfile> playerProfiles;
    
    @ManyToOne
    @JoinColumn(name = "coach_id")
    private CoachProfile coachProfile;
    
    @ManyToMany(mappedBy = "teams")
    private Set<Match> matches;
    
    @ManyToMany(mappedBy = "teams")
    private Set<Tournament> tournaments;
    
    @OneToMany(mappedBy = "team")
    private Set<Sponsorship> sponsorships;
}
