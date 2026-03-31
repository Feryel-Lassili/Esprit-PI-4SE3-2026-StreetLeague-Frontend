package tn.esprit.pi.controller.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.service.GestionTournoi.MatchService;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MatchController {

    private final MatchService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{eventId}/{tournamentId}")
    public Match create(@RequestBody Match m,
                        @PathVariable(required = false) Long eventId,
                        @PathVariable(required = false) Long tournamentId) {
        return service.create(m, eventId, tournamentId);
    }

    @PreAuthorize("hasRole('PLAYER')")
    @PostMapping("/join/{matchId}/{playerId}")
    public Match join(@PathVariable Long matchId, @PathVariable Long playerId) {
        return service.join(matchId, playerId);
    }

    @GetMapping
    public List<Match> getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}