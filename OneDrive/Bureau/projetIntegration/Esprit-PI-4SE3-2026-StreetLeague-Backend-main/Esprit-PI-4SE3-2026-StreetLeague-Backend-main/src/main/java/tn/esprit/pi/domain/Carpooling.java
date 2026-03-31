package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Carpooling {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String route;
    private LocalDate date;
    private LocalTime departureTime;
    
    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;
    
    @ManyToMany
    @JoinTable(name = "carpooling_participant",
        joinColumns = @JoinColumn(name = "carpooling_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> participants;
}
