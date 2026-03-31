package tn.esprit.pi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.*;
import tn.esprit.pi.repository.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/sponsorships")
@RequiredArgsConstructor
public class SponsorshipController {

    private final SponsorshipRepository sponsorshipRepository;
    private final SponsorProfileRepository sponsorProfileRepository;
    private final UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<Sponsorship> submitSponsorshipRequest(@RequestBody Sponsorship sponsorship, Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .filter(user -> user.getRole() == Role.SPONSOR)
                .flatMap(user -> sponsorProfileRepository.findByUserId(user.getId()))
                .map(profile -> {
                    sponsorship.setSponsorProfile(profile);
                    sponsorship.setStatus(SponsorshipStatus.PENDING);
                    return ResponseEntity.ok(sponsorshipRepository.save(sponsorship));
                })
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @GetMapping("/my-sponsorships")
    public ResponseEntity<?> getMySponsorships(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .filter(user -> user.getRole() == Role.SPONSOR)
                .flatMap(user -> sponsorProfileRepository.findByUserId(user.getId()))
                .map(profile -> ResponseEntity.ok(sponsorshipRepository.findBySponsorProfile(profile)))
                .orElse(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/pending")
    public List<Sponsorship> getPendingRequests() {
        return sponsorshipRepository.findByStatus(SponsorshipStatus.PENDING);
    }

    @GetMapping("/active")
    public List<Sponsorship> getActiveSponsorship() {
        return sponsorshipRepository.findByStatus(SponsorshipStatus.ACTIVE);
    }

    @PutMapping("/admin/{id}/approve")
    public ResponseEntity<Sponsorship> approveSponsorshipRequest(@PathVariable Long id) {
        return sponsorshipRepository.findById(id)
                .map(sponsorship -> {
                    sponsorship.setStatus(SponsorshipStatus.ACTIVE);
                    return ResponseEntity.ok(sponsorshipRepository.save(sponsorship));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/admin/{id}/reject")
    public ResponseEntity<Sponsorship> rejectSponsorshipRequest(@PathVariable Long id) {
        return sponsorshipRepository.findById(id)
                .map(sponsorship -> {
                    sponsorship.setStatus(SponsorshipStatus.REJECTED);
                    return ResponseEntity.ok(sponsorshipRepository.save(sponsorship));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<Sponsorship> updateSponsorship(@PathVariable Long id, @RequestBody Sponsorship sponsorshipDetails) {
        return sponsorshipRepository.findById(id)
                .map(sponsorship -> {
                    sponsorship.setAmount(sponsorshipDetails.getAmount());
                    sponsorship.setStartDate(sponsorshipDetails.getStartDate());
                    sponsorship.setEndDate(sponsorshipDetails.getEndDate());
                    return ResponseEntity.ok(sponsorshipRepository.save(sponsorship));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<?> cancelSponsorship(@PathVariable Long id, Authentication auth) {
        return sponsorshipRepository.findById(id)
                .map(sponsorship -> {
                    userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                        if (user.getRole() == Role.SPONSOR) {
                            sponsorProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                                if (sponsorship.getSponsorProfile().equals(profile)) {
                                    sponsorshipRepository.delete(sponsorship);
                                }
                            });
                        }
                    });
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteSponsorshipAdmin(@PathVariable Long id) {
        return sponsorshipRepository.findById(id)
                .map(sponsorship -> {
                    sponsorshipRepository.delete(sponsorship);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}