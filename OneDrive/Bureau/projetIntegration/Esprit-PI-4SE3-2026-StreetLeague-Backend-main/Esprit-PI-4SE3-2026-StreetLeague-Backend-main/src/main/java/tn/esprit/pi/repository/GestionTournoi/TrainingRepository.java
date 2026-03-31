package tn.esprit.pi.repository.GestionTournoi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.domain.GestionTournoi.Training;

import java.util.List;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {

    List<Training> findByEventId(Long eventId);

    List<Training> findByCoachProfileId(Long coachId);
}

