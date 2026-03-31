package tn.esprit.pi.domain.GestionTournoi;

import jakarta.persistence.*;
import lombok.*;
import tn.esprit.pi.domain.Team;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer numberOfTeams;
    private String phase;
    private Double prize;

    // 🔥 équipes participantes
    @ManyToMany
    @JoinTable(name = "tournament_team",
            joinColumns = @JoinColumn(name = "tournament_id"),
            inverseJoinColumns = @JoinColumn(name = "team_id"))
    private Set<Team> teams = new HashSet<>();

    // 🔥 matchs du tournoi
    @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL)
    private Set<Match> matches = new HashSet<>();


    // ===============================
    // 🔥 LOGIQUE MÉTIER
    // ===============================

    public void addMatch(Match match) {
        matches.add(match);
        match.setTournament(this);
    }

    public void removeMatch(Match match) {
        matches.remove(match);
        match.setTournament(null);
    }

    public void addTeam(Team team) {
        teams.add(team);
    }

    public void removeTeam(Team team) {
        teams.remove(team);
    }
}