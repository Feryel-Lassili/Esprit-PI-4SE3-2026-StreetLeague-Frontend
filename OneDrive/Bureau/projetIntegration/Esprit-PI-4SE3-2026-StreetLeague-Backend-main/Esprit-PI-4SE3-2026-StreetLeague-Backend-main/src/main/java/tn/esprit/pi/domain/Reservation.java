package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.GestionTournoi.Event;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDateTime date;
    private Integer duration;
    private Double price;
    
    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
    
    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
}
