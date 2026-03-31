package tn.esprit.pi.GestionTournoi;

import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import tn.esprit.pi.domain.GestionTournoi.Match;
import tn.esprit.pi.domain.GestionTournoi.Tournament;
import tn.esprit.pi.repository.GestionTournoi.MatchRepository;
import tn.esprit.pi.service.GestionTournoi.TournamentService;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TournamentServiceTest {

    @Autowired
    private TournamentService tournamentService;

    @Autowired
    private MatchRepository matchRepository;

    // 🔥 CREATE
    @Test
    void testCreateTournament() {

        Tournament t = new Tournament();
        t.setName("Test Tournament");
        t.setPhase("GROUP_STAGE");
        t.setNumberOfTeams(2);
        t.setPrize(500.0);

        Tournament saved = tournamentService.create(t);

        assertNotNull(saved.getId());
        assertEquals("Test Tournament", saved.getName());
    }

    // 🔥 GET ALL
    @Test
    void testGetAllTournaments() {

        List<Tournament> list = tournamentService.getAll();

        assertNotNull(list);
    }

    // 🔥 UPDATE
    @Test
    void testUpdateTournament() {

        Tournament t = new Tournament();
        t.setName("Old Name");
        t.setPhase("GROUP");
        t.setNumberOfTeams(2);
        t.setPrize(100.0);

        Tournament saved = tournamentService.create(t);

        saved.setName("Updated Name");

        Tournament updated = tournamentService.update(saved.getId(), saved);

        assertEquals("Updated Name", updated.getName());
    }

    // 🔥 DELETE
    @Test
    void testDeleteTournament() {

        Tournament t = new Tournament();
        t.setName("Delete Test");
        t.setPhase("GROUP");
        t.setNumberOfTeams(2);
        t.setPrize(100.0);

        Tournament saved = tournamentService.create(t);

        tournamentService.delete(saved.getId());

        assertThrows(RuntimeException.class, () -> {
            tournamentService.getById(saved.getId());
        });
    }
    @Test
    void testAddMatchToTournament() {

        // 🔹 créer tournoi
        Tournament t = new Tournament();
        t.setName("League Test");
        t.setPhase("GROUP");
        t.setNumberOfTeams(2);
        t.setPrize(1000.0);

        Tournament savedTournament = tournamentService.create(t);

        // 🔹 créer match
        Match m = new Match();
        m.setTitle("Test Match");

        Match savedMatch = matchRepository.save(m);

        // 🔹 lier match → tournoi
        Match result = tournamentService.addMatch(savedTournament.getId(), savedMatch.getId());

        assertNotNull(result.getTournament());
        assertEquals(savedTournament.getId(), result.getTournament().getId());
    }
}
