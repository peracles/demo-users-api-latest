using HotChocolate.Types;
using UserApi.Data.Entities;

namespace UserApi.GraphQL.Types;

public class UserProfileType : ObjectType<UserProfile>
{
    protected override void Configure(IObjectTypeDescriptor<UserProfile> descriptor)
    {
        descriptor.Field(f => f.Id).Type<NonNullType<UuidType>>();
        descriptor.Field(f => f.UserId).Type<NonNullType<UuidType>>();
        descriptor.Field(f => f.FirstName).Type<NonNullType<StringType>>();
        descriptor.Field(f => f.LastName).Type<NonNullType<StringType>>();
        descriptor.Field(f => f.Phone).Type<StringType>();
        descriptor.Field(f => f.AvatarUrl).Type<StringType>();
        descriptor.Field(f => f.Bio).Type<StringType>();
        descriptor.Field(f => f.CreatedAt).Type<NonNullType<DateTimeType>>();
        descriptor.Field(f => f.UpdatedAt).Type<NonNullType<DateTimeType>>();
    }
}
