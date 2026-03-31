package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.domain.Sponsorship;
import tn.esprit.pi.domain.SponsorProfile;
import tn.esprit.pi.domain.SponsorshipStatus;

import java.util.List;

public interface SponsorshipRepository extends JpaRepository<Sponsorship, Long> {
    List<Sponsorship> findBySponsorProfile(SponsorProfile sponsorProfile);
    List<Sponsorship> findByStatus(SponsorshipStatus status);
}