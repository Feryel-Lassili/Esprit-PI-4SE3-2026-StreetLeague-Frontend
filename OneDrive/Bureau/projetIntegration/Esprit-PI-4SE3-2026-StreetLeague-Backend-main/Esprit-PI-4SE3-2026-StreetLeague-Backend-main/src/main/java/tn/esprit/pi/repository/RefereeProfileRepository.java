package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.domain.RefereeProfile;

import java.util.Optional;

public interface RefereeProfileRepository extends JpaRepository<RefereeProfile, Long> {
    Optional<RefereeProfile> findByUserId(Long userId);
}
