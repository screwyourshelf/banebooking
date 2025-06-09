using Banebooking.Api.Dtos;
using CodeHollow.FeedReader;

namespace Banebooking.Api.Tjenester;

public interface IFeedService
{
    Task<List<FeedItemDto>> HentFeed(Klubb klubb);
}

public class FeedService(ICacheService cache) : IFeedService
{
    private const int SynligIPeriodedager = 7;
    private static readonly TimeSpan CacheTid = TimeSpan.FromHours(5);

    public Task<List<FeedItemDto>> HentFeed(Klubb klubb)
    {
        if (string.IsNullOrWhiteSpace(klubb.FeedUrl))
        {
            return Task.FromResult<List<FeedItemDto>>([]);
        }

        string cacheKey = CacheKeys.Feed(klubb.Slug);

        return cache.HentEllerSettAsync(cacheKey, async () =>
        {
            var rawFeed = await FeedReader.ReadAsync(klubb.FeedUrl);

            var items = rawFeed.Items
                .Where(item =>
                    item.Categories.Any(cat => cat.Equals("obs", StringComparison.OrdinalIgnoreCase)) &&
                    (DateTime.Now - item.PublishingDate)?.TotalDays < SynligIPeriodedager
                )
                .Select(item => new FeedItemDto
                {
                    Title = item.Title,
                    Link = item.Link,
                    PublishingDate = item.PublishingDate
                })
                .ToList();

            return items;
        }, CacheTid);
    }
}
