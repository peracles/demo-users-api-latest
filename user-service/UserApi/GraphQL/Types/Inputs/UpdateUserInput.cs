using System.ComponentModel.DataAnnotations;

namespace UserApi.GraphQL.Types.Inputs;

public class UpdateUserInput
{
    [MaxLength(100)]
    public string? FirstName { get; set; }

    [MaxLength(100)]
    public string? LastName { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }
}
