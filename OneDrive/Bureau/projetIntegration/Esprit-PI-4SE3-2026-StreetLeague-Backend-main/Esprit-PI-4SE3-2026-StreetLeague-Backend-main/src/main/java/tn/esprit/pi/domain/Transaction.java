package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    private TransactionType type;
    
    private Double amount;
    private LocalDateTime date;
    private String status;
    
    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}
