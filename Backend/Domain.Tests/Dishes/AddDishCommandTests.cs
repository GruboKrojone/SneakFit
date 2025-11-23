using Core.Authentication;
using Core.Database;
using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using MediatR;
using Moq;

namespace Domain.Tests.Dishes;

public class AddDishCommandTests
{
    private readonly Mock<IDishRepository> _dishRepository;
    private readonly Mock<IUserContext> _userContext;
    private readonly Mock<IUnitOfWork> _unitOfWork;
    private readonly AddDishCommandHandler _handler;

    public AddDishCommandTests()
    {
        _dishRepository = new Mock<IDishRepository>();
        _userContext = new Mock<IUserContext>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _handler = new AddDishCommandHandler(_dishRepository.Object, _userContext.Object, _unitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldAddDishAndReturnUnit()
    {
        // Arrange
        var userId = 1;
        var dishParams = new DishParams(
            Name: "Grilled Chicken",
            Description: "Healthy grilled chicken breast",
            Calories: 165,
            Protein: 31,
            Carbs: 0,
            Fat: 4
        );
        var command = new AddDishCommand(dishParams);

        _userContext.Setup(x => x.UserId).Returns(userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.Equal(Unit.Value, result);
        _dishRepository.Verify(x => x.Add(It.Is<Dish>(d =>
            d.Name == dishParams.Name &&
            d.Description == dishParams.Description &&
            d.Calories == dishParams.Calories &&
            d.Protein == dishParams.Protein &&
            d.Carbs == dishParams.Carbs &&
            d.Fat == dishParams.Fat &&
            d.OwnerId == userId
        )), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Once);
    }
}
