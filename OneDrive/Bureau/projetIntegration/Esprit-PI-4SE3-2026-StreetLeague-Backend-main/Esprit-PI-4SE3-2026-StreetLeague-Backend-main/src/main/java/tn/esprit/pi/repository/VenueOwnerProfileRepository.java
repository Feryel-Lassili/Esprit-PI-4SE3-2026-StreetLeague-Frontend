package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.domain.VenueOwnerProfile;

import java.util.Optional;

public interface VenueOwnerProfileRepository extends JpaRepository<VenueOwnerProfile, Long> {
    Optional<VenueOwnerProfile> findByUserId(Long userId);
}
