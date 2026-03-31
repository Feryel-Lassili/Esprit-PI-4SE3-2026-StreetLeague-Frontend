package tn.esprit.pi.service.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.domain.GestionTournoi.EventStatus;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.domain.GestionTournoi.Tournament;
import tn.esprit.pi.domain.SportType;
import tn.esprit.pi.dto.Dtos;
import tn.esprit.pi.repository.GestionTournoi.MatchRepository;
import tn.esprit.pi.repository.TeamRepository;
import tn.esprit.pi.repository.GestionTournoi.TournamentRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository repo;
    private final MatchRepository matchRepo;

    public Tournament create(Tournament t) {
        return repo.save(t);
    }

    public Tournament getById(Long id) {
        return repo.findById(Math.toIntExact(id)).orElseThrow();
    }

    public List<Tournament> getAll() {
        return repo.findAll();
    }

    public Tournament update(Long id, Tournament newData) {

        Tournament t = getById(id);

        t.setName(newData.getName());
        t.setPhase(newData.getPhase());
        t.setNumberOfTeams(newData.getNumberOfTeams());
        t.setPrize(newData.getPrize());

        return repo.save(t);
    }

    public void delete(Long id) {
        repo.deleteById(Math.toIntExact(id));
    }

    // 🔥 ajouter match
    public Match addMatch(Long tournamentId, Long matchId) {

        Tournament t = getById(tournamentId);
        Match m = matchRepo.findById(matchId).orElseThrow();

        m.setTournament(t);

        return matchRepo.save(m);
    }
}