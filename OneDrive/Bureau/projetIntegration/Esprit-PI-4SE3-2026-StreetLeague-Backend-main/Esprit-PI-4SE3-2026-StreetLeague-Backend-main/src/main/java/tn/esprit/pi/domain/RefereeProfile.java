package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.GestionTournoi.Match;

import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefereeProfile {
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    private String certificate;
    private Integer experienceYears;
    private String licenseNumber;
    private Boolean verified;
    
    @OneToMany(mappedBy = "refereeProfile")
    private Set<Match> matches;
}
