package com.demo.authservice.controller;

import com.demo.authservice.model.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17-alpine")
            .withDatabaseName("auth_test_db")
            .withUsername("test_user")
            .withPassword("test_password")
            .withInitScript("schema-test.sql");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("jwt.keys-dir", () -> "./test-keys");
    }

    @LocalServerPort
    private int port;

    private WebTestClient webTestClient;

    @BeforeEach
    void setUp() {
        webTestClient = WebTestClient.bindToServer()
                .baseUrl("http://localhost:" + port)
                .build();
    }

    @Test
    void register_and_login_flow() {
        // Register
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setEmail("integration@demo.com");
        registerReq.setUsername("integration_user");
        registerReq.setPassword("password123");

        webTestClient.post()
                .uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(registerReq)
                .exchange()
                .expectStatus().isCreated()
                .expectBody(AuthResponse.class)
                .value(response -> {
                    assert response.getAccessToken() != null;
                    assert response.getRefreshToken() != null;
                    assert "Bearer".equals(response.getTokenType());
                });

        // Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("integration@demo.com");
        loginReq.setPassword("password123");

        webTestClient.post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(loginReq)
                .exchange()
                .expectStatus().isOk()
                .expectBody(AuthResponse.class)
                .value(response -> {
                    assert response.getAccessToken() != null;
                });
    }

    @Test
    void login_with_wrong_credentials_returns_401() {
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("nonexistent@demo.com");
        loginReq.setPassword("wrong");

        webTestClient.post()
                .uri("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(loginReq)
                .exchange()
                .expectStatus().isUnauthorized();
    }
}