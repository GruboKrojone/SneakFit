using System.Security.Cryptography;
using System.Text;
using Core.Database;
using Domain.Users.Entities;
using Domain.Users.Enums;
using Domain.Users.Repositories;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("init")]
public class InitController : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public bool Get() => true;

    [HttpGet]
    [Route("restrict")]
    [Authorize(Roles = "Admin")]
    public bool GetRestrict() => true;

    [HttpPost]
    [AllowAnonymous]
    [Route("user")]
    public async Task<Unit> CreateInitUser(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        using var hmac = new HMACSHA512();
        var passwordBytes = "Password123$d"u8.ToArray();
    
        var user = new User(
            "user@example.com",
            hmac.ComputeHash(passwordBytes),
            passwordSalt: hmac.Key,
            UserRole.Admin,
            "User",
            23
        );

        userRepository.Add(user);
        await unitOfWork.SaveChangesAsync(CancellationToken.None);
    
        return Unit.Value;
    }

}