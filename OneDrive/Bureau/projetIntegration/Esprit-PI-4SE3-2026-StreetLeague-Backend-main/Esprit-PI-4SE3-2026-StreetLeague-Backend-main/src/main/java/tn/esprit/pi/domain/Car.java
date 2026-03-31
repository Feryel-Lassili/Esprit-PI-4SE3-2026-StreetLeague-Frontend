package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String model;
    private Integer seats;
    private Integer availableSeats;
    private String plateNumber;
    
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private User driver;
    
    @OneToMany(mappedBy = "car")
    private Set<Carpooling> carpoolings;
}
