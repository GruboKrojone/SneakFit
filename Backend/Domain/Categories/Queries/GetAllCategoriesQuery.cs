using System.Linq;
using Core.CQRS;
using Core.Middlewares;
using Domain.Categories.Dto;
using Domain.Categories.Repositories;

namespace Domain.Categories.Queries;

public record GetAllCategoriesQuery : IQuery<IEnumerable<CategoryDto>>;

internal sealed class GetAllCategoriesQueryHandler(
    ICategoryRepository categoryRepository) : IQueryHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
{
    public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await categoryRepository.FindAsync(
            _ => true,
            cancellationToken) ?? throw new DomainException("No categories found", (int)CommonErrorCode.EntityNotFound);

        return categories.Select(c => new CategoryDto(c.Id, c.NameEn, c.NamePl, c.NameDe, c.NameEs, c.Color));
    }
}
