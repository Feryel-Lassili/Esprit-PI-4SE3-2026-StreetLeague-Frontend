package tn.esprit.pi.repository.GestionTournoi;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.domain.GestionTournoi.EventStatus;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStatus(EventStatus status);

    List<Event> findByDateAfter(LocalDateTime date);
}
