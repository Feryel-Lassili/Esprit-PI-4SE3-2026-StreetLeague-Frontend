package tn.esprit.pi.service.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.domain.CoachProfile;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.domain.GestionTournoi.Training;
import tn.esprit.pi.domain.PlayerProfile;
import tn.esprit.pi.repository.CoachProfileRepository;
import tn.esprit.pi.repository.GestionTournoi.EventRepository;
import tn.esprit.pi.repository.GestionTournoi.TrainingRepository;
import tn.esprit.pi.repository.PlayerProfileRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrainingService {

    private final TrainingRepository repo;
    private final EventRepository eventRepo;
    private final PlayerProfileRepository playerRepo;
    private final CoachProfileRepository coachRepo;

    public Training create(Training t, Long eventId, Long coachId) {

        if (eventId != null) {
            Event e = eventRepo.findById(eventId).orElseThrow();
            t.setEvent(e);
        }

        if (coachId != null) {
            CoachProfile c = coachRepo.findById(coachId).orElseThrow();
            t.setCoachProfile(c);
        }

        return repo.save(t);
    }

    public Training join(Long trainingId, Long playerId) {

        Training t = repo.findById(trainingId).orElseThrow();
        PlayerProfile p = playerRepo.findById(playerId).orElseThrow();

        t.addParticipant(p);

        return repo.save(t);
    }

    public Training leave(Long trainingId, Long playerId) {

        Training t = repo.findById(trainingId).orElseThrow();
        PlayerProfile p = playerRepo.findById(playerId).orElseThrow();

        t.removeParticipant(p);

        return repo.save(t);
    }

    public List<Training> getAll() {
        return repo.findAll();
    }

    public List<Training> getByEvent(Long eventId) {
        return repo.findByEventId(eventId);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}