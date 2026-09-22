package com.demo.authservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;
import java.util.UUID;

@Component
public class UserServiceClient {

    private final WebClient webClient;

    @Value("${user-service.url:http://localhost:8082}")
    private String userServiceUrl;

    @Value("${user-service.secret:internal-secret-key-2026}")
    private String internalSecret;

    public UserServiceClient() {
        this.webClient = WebClient.create();
    }

    public void createUserProfile(UUID userId, String firstName, String lastName) {
        String mutation = """
            mutation CreateUserInternal($userId: UUID!, $firstName: String!, $lastName: String!) {
              createUserInternal(userId: $userId, firstName: $firstName, lastName: $lastName) {
                id
              }
            }
            """;

        Map<String, Object> variables = Map.of(
            "userId", userId.toString(),
            "firstName", firstName,
            "lastName", lastName
        );

        Map<String, Object> requestBody = Map.of(
            "query", mutation,
            "variables", variables
        );

        webClient.post()
            .uri(userServiceUrl + "/graphql")
            .header("X-Internal-Secret", internalSecret)
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }
}
