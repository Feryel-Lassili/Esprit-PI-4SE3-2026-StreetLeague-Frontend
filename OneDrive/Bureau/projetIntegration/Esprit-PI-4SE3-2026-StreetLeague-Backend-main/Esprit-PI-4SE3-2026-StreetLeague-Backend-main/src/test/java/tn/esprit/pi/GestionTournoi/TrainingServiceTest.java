package tn.esprit.pi.GestionTournoi;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.esprit.pi.domain.GestionTournoi.Event;
import tn.esprit.pi.domain.GestionTournoi.Training;
import tn.esprit.pi.domain.CoachProfile;
import tn.esprit.pi.repository.GestionTournoi.EventRepository;
import tn.esprit.pi.repository.GestionTournoi.TrainingRepository;
import tn.esprit.pi.repository.CoachProfileRepository;
import tn.esprit.pi.service.GestionTournoi.TrainingService;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TrainingServiceTest {

    @Mock
    private TrainingRepository trainingRepository;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private CoachProfileRepository coachRepository;

    @InjectMocks
    private TrainingService trainingService;

    private Training training;
    private Event event;
    private CoachProfile coach;

    @BeforeEach
    void setUp() {
        training = new Training();
        training.setId(1L);
        training.setTitle("Training Test");
        training.setLocation("Tunis");

        event = new Event();
        event.setId(1L);
        event.setTitle("Event Test");

        coach = new CoachProfile();
        coach.setId(1L);
    }

    @Test
    void testTrainingCreation() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(coachRepository.findById(1L)).thenReturn(Optional.of(coach));
        when(trainingRepository.save(any(Training.class))).thenReturn(training);

        Training result = trainingService.create(training, 1L, 1L);

        assertNotNull(result);
        assertEquals("Training Test", result.getTitle());
        verify(eventRepository, times(1)).findById(1L);
        verify(coachRepository, times(1)).findById(1L);
        verify(trainingRepository, times(1)).save(any(Training.class));
    }

    @Test
    void testGetAll() {
        when(trainingRepository.findAll()).thenReturn(List.of(training));

        List<Training> trainings = trainingService.getAll();

        assertEquals(1, trainings.size());
        assertEquals("Training Test", trainings.get(0).getTitle());
        verify(trainingRepository, times(1)).findAll();
    }

    @Test
    void testDelete() {
        doNothing().when(trainingRepository).deleteById(1L);

        trainingService.delete(1L);

        verify(trainingRepository, times(1)).deleteById(1L);
    }
}