using Microsoft.EntityFrameworkCore;
using UserApi.Data;
using UserApi.Data.Entities;
using UserApi.GraphQL.Types.Inputs;

namespace UserApi.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserProfile>> GetAllUsersAsync()
    {
        return await _context.UserProfiles
            .AsNoTracking()
            .OrderBy(u => u.LastName)
            .ToListAsync();
    }

    public async Task<UserProfile?> GetUserByIdAsync(Guid id)
    {
        return await _context.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<UserProfile?> CreateUserInternalAsync(Guid userId, string firstName, string lastName)
    {
        // Verificar si ya existe el perfil
        var existing = await _context.UserProfiles
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

        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task<UserProfile?> UpdateUserAsync(Guid id, UpdateUserInput input, Guid currentUserId, string role)
    {
        var profile = await _context.UserProfiles.FindAsync(id);
        if (profile is null) return null;

        // Verificar que el usuario es dueño del perfil o es ADMIN
        if (profile.UserId != currentUserId && role != "ADMIN")
            throw new UnauthorizedAccessException("Not authorized to update this profile");

        if (input.FirstName is not null) profile.FirstName = input.FirstName;
        if (input.LastName is not null) profile.LastName = input.LastName;
        if (input.Phone is not null) profile.Phone = input.Phone;
        if (input.AvatarUrl is not null) profile.AvatarUrl = input.AvatarUrl;
        if (input.Bio is not null) profile.Bio = input.Bio;

        profile.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return profile;
    }

    public async Task<bool> DeleteUserAsync(Guid id, Guid currentUserId, string role)
    {
        var profile = await _context.UserProfiles.FindAsync(id);
        if (profile is null) return false;

        // Verificar que el usuario es dueño del perfil o es ADMIN
        if (profile.UserId != currentUserId && role != "ADMIN")
            throw new UnauthorizedAccessException("Not authorized to delete this profile");

        _context.UserProfiles.Remove(profile);
        await _context.SaveChangesAsync();
        return true;
    }
}
