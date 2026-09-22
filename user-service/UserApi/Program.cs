using Microsoft.EntityFrameworkCore;
using UserApi.Data;
using UserApi.GraphQL.Mutations;
using UserApi.GraphQL.Queries;
using UserApi.Security;
using UserApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Entity Framework Core + PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("UsersDb")));

// JWT Authentication
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddHttpContextAccessor();

// Business Services
builder.Services.AddScoped<IUserService, UserService>();

// HotChocolate GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType<UserQuery>()
    .AddMutationType<UserMutation>()
    .AddAuthorization()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapGraphQL("/graphql");

app.MapGet("/", () => "Hello World!");

app.Run();
