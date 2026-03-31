package tn.esprit.pi.domain.GestionTournoi;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime date;
    private String location;
    private String description;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    // 🔥 Matchs liés à cet event
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<Match> matches = new HashSet<>();

    // 🔥 Trainings liés à cet event
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private Set<Training> trainings = new HashSet<>();


    // ===============================
    // 🔥 LOGIQUE MÉTIER
    // ===============================

    public void addMatch(Match match) {
        matches.add(match);
        match.setEvent(this);
    }

    public void removeMatch(Match match) {
        matches.remove(match);
        match.setEvent(null);
    }

    public void addTraining(Training training) {
        trainings.add(training);
        training.setEvent(this);
    }

    public void removeTraining(Training training) {
        trainings.remove(training);
        training.setEvent(null);
    }
}