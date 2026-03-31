package tn.esprit.pi.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.GestionTournoi.Training;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CoachProfile {
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"sponsorProfile", "coachProfile", "playerProfile", "refereeProfile", "healthProfessionalProfile", "venueOwnerProfile", "adminProfile", "wallet", "badges", "posts", "comments", "likes", "carts", "cars", "virtualTeams", "ownedPlayers", "rewards", "reservations", "password"})
    private User user;
    
    private String certificate;
    private Integer experienceYears;
    private String specialty;
    private Boolean verified;
    
    @OneToMany(mappedBy = "coachProfile")
    @JsonIgnoreProperties({"coachProfile"})
    private Set<Team> teams;
    
    @OneToMany(mappedBy = "coachProfile")
    @JsonIgnoreProperties({"coachProfile"})
    private Set<Training> trainings;
}
