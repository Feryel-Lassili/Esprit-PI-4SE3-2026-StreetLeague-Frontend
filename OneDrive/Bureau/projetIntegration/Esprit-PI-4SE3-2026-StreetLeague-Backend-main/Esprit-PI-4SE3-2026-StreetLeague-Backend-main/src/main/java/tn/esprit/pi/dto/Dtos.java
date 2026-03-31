package tn.esprit.pi.dto;

import tn.esprit.pi.domain.Role;
import java.util.Set;

public class Dtos {

    // ================= AUTH =================

    public record RegisterRequest(
            String fullName,
            String email,
            String password,
            Role role,

            // Player
            String dateOfBirth,

            // Health Professional / Referee / Coach
            String certificate,
            String licenseNumber,
            String specialty,
            Integer experienceYears,

            // Sponsor
            String companyName,
            String logo,
            String contactEmail,
            Double budget,

            // Venue Owner
            String phone
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}

    public record AuthResponse(
            String token,
            String email,
            String role
    ) {}

    // ================= TOURNAMENT =================

    public record TournamentRequest(
            String title,
            String location,
            Integer duration,
            String sportType,

            String name,
            Integer numberOfTeams,
            String phase,
            Double prize,

            Set<Long> teamIds
    ) {}

    // ================= MATCH =================

    public record MatchRequest(
            String title,
            String location,
            Integer duration,
            String sportType,

            String score,

            Set<Long> teamIds,
            Long refereeId,
            Long tournamentId
    ) {}

    // ================= TRAINING =================

    public record TrainingRequest(
            String title,
            String location,
            Integer duration,
            String sportType,

            String description,
            Integer maxParticipants,

            Long coachId,
            Set<Long> playerIds
    ) {}
}