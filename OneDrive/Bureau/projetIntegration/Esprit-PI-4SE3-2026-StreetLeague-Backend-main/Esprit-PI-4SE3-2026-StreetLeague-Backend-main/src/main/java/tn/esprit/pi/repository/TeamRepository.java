package tn.esprit.pi.repository;

import java.util.Set;

public interface TeamRepository {
    int findAllById(Set<Long> longs);
}
