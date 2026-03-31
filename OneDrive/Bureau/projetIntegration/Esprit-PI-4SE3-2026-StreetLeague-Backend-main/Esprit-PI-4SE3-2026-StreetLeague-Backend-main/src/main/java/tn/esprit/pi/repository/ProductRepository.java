package tn.esprit.pi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.domain.Product;
import tn.esprit.pi.domain.SportType;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategory(String category);
    List<Product> findBySportType(SportType sportType);
    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);
    
    @Query("SELECT p FROM Product p WHERE " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:category IS NULL OR p.category = :category) AND " +
           "(:sportType IS NULL OR p.sportType = :sportType)")
    List<Product> searchProducts(@Param("name") String name, 
                                @Param("category") String category, 
                                @Param("sportType") SportType sportType);
}