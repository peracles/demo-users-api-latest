package com.demo.authservice.security;

import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.Encoders;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Component
public class RsaKeyManager {

    @Value("${jwt.keys-dir}")
    private String keysDir;

    private KeyPair keyPair;

    @PostConstruct
    public void init() {
        try {
            Path dir = Path.of(keysDir);
            Path privateKeyPath = dir.resolve("private.key");
            Path publicKeyPath = dir.resolve("public.key");

            if (Files.exists(privateKeyPath) && Files.exists(publicKeyPath)) {
                keyPair = new KeyPair(readPublicKey(publicKeyPath), readPrivateKey(privateKeyPath));
            } else {
                KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
                generator.initialize(2048);
                keyPair = generator.generateKeyPair();

                Files.createDirectories(dir);
                Files.writeString(privateKeyPath, encodePrivateKey(keyPair.getPrivate()));
                Files.writeString(publicKeyPath, encodePublicKey(keyPair.getPublic()));
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize RSA keys", e);
        }
    }

    public PublicKey getPublicKey() {
        return keyPair.getPublic();
    }

    public PrivateKey getPrivateKey() {
        return keyPair.getPrivate();
    }

    private String encodePublicKey(PublicKey key) {
        return Encoders.BASE64.encode(key.getEncoded());
    }

    private String encodePrivateKey(PrivateKey key) {
        return Encoders.BASE64.encode(key.getEncoded());
    }

    private PublicKey readPublicKey(Path path) throws Exception {
        byte[] bytes = Files.readAllBytes(path);
        String keyContent = new String(bytes).replaceAll("-----\\w+ KEY-----", "").trim();
        return KeyFactory.getInstance("RSA")
                .generatePublic(new X509EncodedKeySpec(Base64.getDecoder().decode(keyContent)));
    }

    private PrivateKey readPrivateKey(Path path) throws Exception {
        byte[] bytes = Files.readAllBytes(path);
        String keyContent = new String(bytes).replaceAll("-----\\w+ KEY-----", "").trim();
        return KeyFactory.getInstance("RSA")
                .generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(keyContent)));
    }
}