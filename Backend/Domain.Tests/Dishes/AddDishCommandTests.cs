using Core.Authentication;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using FluentAssertions;
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

        _dishRepository.Setup(x => x.Add(It.IsAny<Dish>()))
            .Callback<Dish>(d =>
            {
                typeof(EntityBase).GetProperty("Id")?.SetValue(d, 1);
            });
    }


    [Fact]
    public async Task ValidCommand_ShouldAddDishAndReturnDishId()
    {
        // Arrange
        var userId = 1;
        var dishParams = new DishParams(
            Name: "Grilled Chicken",
            Description: "Healthy grilled chicken breast",
            Calories: 165,
            Protein: 31,
            Carbs: 0,
            Fat: 4,
            IsPublic: true
        );
        var command = new AddDishCommand(dishParams);

        _userContext.Setup(x => x.UserId).Returns(userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeGreaterThan(0);
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

    [Fact]
    public async Task UserNotAuthenticated_ShouldThrowDomainException()
    {
        // Arrange
        var dishParams = new DishParams(
            Name: "Test Dish",
            Description: "Test Description",
            Calories: 100,
            Protein: 10,
            Carbs: 20,
            Fat: 5,
            IsPublic: true
        );
        var command = new AddDishCommand(dishParams);

        _userContext.Setup(x => x.UserId).Returns((int?)null);

        // Act
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("Nobody is authenticated")
            .Where(e => e.ErrorCode == (int)CommonErrorCode.Unauthorized);

        _dishRepository.Verify(x => x.Add(It.IsAny<Dish>()), Times.Never);
        _unitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DishWithOnlyRequiredFields_ShouldAddDishCorrectly()
    {
        // Arrange
        var userId = 3;
        var dishParams = new DishParams(
            Name: "Oatmeal",
            Description: null,
            Calories: null,
            Protein: null,
            Carbs: null,
            Fat: null,
            IsPublic: true
        );
        var command = new AddDishCommand(dishParams);

        _userContext.Setup(x => x.UserId).Returns(userId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeGreaterThan(0);
        _dishRepository.Verify(x => x.Add(It.Is<Dish>(d => d.Name == "Oatmeal")), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task DishIsAssignedToCorrectUser_ShouldSetOwnerIdCorrectly()
    {
        // Arrange
        var userId = 5;
        var dishParams = new DishParams(
            Name: "Protein Shake",
            Description: "Post-workout shake",
            Calories: 200,
            Protein: 40,
            Carbs: 10,
            Fat: 2,
            IsPublic: true
        );
        var command = new AddDishCommand(dishParams);

        _userContext.Setup(x => x.UserId).Returns(userId);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _dishRepository.Verify(x => x.Add(It.Is<Dish>(d => d.OwnerId == userId)), Times.Once);
    }
}