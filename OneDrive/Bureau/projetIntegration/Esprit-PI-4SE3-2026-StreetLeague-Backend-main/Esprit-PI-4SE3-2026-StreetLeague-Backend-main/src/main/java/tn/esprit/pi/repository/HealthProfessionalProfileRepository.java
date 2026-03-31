package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.domain.HealthProfessionalProfile;

import java.util.Optional;

public interface HealthProfessionalProfileRepository extends JpaRepository<HealthProfessionalProfile, Long> {
    Optional<HealthProfessionalProfile> findByUserId(Long userId);
}
