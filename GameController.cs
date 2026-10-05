using GothicMonopoly.Services;
using Microsoft.AspNetCore.Mvc;

namespace GothicMonopoly.Controllers;

[ApiController]
[Route("api/game")]
public class GameController : ControllerBase
{
    private readonly GameService _svc;
    public GameController(GameService svc) => _svc = svc;

    public record NewGameReq(string[] Names);
    public record BoolReq(bool Value);

    [HttpPost("new")]
    public IActionResult New([FromBody] NewGameReq req)
    {
        if (req.Names is null || req.Names.Length < 2 || req.Names.Length > 4)
            return BadRequest("2–4 игрока");
        return Ok(_svc.NewGame(req.Names));
    }

    [HttpGet("{id}")]
    public IActionResult Get(string id) => Ok(_svc.Get(id));

    [HttpPost("{id}/roll")]
    public IActionResult Roll(string id) => Ok(_svc.Roll(id));

    [HttpPost("{id}/buy")]
    public IActionResult Buy(string id, [FromBody] BoolReq r) => Ok(_svc.Buy(id, r.Value));

    [HttpPost("{id}/build")]
    public IActionResult Build(string id) => Ok(_svc.Build(id));

    [HttpPost("{id}/end-turn")]
    public IActionResult EndTurn(string id) => Ok(_svc.EndTurn(id));
}