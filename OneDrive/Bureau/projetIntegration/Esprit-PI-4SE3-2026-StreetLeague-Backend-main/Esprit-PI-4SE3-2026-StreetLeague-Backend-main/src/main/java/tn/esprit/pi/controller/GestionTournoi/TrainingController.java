package tn.esprit.pi.controller.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.GestionTournoi.Training;
import tn.esprit.pi.service.GestionTournoi.TrainingService;

import java.util.List;

@RestController
@RequestMapping("/api/trainings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TrainingController {

    private final TrainingService service;

    @PreAuthorize("hasAnyRole('ADMIN','COACH')")
    @PostMapping("/{eventId}/{coachId}")
    public Training create(@RequestBody Training t,
                           @PathVariable(required = false) Long eventId,
                           @PathVariable Long coachId) {
        return service.create(t, eventId, coachId);
    }

    @PreAuthorize("hasRole('PLAYER')")
    @PostMapping("/join/{trainingId}/{playerId}")
    public Training join(@PathVariable Long trainingId, @PathVariable Long playerId) {
        return service.join(trainingId, playerId);
    }

    @PreAuthorize("hasRole('PLAYER')")
    @PostMapping("/leave/{trainingId}/{playerId}")
    public Training leave(@PathVariable Long trainingId, @PathVariable Long playerId) {
        return service.leave(trainingId, playerId);
    }

    @GetMapping
    public List<Training> getAll() {
        return service.getAll();
    }
}
