package tn.esprit.pi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.Role;
import tn.esprit.pi.domain.SponsorProfile;
import tn.esprit.pi.domain.User;
import tn.esprit.pi.repository.SponsorProfileRepository;
import tn.esprit.pi.repository.UserRepository;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/sponsors")
@RequiredArgsConstructor
public class SponsorController {

    private final SponsorProfileRepository sponsorProfileRepository;
    private final UserRepository userRepository;

    @GetMapping
    public List<SponsorProfile> getAllSponsors() {
        return sponsorProfileRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SponsorProfile> getSponsorById(@PathVariable Long id) {
        return sponsorProfileRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-profile")
    public ResponseEntity<SponsorProfile> getMyProfile(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .filter(user -> user.getRole() == Role.SPONSOR)
                .flatMap(user -> sponsorProfileRepository.findByUserId(user.getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update")
    public ResponseEntity<SponsorProfile> updateSponsor(@RequestBody SponsorProfile sponsorDetails, Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .filter(user -> user.getRole() == Role.SPONSOR)
                .flatMap(user -> sponsorProfileRepository.findByUserId(user.getId()))
                .map(profile -> {
                    profile.setCompanyName(sponsorDetails.getCompanyName());
                    profile.setLogo(sponsorDetails.getLogo());
                    profile.setContactEmail(sponsorDetails.getContactEmail());
                    profile.setBudget(sponsorDetails.getBudget());
                    return ResponseEntity.ok(sponsorProfileRepository.save(profile));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteSponsor(@PathVariable Long id) {
        return sponsorProfileRepository.findById(id)
                .map(profile -> {
                    sponsorProfileRepository.delete(profile);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}