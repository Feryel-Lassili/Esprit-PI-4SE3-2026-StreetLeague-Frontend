package tn.esprit.pi.domain.GestionTournoi;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.PlayerProfile;
import tn.esprit.pi.domain.RefereeProfile;
import tn.esprit.pi.domain.Team;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sport_match")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime date;
    private String location;
    private String score;

    // 🔥 EVENT (optionnel)
    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    // 🔥 TOURNAMENT (optionnel)
    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    // 🔥 équipes
    @ManyToMany
    @JoinTable(name = "match_team",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "team_id"))
    private Set<Team> teams = new HashSet<>();

    // 🔥 joueurs participants
    @ManyToMany
    @JoinTable(name = "match_player",
            joinColumns = @JoinColumn(name = "match_id"),
            inverseJoinColumns = @JoinColumn(name = "player_id"))
    private Set<PlayerProfile> players = new HashSet<>();
    @ManyToOne
    @JoinColumn(name = "referee_id")
    private RefereeProfile refereeProfile;

    // ===============================
    // 🔥 LOGIQUE MÉTIER
    // ===============================

    // 🔥 Lier à un tournoi (cohérence bidirectionnelle)
    public void setTournament(Tournament tournament) {

        // retirer ancien lien
        if (this.tournament != null) {
            this.tournament.getMatches().remove(this);
        }

        this.tournament = tournament;

        if (tournament != null) {
            if (tournament.getMatches() == null) {
                tournament.setMatches(new HashSet<>());
            }

            tournament.getMatches().add(this);
        }
    }

    // 🔥 Lier à un event (optionnel)
    public void setEvent(Event event) {

        if (this.event != null) {
            this.event.getMatches().remove(this);
        }

        this.event = event;

        if (event != null) {
            if (event.getMatches() == null) {
                event.setMatches(new HashSet<>());
            }

            event.getMatches().add(this);
        }
    }

    // 🔥 Ajouter un joueur
    public void addPlayer(PlayerProfile player) {
        this.players.add(player);
    }

    // 🔥 Retirer un joueur
    public void removePlayer(PlayerProfile player) {
        this.players.remove(player);
    }

    // 🔥 Ajouter une équipe
    public void addTeam(Team team) {
        this.teams.add(team);
    }

    // 🔥 Retirer une équipe
    public void removeTeam(Team team) {
        this.teams.remove(team);
    }
    public void setRefereeProfile(RefereeProfile referee) {

        if (this.refereeProfile != null) {
            this.refereeProfile.getMatches().remove(this);
        }

        this.refereeProfile = referee;

        if (referee != null) {
            referee.getMatches().add(this);
        }
    }
}