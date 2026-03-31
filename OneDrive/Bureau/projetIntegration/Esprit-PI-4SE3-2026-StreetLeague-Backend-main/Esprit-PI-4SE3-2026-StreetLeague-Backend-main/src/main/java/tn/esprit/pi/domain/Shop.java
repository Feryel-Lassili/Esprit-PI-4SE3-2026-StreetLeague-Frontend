package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Shop {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String address;
    private String contactEmail;
    private String phoneNumber;
    
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL)
    private Set<Product> products;
}