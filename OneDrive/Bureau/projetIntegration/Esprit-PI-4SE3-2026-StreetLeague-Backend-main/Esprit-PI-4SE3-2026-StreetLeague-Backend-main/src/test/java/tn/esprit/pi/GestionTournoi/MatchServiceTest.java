package tn.esprit.pi.GestionTournoi;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.service.GestionTournoi.MatchService;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class MatchServiceTest {

    @Autowired
    private MatchService matchService;

    @Test
    void testCreateMatch() {
        Match m = new Match();
        m.setTitle("Test Match");

        Match saved = matchService.create(m, null, null);

        assertNotNull(saved.getId());
    }

}
