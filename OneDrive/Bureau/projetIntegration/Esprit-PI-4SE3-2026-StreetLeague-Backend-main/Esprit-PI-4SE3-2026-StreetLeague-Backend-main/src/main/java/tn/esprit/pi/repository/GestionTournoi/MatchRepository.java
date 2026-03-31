package tn.esprit.pi.repository.GestionTournoi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.domain.GestionTournoi.Match;

import java.util.List;
@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByEventId(Long eventId);

    List<Match> findByTournamentId(Long tournamentId);}
