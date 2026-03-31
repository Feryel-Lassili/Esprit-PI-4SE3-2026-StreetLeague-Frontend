package tn.esprit.pi.GestionTournoi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.service.GestionTournoi.EventService;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class EventServiceTest {

    @Autowired
    private EventService eventService;

    @Test
    void testCreateEvent() {
        Event e = new Event();
        e.setTitle("Test Event");
        e.setLocation("Tunis");

        Event saved = eventService.create(e);

        assertNotNull(saved.getId());
    }
}
