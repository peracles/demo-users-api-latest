using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;

namespace UserApi.Security;

public static class JwtExtensions
{
    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var keysDir = configuration["JwtKeysDir"] ?? "./keys";
        var publicKeyPath = System.IO.Path.Combine(keysDir, "public.key");

        // Retry: auth-service may not have generated keys yet
        string publicKeyBase64 = "";
        for (int i = 0; i < 30; i++)
        {
            if (File.Exists(publicKeyPath))
            {
                publicKeyBase64 = File.ReadAllText(publicKeyPath).Trim();
                break;
            }
            Thread.Sleep(1000);
        }

        if (string.IsNullOrEmpty(publicKeyBase64))
        {
            throw new FileNotFoundException(
                $"JWT public key not found at '{publicKeyPath}' after 30s. " +
                "Ensure the auth-service has generated the RSA keys.");
        }

        var publicKeyBytes = Convert.FromBase64String(publicKeyBase64);
        var rsa = RSA.Create();
        rsa.ImportSubjectPublicKeyInfo(publicKeyBytes, out _);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,       // El auth-service no setea claim "iss"
                    ValidateAudience = false,      // No usamos claim "aud"
                    ValidateLifetime = true,       // Validar expiración del token
                    ClockSkew = TimeSpan.FromMinutes(1), // Tolerancia de 1 minuto
                    IssuerSigningKey = new RsaSecurityKey(rsa)
                };
            });

        services.AddAuthorization();
        return services;
    }
}
