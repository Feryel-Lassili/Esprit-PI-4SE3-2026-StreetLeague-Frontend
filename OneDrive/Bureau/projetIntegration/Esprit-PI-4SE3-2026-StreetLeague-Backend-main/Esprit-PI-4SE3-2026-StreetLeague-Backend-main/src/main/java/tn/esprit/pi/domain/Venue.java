package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String address;
    private Double pricePerHour;
    private Integer capacity;
    
    @Enumerated(EnumType.STRING)
    private SportType sportType;
    
    @ManyToOne
    @JoinColumn(name = "venue_owner_id")
    private VenueOwnerProfile venueOwnerProfile;
    
    @OneToMany(mappedBy = "venue")
    private Set<Reservation> reservations;
    
    @OneToMany(mappedBy = "venue")
    private Set<Sponsorship> sponsorships;
}
