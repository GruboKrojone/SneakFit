using Core.Authentication;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Commands;
using Domain.Dishes.Dto;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using FluentAssertions;
using Moq;

namespace Domain.Tests.Dishes;

public class UpdateDishCommandTests
{
    private readonly Mock<IDishRepository> _dishRepository;
    private readonly Mock<IUserRepository> _userRepository;
    private readonly Mock<IUserContext> _userContext;
    private readonly Mock<IUnitOfWork> _unitOfWork;
    private readonly UpdateDishCommandHandler _handler;

    public UpdateDishCommandTests()
    {
        _dishRepository = new Mock<IDishRepository>();
        _userRepository = new Mock<IUserRepository>();
        _userContext = new Mock<IUserContext>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _handler = new UpdateDishCommandHandler(
            _dishRepository.Object,
            _userRepository.Object,
            _userContext.Object,
            _unitOfWork.Object);
    }

    [Fact]
    public async Task AuthorizedUser_ShouldUpdateDish()
    {
        // Arrange
        var existingDish = new Dish("Old Dish", "Old Description", 100, 10, 10, 10);

        var updatedParams = new DishParams(
            Name: "Updated Dish",
            Description: "Updated Description",
            Calories: 200,
            Protein: 20,
            Carbs: 20,
            Fat: 20);

        _userContext.Setup(x => x.UserId).Returns(1);
        _dishRepository.Setup(x => x.FindAsync(existingDish.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDish);
        _userRepository.Setup(x => x.IsOperationAllowed(1, existingDish.Id)).Returns(true);

        var command = new UpdateDishCommand(existingDish.Id, updatedParams);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(updatedParams.Name);
        result.Description.Should().Be(updatedParams.Description);
        result.Calories.Should().Be(updatedParams.Calories);
        result.Protein.Should().Be(updatedParams.Protein);
        result.Carbs.Should().Be(updatedParams.Carbs);
        result.Fat.Should().Be(updatedParams.Fat);

        _dishRepository.Verify(x => x.FindAsync(existingDish.Id, CancellationToken.None), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task UnauthorizedUser_ShouldThrowDomainException()
    {
        // Arrange
        var existingDish = new Dish("Old Dish", "Old Description", 100, 10, 10, 10);
        var updatedParams = new DishParams(
            Name: "Updated Dish",
            Description: "Updated Description",
            Calories: 200,
            Protein: 20,
            Carbs: 20,
            Fat: 20);
        _userContext.Setup(x => x.UserId).Returns(1);
        _dishRepository.Setup(x => x.FindAsync(existingDish.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDish);
        _userRepository.Setup(x => x.IsOperationAllowed(1, existingDish.Id)).Returns(false);
        var command = new UpdateDishCommand(existingDish.Id, updatedParams);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("User is not allowed to update this dish");
        _dishRepository.Verify(x => x.FindAsync(existingDish.Id, CancellationToken.None), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Never);
    }

    [Fact]
    public async Task DishNotFound_ShouldThrowDomainException()
    {
        // Arrange
        var updatedParams = new DishParams(
            Name: "Updated Dish",
            Description: "Updated Description",
            Calories: 200,
            Protein: 20,
            Carbs: 20,
            Fat: 20);
        _userContext.Setup(x => x.UserId).Returns(1);
        _dishRepository.Setup(x => x.FindAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Dish?)null);
        var command = new UpdateDishCommand(999, updatedParams);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("Dish with name 'Updated Dish' not found");
        _dishRepository.Verify(x => x.FindAsync(999, CancellationToken.None), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Never);
    }
}