package tn.esprit.pi.service;

import tn.esprit.pi.domain.User;
import tn.esprit.pi.dto.Dtos.AuthResponse;
import tn.esprit.pi.dto.Dtos.LoginRequest;
import tn.esprit.pi.dto.Dtos.RegisterRequest;

public interface IAuthService {
    User register(RegisterRequest req);
    AuthResponse login(LoginRequest req);
}
