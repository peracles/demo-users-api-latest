using UserApi.Data.Entities;
using UserApi.GraphQL.Types.Inputs;

namespace UserApi.Services;

public interface IUserService
{
    Task<IEnumerable<UserProfile>> GetAllUsersAsync();
    Task<UserProfile?> GetUserByIdAsync(Guid id);
    Task<UserProfile?> CreateUserInternalAsync(Guid userId, string firstName, string lastName);
    Task<UserProfile?> UpdateUserAsync(Guid id, UpdateUserInput input, Guid currentUserId, string role);
    Task<bool> DeleteUserAsync(Guid id, Guid currentUserId, string role);
}
