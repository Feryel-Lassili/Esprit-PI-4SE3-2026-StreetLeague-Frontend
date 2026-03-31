package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VenueOwnerProfile {
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    private String companyName;
    private String phone;
    private Boolean verified;
    
    @OneToMany(mappedBy = "venueOwnerProfile")
    private Set<Venue> venues;
}
