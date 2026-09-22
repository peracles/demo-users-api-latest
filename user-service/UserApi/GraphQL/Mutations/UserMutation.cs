using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UserApi.Data;
using UserApi.Data.Entities;
using UserApi.GraphQL.Types.Inputs;

namespace UserApi.GraphQL.Mutations;

public class UserMutation
{
    // Mutation interna para Auth Service (valida header secreto en lugar de JWT)
    public async Task<UserProfile?> CreateUserInternal(
        [Service] AppDbContext context,
        [Service] IHttpContextAccessor httpContext,
        [Service] IConfiguration configuration,
        Guid userId,
        string firstName,
        string lastName)
    {
        // Validar header secreto
        var secret = httpContext.HttpContext?.Request.Headers["X-Internal-Secret"].ToString();
        var expectedSecret = configuration["InternalSecret"] ?? "internal-secret-key-2026";

        if (secret != expectedSecret)
        {
            throw new GraphQLException("Unauthorized: Invalid or missing internal secret");
        }

        // Verificar si ya existe el perfil
        var existing = await context.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (existing is not null)
            return existing;

        var profile = new UserProfile
        {
            UserId = userId,
            FirstName = firstName,
            LastName = lastName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.UserProfiles.Add(profile);
        await context.SaveChangesAsync();
        return profile;
    }

    [Authorize]
    public async Task<UserProfile?> UpdateUser(
        [Service] AppDbContext context,
        [Service] IHttpContextAccessor httpContext,
        Guid id,
        UpdateUserInput input)
    {
        var profile = await context.UserProfiles.FindAsync(id);
        if (profile is null) return null;

        // Verificar que el usuario es dueño del perfil o es ADMIN
        var userId = httpContext.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = httpContext.HttpContext!.User.FindFirstValue("role");

        if (profile.UserId.ToString() != userId && role != "ADMIN")
            throw new GraphQLException("Not authorized to update this profile");

        if (input.FirstName is not null) profile.FirstName = input.FirstName;
        if (input.LastName is not null) profile.LastName = input.LastName;
        if (input.Phone is not null) profile.Phone = input.Phone;
        if (input.AvatarUrl is not null) profile.AvatarUrl = input.AvatarUrl;
        if (input.Bio is not null) profile.Bio = input.Bio;

        profile.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();
        return profile;
    }

    [Authorize]
    public async Task<bool> DeleteUser(
        [Service] AppDbContext context,
        [Service] IHttpContextAccessor httpContext,
        Guid id)
    {
        var profile = await context.UserProfiles.FindAsync(id);
        if (profile is null) return false;

        var userId = httpContext.HttpContext!.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = httpContext.HttpContext!.User.FindFirstValue("role");

        if (profile.UserId.ToString() != userId && role != "ADMIN")
            throw new GraphQLException("Not authorized to delete this profile");

        context.UserProfiles.Remove(profile);
        await context.SaveChangesAsync();
        return true;
    }
}
