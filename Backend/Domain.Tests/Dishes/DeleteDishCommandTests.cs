using Core.Authentication;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Commands;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using Domain.Users.Repositories;
using FluentAssertions;
using MediatR;
using Moq;

namespace Domain.Tests.Dishes;

public class DeleteDishCommandTests
{
    private readonly Mock<IDishRepository> _dishRepository;
    private readonly Mock<IUserRepository> _userRepository;
    private readonly Mock<IUserContext> _userContext;
    private readonly Mock<IUnitOfWork> _unitOfWork;
    private readonly DeleteDishCommandHandler _handler;

    public DeleteDishCommandTests()
    {
        _dishRepository = new Mock<IDishRepository>();
        _userRepository = new Mock<IUserRepository>();
        _userContext = new Mock<IUserContext>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _handler = new DeleteDishCommandHandler(
            _dishRepository.Object,
            _userRepository.Object,
            _userContext.Object,
            _unitOfWork.Object);
    }


    [Fact]
    public async Task AuthorizedUser_ShouldDeleteDish()
    {
        // Arrange
        var userId = 1;
        var dishId = 10;
        var dish = new Dish("Test Dish", null, null, null, null, userId);

        typeof(Dish).GetProperty("Id")?.SetValue(dish, dishId);

        _userContext.Setup(x => x.UserId).Returns(userId);
        _userRepository.Setup(x => x.IsOperationAllowed(userId, dishId)).Returns(true);
        _dishRepository.Setup(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dish);

        var command = new DeleteDishCommand(dishId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _userRepository.Verify(x => x.IsOperationAllowed(userId, dishId), Times.Once);
        _dishRepository.Verify(x => x.FindAsync(dishId, CancellationToken.None), Times.Once);
        _dishRepository.Verify(x => x.Delete(dish), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task UnauthorizedUser_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var userId = 1;
        var dishId = 10;
        var dish = new Dish("Test Dish", null, null, null, null, null);

        _userContext.Setup(x => x.UserId).Returns(userId);
        _dishRepository.Setup(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dish);
        _userRepository.Setup(x => x.IsOperationAllowed(userId, dishId)).Returns(false);

        var command = new DeleteDishCommand(dishId);

        // Act
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("User is not allowed to delete that recipe!");

        _dishRepository.Verify(x => x.Delete(It.IsAny<Dish>()), Times.Never);
        _unitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task UserNotAuthenticated_ShouldThrowDomainException()
    {
        // Arrange
        var dishId = 10;
        _userContext.Setup(x => x.UserId).Returns((int?)null);
        var command = new DeleteDishCommand(dishId);

        // Act
        var act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("Log in please!")
            .Where(e => e.ErrorCode == (int)CommonErrorCode.Unauthorized);

        _dishRepository.Verify(x => x.FindAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        _dishRepository.Verify(x => x.Delete(It.IsAny<Dish>()), Times.Never);
        _unitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}