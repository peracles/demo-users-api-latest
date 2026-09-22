global using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using UserApi.Data;
using UserApi.Data.Entities;
using UserApi.GraphQL.Types.Inputs;
using UserApi.Services;

namespace UserApi.Tests;

public class UserServiceTests
{
    private readonly AppDbContext _context;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        // Usar DbContext en memoria para pruebas
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _userService = new UserService(_context);
    }

    [Fact]
    public async Task GetAllUsersAsync_ShouldReturnAllUsers()
    {
        // Arrange
        _context.UserProfiles.AddRange(
            new UserProfile { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), FirstName = "Carlos", LastName = "Garcia", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new UserProfile { Id = Guid.NewGuid(), UserId = Guid.NewGuid(), FirstName = "Maria", LastName = "Lopez", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        );
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.GetAllUsersAsync();

        // Assert
        result.Should().HaveCount(2);
        result.Should().BeInAscendingOrder(u => u.LastName);
    }

    [Fact]
    public async Task GetUserByIdAsync_WhenUserExists_ShouldReturnUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var profile = new UserProfile 
        { 
            Id = userId, 
            UserId = Guid.NewGuid(), 
            FirstName = "Carlos", 
            LastName = "Garcia",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("Carlos");
    }

    [Fact]
    public async Task GetUserByIdAsync_WhenUserNotExists_ShouldReturnNull()
    {
        // Act
        var result = await _userService.GetUserByIdAsync(Guid.NewGuid());

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateUserAsync_WhenUserIsOwner_ShouldUpdate()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var profile = new UserProfile
        {
            Id = profileId,
            UserId = userId,
            FirstName = "Carlos",
            LastName = "Garcia",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        var input = new UpdateUserInput { FirstName = "Carlos Updated" };

        // Act
        var result = await _userService.UpdateUserAsync(profileId, input, userId, "USER");

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("Carlos Updated");
    }

    [Fact]
    public async Task UpdateUserAsync_WhenUserIsNotOwner_ShouldThrow()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var profile = new UserProfile
        {
            Id = profileId,
            UserId = otherUserId,
            FirstName = "Carlos",
            LastName = "Garcia",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        var input = new UpdateUserInput { FirstName = "Hacked" };

        // Act
        var act = () => _userService.UpdateUserAsync(profileId, input, userId, "USER");

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Not authorized to update this profile");
    }

    [Fact]
    public async Task UpdateUserAsync_WhenUserIsAdmin_ShouldUpdateEvenIfNotOwner()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var profileId = Guid.NewGuid();
        var profile = new UserProfile
        {
            Id = profileId,
            UserId = otherUserId,
            FirstName = "Carlos",
            LastName = "Garcia",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _context.UserProfiles.Add(profile);
        await _context.SaveChangesAsync();

        var input = new UpdateUserInput { FirstName = "Admin Updated" };

        // Act
        var result = await _userService.UpdateUserAsync(profileId, input, userId, "ADMIN");

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("Admin Updated");
    }
}
