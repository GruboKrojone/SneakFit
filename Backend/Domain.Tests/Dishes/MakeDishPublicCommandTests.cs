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

public class MakeDishPublicCommandTests
{
    private readonly Mock<IDishRepository> _dishRepository;
    private readonly Mock<IUserRepository> _userRepository;
    private readonly Mock<IUserContext> _userContext;
    private readonly Mock<IUnitOfWork> _unitOfWork;
    private readonly MakeDishPublicCommandHandler _handler;

    public MakeDishPublicCommandTests()
    {
        _dishRepository = new Mock<IDishRepository>();
        _userRepository = new Mock<IUserRepository>();
        _userContext = new Mock<IUserContext>();
        _unitOfWork = new Mock<IUnitOfWork>();
        _handler = new MakeDishPublicCommandHandler(
            _dishRepository.Object,
            _userRepository.Object,
            _userContext.Object,
            _unitOfWork.Object);
    }


    [Fact]
    public async Task AuthorizedUser_ShouldMakeDishPublic()
    {
        // Arrange
        var userId = 1;
        var dishId = 10;
        var dish = new Dish("Test Dish", null, null, null, null, null);

        _userContext.Setup(x => x.UserId).Returns(userId);
        _dishRepository.Setup(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dish);
        _userRepository.Setup(x => x.IsOperationAllowed(userId, dish.Id)).Returns(true);
        var command = new MakeDishPublicCommand(dishId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().Be(Unit.Value);
        _dishRepository.Verify(x => x.FindAsync(dishId, CancellationToken.None), Times.Once);
        _dishRepository.Verify(x => x.Update(dish), Times.Once);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task UnauthorizedUser_ShouldThrowDomainException()
    {
        // Arrange
        var userId = 1;
        var dishId = 10;
        var dish = new Dish("Test Dish", null, null, null, null, null);
        _userContext.Setup(x => x.UserId).Returns(userId);
        _dishRepository.Setup(x => x.FindAsync(dishId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(dish);
        _userRepository.Setup(x => x.IsOperationAllowed(userId, dish.Id)).Returns(false);
        var command = new MakeDishPublicCommand(dishId);

        // Act
        Func<Task> act = async () => await _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<DomainException>()
            .WithMessage("User is not allowed to make this dish public");
        _dishRepository.Verify(x => x.FindAsync(dishId, CancellationToken.None), Times.Once);
        _dishRepository.Verify(x => x.Update(It.IsAny<Dish>()), Times.Never);
        _unitOfWork.Verify(x => x.SaveChangesAsync(CancellationToken.None), Times.Never);
    }
}
