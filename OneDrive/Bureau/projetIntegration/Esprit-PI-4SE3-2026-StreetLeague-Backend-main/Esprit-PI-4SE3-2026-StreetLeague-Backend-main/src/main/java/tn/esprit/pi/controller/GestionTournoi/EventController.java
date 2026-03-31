package tn.esprit.pi.controller.GestionTournoi;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.service.GestionTournoi.EventService;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EventController {

    private final EventService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public Event create(@RequestBody Event e) {
        return service.create(e);
    }

    @GetMapping
    public List<Event> getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Event update(@PathVariable Long id, @RequestBody Event e) {
        return service.update(id, e);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}