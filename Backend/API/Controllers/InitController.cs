using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("init")]
[AllowAnonymous]
public class InitController : ControllerBase
{
    [HttpGet]
    public bool Get() => true;
}