import { StockData, HistoricalDataPoint, NewsArticle } from './types';

const ALPHA_VANTAGE_KEY = 'Y0CUTJMZWV5CZUKO';
const FINNHUB_KEY = 'd43ttahr01qge0cviff0d43ttahr01qge0cviffg';

function generateMockStockData(symbol: string): StockData {
  const basePrice = Math.random() * 500 + 50;
  const change = (Math.random() - 0.5) * 20;
  const changePercent = (change / basePrice) * 100;

  const companies: Record<string, string> = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'META': 'Meta Platforms Inc.',
    'JPM': 'JPMorgan Chase & Co.',
    'V': 'Visa Inc.',
    'WMT': 'Walmart Inc.',
  };

  return {
    symbol,
    name: companies[symbol] || `${symbol} Corporation`,
    price: basePrice,
    change,
    changePercent,
    volume: Math.floor(Math.random() * 100000000),
    marketCap: Math.floor(Math.random() * 1000000000000),
    high: basePrice + Math.abs(change),
    low: basePrice - Math.abs(change),
    open: basePrice - change / 2,
    previousClose: basePrice - change,
    lastUpdate: new Date().toISOString(),
  };
}

function generateMockHistoricalData(days: number): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let price = Math.random() * 500 + 100;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    price += (Math.random() - 0.5) * 20;
    price = Math.max(50, price);

    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 100000000),
    });
  }

  return data;
}

function generateMockNews(symbol: string): NewsArticle[] {
  const newsTemplates = [
    {
      title: `${symbol} Reports Strong Quarterly Earnings`,
      summary: 'Company exceeds analyst expectations with robust revenue growth.',
      sentiment: 'positive' as const,
    },
    {
      title: `Analysts Upgrade ${symbol} Price Target`,
      summary: 'Major investment firms raise price targets citing strong fundamentals.',
      sentiment: 'positive' as const,
    },
    {
      title: `${symbol} Faces Regulatory Scrutiny`,
      summary: 'Government agencies launch investigation into business practices.',
      sentiment: 'negative' as const,
    },
    {
      title: `${symbol} Announces New Product Launch`,
      summary: 'Company unveils innovative product line expected to drive growth.',
      sentiment: 'positive' as const,
    },
    {
      title: `Market Volatility Impacts ${symbol}`,
      summary: 'Broader market concerns create headwinds for stock performance.',
      sentiment: 'negative' as const,
    },
  ];

  return newsTemplates.slice(0, 3).map((template, idx) => ({
    ...template,
    source: ['Reuters', 'Bloomberg', 'CNBC', 'WSJ'][idx % 4],
    url: '#',
    publishedAt: new Date(Date.now() - idx * 3600000).toISOString(),
  }));
}

export async function fetchStockData(symbol: string): Promise<StockData> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (data['Note'] || data['Error Message'] || !data['Global Quote']) {
      console.warn('API limit reached or invalid symbol, using mock data');
      return generateMockStockData(symbol);
    }

    const quote = data['Global Quote'];
    
    return {
      symbol: quote['01. symbol'],
      name: symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      marketCap: 0,
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      lastUpdate: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return generateMockStockData(symbol);
  }
}

export async function fetchHistoricalData(
  symbol: string,
  days: number = 30
): Promise<HistoricalDataPoint[]> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_KEY}`
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (data['Note'] || data['Error Message'] || !data['Time Series (Daily)']) {
      console.warn('API limit reached, using mock data');
      return generateMockHistoricalData(days);
    }

    const timeSeries = data['Time Series (Daily)'];
    const points: HistoricalDataPoint[] = [];

    Object.entries(timeSeries)
      .slice(0, days)
      .forEach(([date, values]: [string, any]) => {
        points.push({
          date,
          price: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        });
      });

    return points.reverse();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return generateMockHistoricalData(days);
  }
}

export async function fetchStockNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateDaysAgo(7)}&to=${getTodayDate()}&token=${FINNHUB_KEY}`
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No news data available, using mock data');
      return generateMockNews(symbol);
    }

    return data.slice(0, 5).map((article: any) => ({
      title: article.headline,
      source: article.source,
      url: article.url,
      publishedAt: new Date(article.datetime * 1000).toISOString(),
      summary: article.summary || article.headline,
      sentiment: analyzeSentiment(article.headline + ' ' + article.summary),
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return generateMockNews(symbol);
  }
}

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['strong', 'growth', 'profit', 'gain', 'upgrade', 'beat', 'surge'];
  const negativeWords = ['weak', 'loss', 'decline', 'downgrade', 'miss', 'plunge', 'concern'];

  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
  if (!query || query.length < 1) return [];

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
  ];

  const upperQuery = query.toUpperCase();
  return popularStocks.filter(
    (stock) =>
      stock.symbol.includes(upperQuery) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
  );
}
