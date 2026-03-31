package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthProfessionalProfile {
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    private String certificate;
    private String specialty;
    private String licenseNumber;
    private Boolean verified;
    
    @OneToMany(mappedBy = "healthProfessionalProfile")
    private Set<MedicalRecord> medicalRecords;
}
