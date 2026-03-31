package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Double weight;
    private Double height;
    private String bloodType;
    private String chronicDiseases;
    private String allergies;
    private LocalDate lastCheckup;
    
    @OneToOne
    @JoinColumn(name = "player_id")
    private PlayerProfile playerProfile;
    
    @ManyToOne
    @JoinColumn(name = "health_professional_id")
    private HealthProfessionalProfile healthProfessionalProfile;
    
    @OneToMany(mappedBy = "medicalRecord")
    private Set<Injury> injuries;
}
