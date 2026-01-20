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

public class MarkDishFavoriteCommandTests
{
    private readonly Mock<IDishRepository> _dishRepository;
    private readonly Mock<IUserRepository> _userRepository;
    private readonly Mock<IFavoritedRepository> _favoritedRepository;
    private readonly Mock<IUserContext> _userContext;
    private readonly Mock<IUnitOfWork> _unitOfWork;
    private readonly MarkDishAsFavoriteCommandHandler _handler;
    private readonly Mock<ILogger> _logger;

    public MarkDishFavoriteCommandTests()
    {
        _dishRepository = new Mock<IDishRepository>();
        _userRepository = new Mock<IUserRepository>();
        _favoritedRepository = new Mock<IFavoritedRepository>();
        _userContext = new Mock<IUserContext>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _logger = new Mock<ILogger>();
        _handler = new MarkDishAsFavoriteCommandHandler(
            _dishRepository.Object,
            _userRepository.Object,
            _favoritedRepository.Object,
            _userContext.Object,
            _unitOfWork.Object,
            _logger.Object);
    }


    [Fact]
    public async Task AuthorizedUser_ShouldMarkDishAsFavorite()
    {
        // Arrange
        var userId = 1;
        var dishId = 10;
        var user = new User(
            "test@example.com",
            "Password",
            UserRole.User,
            "Test User",
            25);

        typeof(User).GetProperty("Id")?.SetValue(user, userId);

        var dish = new Dish("Test Dish", null, null, null, null, null);

        typeof(Dish).GetProperty("Id")?.SetValue(dish, dishId);

        _userContext.Setup(x => x.UserId).Returns(userId);
        _userRepository.Setup(x => x.FindAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        _dishRepository.Setup(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dish);

        var command = new MarkDishFavoriteCommand(dishId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _userRepository.Verify(x => x.FindAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
        _dishRepository.Verify(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()), Times.Once);
        _favoritedRepository.Verify(x => x.Add(It.Is<Favorited>(f => f.UserId == userId && f.DishId == dishId)), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UnauthorizedUser_ShouldThrowDomainException()
    {
        // Arrange
        var dishId = 10;
        _userContext.Setup(x => x.UserId).Returns((int?)null);
        var command = new MarkDishFavoriteCommand(dishId);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("User is not authenticated");
    }
}