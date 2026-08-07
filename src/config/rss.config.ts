export interface RSSProviderConfig {
  id: string;
  name: string;
  urls: string[];
  enabled: boolean;
}

export const RSS_CONFIG: RSSProviderConfig[] = [
  {
    id: 'newsapi',
    name: 'NewsAPI',
    urls: [], // NewsAPI handles its own URLs internally
    enabled: true
  },
  {
    id: 'google-rss',
    name: 'Google News RSS',
    urls: process.env.GOOGLE_NEWS_RSS_URLS 
      ? process.env.GOOGLE_NEWS_RSS_URLS.split(/[;,]/) 
      : ['https://news.google.com/rss/search?q=TNPSC+OR+Tamil+Nadu&hl=en-IN&gl=IN&ceid=IN:en'],
    enabled: true
  },
  {
    id: 'the-hindu',
    name: 'The Hindu RSS',
    urls: process.env.THE_HINDU_RSS_URLS 
      ? process.env.THE_HINDU_RSS_URLS.split(/[;,]/) 
      : [
          'https://www.thehindu.com/news/national/feeder/default.rss',
          'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss',
          'https://www.thehindu.com/sci-tech/science/feeder/default.rss',
          'https://www.thehindu.com/business/Economy/feeder/default.rss'
        ],
    enabled: true
  },
  {
    id: 'times-of-india',
    name: 'Times of India RSS',
    urls: process.env.TIMES_OF_INDIA_RSS_URLS 
      ? process.env.TIMES_OF_INDIA_RSS_URLS.split(/[;,]/) 
      : [
          'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
          'https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms', // India
          'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms', // World
          'https://timesofindia.indiatimes.com/rssfeeds/1898055.cms' // Business
        ],
    enabled: true
  }
];
