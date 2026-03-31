package tn.esprit.pi.controller.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.domain.GestionTournoi.Tournament;
import tn.esprit.pi.service.GestionTournoi.TournamentService;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TournamentController {

    private final TournamentService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Tournament create(@RequestBody Tournament t) {
        return service.create(t);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{tournamentId}/add-match/{matchId}")
    public Match addMatch(@PathVariable Long tournamentId, @PathVariable Long matchId) {
        return service.addMatch(tournamentId, matchId);
    }

    @GetMapping
    public List<Tournament> getAll() {
        return service.getAll();
    }
}