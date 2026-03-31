package tn.esprit.pi.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SponsorProfile {
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"sponsorProfile", "coachProfile", "playerProfile", "refereeProfile", "healthProfessionalProfile", "venueOwnerProfile", "adminProfile", "wallet", "badges", "posts", "comments", "likes", "carts", "cars", "virtualTeams", "ownedPlayers", "rewards", "reservations", "password"})
    private User user;
    
    private String companyName;
    private String logo;
    private String contactEmail;
    private Double budget;
    
    @OneToMany(mappedBy = "sponsorProfile")
    @JsonIgnoreProperties({"sponsorProfile"})
    private Set<Sponsorship> sponsorships;
}
