package tn.esprit.pi.service.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.domain.GestionTournoi.EventStatus;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.repository.GestionTournoi.EventRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepo;

    public Event create(Event e) {
        e.setStatus(EventStatus.SCHEDULED);
        return eventRepo.save(e);
    }

    public List<Event> getAll() {
        return eventRepo.findAll();
    }

    public Event getById(Long id) {
        return eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public Event update(Long id, Event newData) {
        Event e = getById(id);

        e.setTitle(newData.getTitle());
        e.setLocation(newData.getLocation());
        e.setDate(newData.getDate());
        e.setDescription(newData.getDescription());

        return eventRepo.save(e);
    }

    public void delete(Long id) {
        eventRepo.deleteById(id);
    }
}