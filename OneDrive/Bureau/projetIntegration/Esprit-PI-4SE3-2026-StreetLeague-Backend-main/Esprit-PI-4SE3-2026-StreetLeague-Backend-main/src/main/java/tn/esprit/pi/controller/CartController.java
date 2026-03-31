package tn.esprit.pi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.domain.*;
import tn.esprit.pi.repository.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Cart> getMyCart(Authentication auth) {
        if (auth == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setTotalAmount(0.0);
            newCart.setCartItems(new HashSet<>());
            return cartRepository.save(newCart);
        });
        
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToCart(@PathVariable Long productId, 
                                     @RequestParam Integer quantity,
                                     Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);
        
        if (user == null || product == null) return ResponseEntity.notFound().build();
        
        Cart cart = cartRepository.findByUser(user).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setCreatedAt(LocalDateTime.now());
            newCart.setTotalAmount(0.0);
            newCart.setCartItems(new HashSet<>());
            return cartRepository.save(newCart);
        });

        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product).orElse(null);
        
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setSubtotal(existingItem.getQuantity() * product.getPrice());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setSubtotal(quantity * product.getPrice());
            cartItemRepository.save(newItem);
        }
        
        updateCartTotal(cart);
        return ResponseEntity.ok(Map.of("message", "Product added to cart"));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long itemId, 
                                          @RequestParam Integer quantity,
                                          Authentication auth) {
        CartItem item = cartItemRepository.findById(itemId).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (!item.getCart().getUser().equals(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        
        item.setQuantity(quantity);
        item.setSubtotal(quantity * item.getProduct().getPrice());
        cartItemRepository.save(item);
        
        updateCartTotal(item.getCart());
        return ResponseEntity.ok(Map.of("message", "Cart updated"));
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long itemId, Authentication auth) {
        CartItem item = cartItemRepository.findById(itemId).orElse(null);
        if (item == null) return ResponseEntity.notFound().build();
        
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (!item.getCart().getUser().equals(user)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        
        Cart cart = item.getCart();
        cartItemRepository.delete(item);
        updateCartTotal(cart);
        
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        Cart cart = cartRepository.findByUser(user).orElse(null);
        
        if (cart == null) return ResponseEntity.notFound().build();
        
        cartItemRepository.deleteAll(cart.getCartItems());
        cart.setTotalAmount(0.0);
        cartRepository.save(cart);
        
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }

    private void updateCartTotal(Cart cart) {
        double total = cart.getCartItems().stream()
                .mapToDouble(CartItem::getSubtotal)
                .sum();
        cart.setTotalAmount(total);
        cartRepository.save(cart);
    }
}