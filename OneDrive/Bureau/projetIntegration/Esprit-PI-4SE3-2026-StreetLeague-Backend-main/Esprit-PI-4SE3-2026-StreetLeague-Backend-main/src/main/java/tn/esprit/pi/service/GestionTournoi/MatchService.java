package tn.esprit.pi.service.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.domain.GestionTournoi.Tournament;
import tn.esprit.pi.domain.PlayerProfile;
import tn.esprit.pi.repository.GestionTournoi.EventRepository;
import tn.esprit.pi.repository.GestionTournoi.MatchRepository;
import tn.esprit.pi.repository.GestionTournoi.TournamentRepository;
import tn.esprit.pi.repository.PlayerProfileRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final MatchRepository matchRepo;
    private final EventRepository eventRepo;
    private final TournamentRepository tournamentRepo;
    private final PlayerProfileRepository playerRepo;

    // CREATE
    public Match create(Match m, Long eventId, Long tournamentId) {

        if (eventId != null) {
            Event event = eventRepo.findById(eventId).orElseThrow();
            m.setEvent(event);
        }

        if (tournamentId != null) {
            Tournament t = tournamentRepo.findById(Math.toIntExact(tournamentId)).orElseThrow();
            m.setTournament(t);
        }

        return matchRepo.save(m);
    }

    // JOIN MATCH
    public Match join(Long matchId, Long playerId) {
        Match match = matchRepo.findById(matchId).orElseThrow();
        PlayerProfile player = playerRepo.findById(playerId).orElseThrow();

        match.addPlayer(player);

        return matchRepo.save(match);
    }

    public List<Match> getAll() {
        return matchRepo.findAll();
    }

    public List<Match> getByEvent(Long eventId) {
        return matchRepo.findByEventId(eventId);
    }

    public List<Match> getByTournament(Long tournamentId) {
        return matchRepo.findByTournamentId(tournamentId);
    }

    public void delete(Long id) {
        matchRepo.deleteById(id);
    }
}