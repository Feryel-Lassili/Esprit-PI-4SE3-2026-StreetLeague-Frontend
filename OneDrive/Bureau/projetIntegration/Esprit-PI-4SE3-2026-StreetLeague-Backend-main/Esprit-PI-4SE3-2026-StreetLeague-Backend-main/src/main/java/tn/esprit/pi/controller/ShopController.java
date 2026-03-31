package tn.esprit.pi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.Shop;
import tn.esprit.pi.repository.ShopRepository;

import java.util.List;

@RestController
@CrossOrigin("*")
@RequestMapping("/admin/shops")
@RequiredArgsConstructor
public class ShopController {

    private final ShopRepository shopRepository;

    @GetMapping
    public List<Shop> getAllShops() {
        return shopRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Shop> getShopById(@PathVariable Long id) {
        return shopRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Shop createShop(@RequestBody Shop shop) {
        return shopRepository.save(shop);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Shop> updateShop(@PathVariable Long id, @RequestBody Shop shopDetails) {
        return shopRepository.findById(id)
                .map(shop -> {
                    shop.setName(shopDetails.getName());
                    shop.setDescription(shopDetails.getDescription());
                    shop.setAddress(shopDetails.getAddress());
                    shop.setContactEmail(shopDetails.getContactEmail());
                    shop.setPhoneNumber(shopDetails.getPhoneNumber());
                    return ResponseEntity.ok(shopRepository.save(shop));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShop(@PathVariable Long id) {
        return shopRepository.findById(id)
                .map(shop -> {
                    shopRepository.delete(shop);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}