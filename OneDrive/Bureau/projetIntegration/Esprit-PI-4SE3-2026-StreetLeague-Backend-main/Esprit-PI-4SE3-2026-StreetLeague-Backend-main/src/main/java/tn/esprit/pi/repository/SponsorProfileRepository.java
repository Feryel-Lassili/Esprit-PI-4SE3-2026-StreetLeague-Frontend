package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.domain.SponsorProfile;

import java.util.Optional;

public interface SponsorProfileRepository extends JpaRepository<SponsorProfile, Long> {
    Optional<SponsorProfile> findByUserId(Long userId);
}
