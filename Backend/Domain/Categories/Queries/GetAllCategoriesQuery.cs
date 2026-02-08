using System.Linq;
using Core.Authentication;
using Core.CQRS;
using Core.Middlewares;
using Domain.Categories.Dto;
using Domain.Categories.Entities;
using Domain.Categories.Repositories;

namespace Domain.Categories.Queries;

public record GetAllCategoriesQuery : IQuery<IEnumerable<CategoryDto>>;

internal sealed class GetAllCategoriesQueryHandler(
    ICategoryRepository categoryRepository,
    IUserContext userContext) : IQueryHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
{
    public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var userId = userContext.UserId
            ?? throw new DomainException("Nobody is authenticated", (int)CommonErrorCode.Unauthorized);

        var categories = await categoryRepository.FindAsync(
            _ => true,
            cancellationToken) ?? throw new DomainException("No categories found", (int)CommonErrorCode.EntityNotFound);

        return categories.Select(c => new CategoryDto(c.Id, c.NameEn, c.NamePl, c.NameDe, c.NameEs, c.Color));
    }
}
