using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;
using UserApi.Data;
using UserApi.Data.Entities;

namespace UserApi.GraphQL.Queries;

public class UserQuery
{
    [Authorize]
    public IQueryable<UserProfile> GetUsers([Service] AppDbContext context)
    {
        return context.UserProfiles.AsNoTracking().OrderBy(u => u.LastName);
    }

    [Authorize]
    public async Task<UserProfile?> GetUserById(
        [Service] AppDbContext context,
        Guid id)
    {
        return await context.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);
    }
}
