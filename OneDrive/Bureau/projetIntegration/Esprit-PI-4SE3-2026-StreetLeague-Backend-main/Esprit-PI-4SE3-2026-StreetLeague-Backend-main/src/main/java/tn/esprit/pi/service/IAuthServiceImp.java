package tn.esprit.pi.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.domain.*;
import tn.esprit.pi.dto.Dtos.AuthResponse;
import tn.esprit.pi.dto.Dtos.LoginRequest;
import tn.esprit.pi.dto.Dtos.RegisterRequest;
import tn.esprit.pi.repository.*;
import tn.esprit.pi.security.CustomUserDetailsService;
import tn.esprit.pi.security.jwt.JwtService;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class IAuthServiceImp implements IAuthService {

    private final UserRepository userRepository;
    private final CoachProfileRepository coachProfileRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final RefereeProfileRepository refereeProfileRepository;
    private final HealthProfessionalProfileRepository healthProfessionalProfileRepository;
    private final SponsorProfileRepository sponsorProfileRepository;
    private final VenueOwnerProfileRepository venueOwnerProfileRepository;
    private final AdminProfileRepository adminProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;

    @Override
    public User register(RegisterRequest req) {
        if (req.email() == null || req.email().isBlank()) {
            throw new IllegalArgumentException("Email required");
        }
        if (userRepository.findByEmail(req.email()).isPresent()) {
            throw new IllegalArgumentException("Email already used");
        }
        if (req.password() == null || req.password().length() < 6) {
            throw new IllegalArgumentException("Password must contain at least 6 characters");
        }
        if (req.role() == null) {
            throw new IllegalArgumentException("Role required");
        }

        User user = new User();
        user.setUsername(req.fullName() == null ? "Not Available" : req.fullName());
        user.setEmail(req.email());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRole(req.role());
        user.setEnabled(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setPhone(req.phone());

        User savedUser = userRepository.save(user);

        switch (req.role()) {
            case PLAYER -> {
                PlayerProfile p = new PlayerProfile();
                p.setUser(savedUser);
                if (req.dateOfBirth() != null) {
                    p.setDateOfBirth(LocalDate.parse(req.dateOfBirth()));
                }
                playerProfileRepository.save(p);
            }
            case COACH -> {
                CoachProfile c = new CoachProfile();
                c.setUser(savedUser);
                c.setCertificate(req.certificate());
                c.setSpecialty(req.specialty());
                c.setExperienceYears(req.experienceYears());
                c.setVerified(false);
                coachProfileRepository.save(c);
            }
            case SPONSOR -> {
                SponsorProfile s = new SponsorProfile();
                s.setUser(savedUser);
                s.setCompanyName(req.companyName());
                s.setLogo(req.logo());
                s.setContactEmail(req.contactEmail());
                s.setBudget(req.budget());
                sponsorProfileRepository.save(s);
            }
            case REFEREE -> {
                RefereeProfile r = new RefereeProfile();
                r.setUser(savedUser);
                r.setCertificate(req.certificate());
                r.setLicenseNumber(req.licenseNumber());
                r.setExperienceYears(req.experienceYears());
                r.setVerified(false);
                refereeProfileRepository.save(r);
            }
            case HEALTH_PROFESSIONAL -> {
                HealthProfessionalProfile hp = new HealthProfessionalProfile();
                hp.setUser(savedUser);
                hp.setCertificate(req.certificate());
                hp.setLicenseNumber(req.licenseNumber());
                hp.setSpecialty(req.specialty());
                hp.setVerified(false);
                healthProfessionalProfileRepository.save(hp);
            }
            case VENUE_OWNER -> {
                VenueOwnerProfile vo = new VenueOwnerProfile();
                vo.setUser(savedUser);
                vo.setCompanyName(req.companyName());
                vo.setPhone(req.phone());
                vo.setVerified(false);
                venueOwnerProfileRepository.save(vo);
            }
            case ADMIN -> {
                AdminProfile a = new AdminProfile();
                a.setUser(savedUser);
                a.setRoleLevel(1);
                adminProfileRepository.save(a);
            }
        }

        return savedUser;
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(req.email());

        String token = jwtService.generateToken(userDetails);

        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No roles found"))
                .getAuthority();

        return new AuthResponse(token, userDetails.getUsername(), role);
    }
}
