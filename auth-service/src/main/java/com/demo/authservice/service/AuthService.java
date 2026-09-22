package com.demo.authservice.service;

import com.demo.authservice.model.dto.*;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
    void logout(String refreshTokenValue);
}
