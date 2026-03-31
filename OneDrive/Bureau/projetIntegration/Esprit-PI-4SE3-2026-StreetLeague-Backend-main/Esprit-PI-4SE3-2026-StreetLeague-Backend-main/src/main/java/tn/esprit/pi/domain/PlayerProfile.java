package tn.esprit.pi.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.GestionTournoi.Training;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfile {
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"sponsorProfile", "coachProfile", "playerProfile", "refereeProfile", "healthProfessionalProfile", "venueOwnerProfile", "adminProfile", "wallet", "badges", "posts", "comments", "likes", "carts", "cars", "virtualTeams", "ownedPlayers", "rewards", "reservations", "password"})
    private User user;
    
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    private PlayerLevel level;
    
    @OneToOne(mappedBy = "playerProfile", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"playerProfile"})
    private MedicalRecord medicalRecord;
    
    @ManyToMany(mappedBy = "playerProfiles")
    @JsonIgnoreProperties({"playerProfiles"})
    private Set<Team> teams;
    
    @ManyToMany(mappedBy = "participantProfiles")
    @JsonIgnoreProperties({"participantProfiles"})
    private Set<Training> trainings;
}
