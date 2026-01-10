using Core.Authentication;
using Core.Database;
using Core.Middlewares;
using Domain.Dishes.Commands;
using Domain.Dishes.Entities;
using Domain.Dishes.Repositories;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using FluentAssertions;
using MediatR;
using Moq;
using Serilog;

namespace Domain.Tests.Dishes;

public class MarkDishFavouriteCommandTests
{
    private readonly Mock<IDishRepository> _dishRepository;
    private readonly Mock<IUserRepository> _userRepository;
    private readonly Mock<IUserContext> _userContext;
    private readonly Mock<IUnitOfWork> _unitOfWork;
    private readonly MarkDishAsFavouriteCommandHandler _handler;
    private readonly Mock<ILogger> _logger;

    public MarkDishFavouriteCommandTests()
    {
        _dishRepository = new Mock<IDishRepository>();
        _userRepository = new Mock<IUserRepository>();
        _userContext = new Mock<IUserContext>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _logger = new Mock<ILogger>();
        _handler = new MarkDishAsFavouriteCommandHandler(
            _dishRepository.Object,
            _userRepository.Object,
            _userContext.Object,
            _unitOfWork.Object,
            _logger.Object);
    }


    [Fact]
    public async Task AuthorizedUser_ShouldMarkDishAsFavourite()
    {
        var userId = 1;
        var dishId = 10;
        var user = new User(
            "test@example.com",
            "Password",
            UserRole.User,
            "Test User",
            25);
        var dish = new Dish("Test Dish", null, null, null, null, null);

        _userContext.Setup(x => x.UserId).Returns(userId);
        _userRepository.Setup(x => x.FindAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _dishRepository.Setup(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dish);

        var command = new MarkDishFavouriteCommand(dishId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        user.FavoriteDishes.Should().Contain(dish);
        user.FavoriteDishes.Should().HaveCount(1);
        _userRepository.Verify(x => x.FindAsync(userId, CancellationToken.None), Times.Once);
        _dishRepository.Verify(x => x.FindAsync(dishId, CancellationToken.None), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task UnauthorizedUser_ShouldThrowDomainException()
    {
        // Arrange
        var dishId = 10;
        _userContext.Setup(x => x.UserId).Returns((int?)null);
        var command = new MarkDishFavouriteCommand(dishId);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("User is not authenticated");
    }
}