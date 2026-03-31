package tn.esprit.pi.domain.GestionTournoi;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.CoachProfile;
import tn.esprit.pi.domain.PlayerProfile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Training {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime date;
    private String location;

    private String description;
    private Integer maxParticipants;

    // 🔥 optionnel
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @ManyToOne
    private CoachProfile coachProfile;

    // 🔥 participants
    @ManyToMany
    @JoinTable(name = "training_player",
            joinColumns = @JoinColumn(name = "training_id"),
            inverseJoinColumns = @JoinColumn(name = "player_id"))
    private Set<PlayerProfile> participantProfiles = new HashSet<>();


    // ===============================
    // 🔥 LOGIQUE MÉTIER
    // ===============================

    public void setEvent(Event event) {
        if (this.event != null) {
            this.event.getTrainings().remove(this);
        }

        this.event = event;

        if (event != null) {
            event.getTrainings().add(this);
        }
    }

    public void addParticipant(PlayerProfile player) {
        if (participantProfiles.size() >= maxParticipants) {
            throw new RuntimeException("Training is full");
        }
        participantProfiles.add(player);
    }

    public void removeParticipant(PlayerProfile player) {
        participantProfiles.remove(player);
    }
}