package com.demo.authservice.service;

import com.demo.authservice.client.UserServiceClient;
import com.demo.authservice.model.User;
import com.demo.authservice.model.dto.*;
import com.demo.authservice.repository.RefreshTokenRepository;
import com.demo.authservice.repository.UserRepository;
import com.demo.authservice.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserServiceClient userServiceClient;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "accessTokenExpiration", 900000L);
    }

    @Test
    void register_shouldCreateUserAndReturnTokens() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@demo.com");
        request.setUsername("testuser");
        request.setPassword("password123");

        when(userRepository.existsByEmail("test@demo.com")).thenReturn(false);
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$12$hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtService.generateAccessToken(any(), anyString(), anyString())).thenReturn("access-token");
        when(jwtService.getRefreshTokenExpiration()).thenReturn(604800000L);

        AuthResponse response = authService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        verify(userRepository).save(any(User.class));
        verify(userServiceClient).createUserProfile(any(), anyString(), anyString());
    }

    @Test
    void register_shouldRejectDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@demo.com");
        request.setUsername("newuser");
        request.setPassword("password123");

        when(userRepository.existsByEmail("existing@demo.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Email already registered");
    }

    @Test
    void login_shouldRejectInvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@demo.com");
        request.setPassword("wrong");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("user@demo.com")
                .password("$2a$12$hashed")
                .enabled(true)
                .build();

        when(userRepository.findByEmail("user@demo.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "$2a$12$hashed")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    void login_shouldRejectDisabledAccount() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@demo.com");
        request.setPassword("password123");

        User user = User.builder()
                .id(UUID.randomUUID())
                .email("user@demo.com")
                .password("$2a$12$hashed")
                .enabled(false)
                .build();

        when(userRepository.findByEmail("user@demo.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$12$hashed")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Account is disabled");
    }
}