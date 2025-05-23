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
    
    [HttpGet]
    [Route("restrict2")]
    [Authorize(Roles = "Admin")]
    public bool GetRestrict2() => true;
}