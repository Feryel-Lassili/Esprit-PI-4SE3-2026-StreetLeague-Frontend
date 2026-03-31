package tn.esprit.pi.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import tn.esprit.pi.domain.*;
import tn.esprit.pi.repository.*;

import java.util.Optional;

/**
 * Helper utility for working with User and Profile entities
 * Simplifies common operations after migration to single user table
 */
@Component
public class UserProfileHelper {
    
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CoachProfileRepository coachProfileRepository;
    @Autowired
    private PlayerProfileRepository playerProfileRepository;
    @Autowired
    private RefereeProfileRepository refereeProfileRepository;
    @Autowired
    private HealthProfessionalProfileRepository healthProfessionalProfileRepository;
    @Autowired
    private SponsorProfileRepository sponsorProfileRepository;
    @Autowired
    private VenueOwnerProfileRepository venueOwnerProfileRepository;
    @Autowired
    private AdminProfileRepository adminProfileRepository;
    
    /**
     * Get profile for a user based on their role
     */
    public Object getProfileByUser(User user) {
        return switch (user.getRole()) {
            case COACH -> coachProfileRepository.findByUserId(user.getId()).orElse(null);
            case PLAYER -> playerProfileRepository.findByUserId(user.getId()).orElse(null);
            case REFEREE -> refereeProfileRepository.findByUserId(user.getId()).orElse(null);
            case HEALTH_PROFESSIONAL -> healthProfessionalProfileRepository.findByUserId(user.getId()).orElse(null);
            case SPONSOR -> sponsorProfileRepository.findByUserId(user.getId()).orElse(null);
            case VENUE_OWNER -> venueOwnerProfileRepository.findByUserId(user.getId()).orElse(null);
            case ADMIN -> adminProfileRepository.findByUserId(user.getId()).orElse(null);
        };
    }
    
    /**
     * Get CoachProfile by user ID
     */
    public Optional<CoachProfile> getCoachProfile(Long userId) {
        return coachProfileRepository.findByUserId(userId);
    }
    
    /**
     * Get PlayerProfile by user ID
     */
    public Optional<PlayerProfile> getPlayerProfile(Long userId) {
        return playerProfileRepository.findByUserId(userId);
    }
    
    /**
     * Get RefereeProfile by user ID
     */
    public Optional<RefereeProfile> getRefereeProfile(Long userId) {
        return refereeProfileRepository.findByUserId(userId);
    }
    
    /**
     * Check if user has a specific role
     */
    public boolean hasRole(User user, Role role) {
        return user.getRole() == role;
    }
    
    /**
     * Get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
