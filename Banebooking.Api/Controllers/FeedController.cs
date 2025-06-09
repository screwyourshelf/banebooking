using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Banebooking.Api.Tjenester;
using Banebooking.Api.Dtos;

namespace Banebooking.Api.Controllers;

[ApiController]
[Route("api/klubb/{slug}/feed")]
public class FeedController(
    
    IKlubbService klubbService,
    IFeedService feedService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> HentFeed(string slug)
    {
        var klubb = await klubbService.HentKlubbAsync(slug);
        if (klubb == null)
            return NotFound("Klubb ikke funnet.");

        if (string.IsNullOrWhiteSpace(klubb.FeedUrl))
            return Ok(Enumerable.Empty<FeedItemDto>());

        var feedItems = await feedService.HentFeed(klubb);
        return Ok(feedItems);
    }
}
