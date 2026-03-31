package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.domain.Shop;

public interface ShopRepository extends JpaRepository<Shop, Long> {
}