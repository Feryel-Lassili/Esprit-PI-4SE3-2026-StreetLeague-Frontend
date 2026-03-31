package tn.esprit.pi.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

    @Entity
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public class Reward {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Enumerated(EnumType.STRING)
        private RewardSource source;

        private Double bonus;
        private Integer week;
        private LocalDate date;

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;
    }
