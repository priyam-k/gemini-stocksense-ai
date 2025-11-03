import { StockData, StockInsight, MarketForecast, NewsArticle, HistoricalDataPoint, TechnicalPattern } from './types';

declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
};

function detectTechnicalPatterns(data: HistoricalDataPoint[]): TechnicalPattern[] {
  const patterns: TechnicalPattern[] = [];
  
  if (data.length < 10) return patterns;

  const prices = data.map(d => d.price);
  
  const trianglePattern = detectTrianglePattern(data);
  if (trianglePattern) patterns.push(trianglePattern);
  
  const headAndShouldersPattern = detectHeadAndShoulders(data);
  if (headAndShouldersPattern) patterns.push(headAndShouldersPattern);
  
  const doubleTopBottomPattern = detectDoubleTopBottom(data);
  if (doubleTopBottomPattern) patterns.push(doubleTopBottomPattern);
  
  const supportResistancePattern = detectSupportResistance(data);
  if (supportResistancePattern) patterns.push(supportResistancePattern);
  
  const trendPattern = detectTrendPattern(data);
  if (trendPattern) patterns.push(trendPattern);
  
  return patterns.slice(0, 4);
}

function detectTrianglePattern(data: HistoricalDataPoint[]): TechnicalPattern | null {
  if (data.length < 15) return null;
  
  const prices = data.map(d => d.price);
  const recent = prices.slice(-15);
  
  const highs: number[] = [];
  const highIndices: number[] = [];
  const lows: number[] = [];
  const lowIndices: number[] = [];
  
  for (let i = 1; i < recent.length - 1; i++) {
    if (recent[i] > recent[i - 1] && recent[i] > recent[i + 1]) {
      highs.push(recent[i]);
      highIndices.push(data.length - 15 + i);
    }
    if (recent[i] < recent[i - 1] && recent[i] < recent[i + 1]) {
      lows.push(recent[i]);
      lowIndices.push(data.length - 15 + i);
    }
  }
  
  if (highs.length >= 2 && lows.length >= 2) {
    const highSlope = (highs[highs.length - 1] - highs[0]) / (highs.length - 1);
    const lowSlope = (lows[lows.length - 1] - lows[0]) / (lows.length - 1);
    
    const converging = Math.abs(highSlope - lowSlope) > Math.abs(highs[0] - lows[0]) * 0.01;
    
    if (converging) {
      let patternType = 'Symmetrical Triangle';
      if (highSlope < -0.1 && lowSlope > 0.1) {
        patternType = 'Symmetrical Triangle';
      } else if (highSlope < -0.1 && Math.abs(lowSlope) < 0.05) {
        patternType = 'Descending Triangle';
      } else if (Math.abs(highSlope) < 0.05 && lowSlope > 0.1) {
        patternType = 'Ascending Triangle';
      }
      
      return {
        type: patternType,
        patternKey: 'triangle',
        startIndex: data.length - 15,
        endIndex: data.length - 1,
        description: `${patternType} forming with converging trendlines`,
        significance: patternType.includes('Ascending') 
          ? 'Bullish pattern - breakout above resistance typically signals upward move'
          : patternType.includes('Descending')
          ? 'Bearish pattern - breakdown below support typically signals downward move'
          : 'Consolidation pattern - breakout direction indicates next major move',
        overlayData: {
          lines: [
            {
              x1: highIndices[0],
              y1: highs[0],
              x2: highIndices[highIndices.length - 1],
              y2: highs[highs.length - 1],
              label: 'Upper trendline'
            },
            {
              x1: lowIndices[0],
              y1: lows[0],
              x2: lowIndices[lowIndices.length - 1],
              y2: lows[lows.length - 1],
              label: 'Lower trendline'
            }
          ]
        }
      };
    }
  }
  
  return null;
}

function detectHeadAndShoulders(data: HistoricalDataPoint[]): TechnicalPattern | null {
  if (data.length < 20) return null;
  
  const prices = data.map(d => d.price);
  const recent = prices.slice(-20);
  
  const peaks: Array<{ index: number; price: number }> = [];
  
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i] > recent[i - 1] && recent[i] > recent[i - 2] && 
        recent[i] > recent[i + 1] && recent[i] > recent[i + 2]) {
      peaks.push({ index: data.length - 20 + i, price: recent[i] });
    }
  }
  
  if (peaks.length >= 3) {
    const [left, head, right] = peaks.slice(-3);
    
    if (head.price > left.price * 1.02 && head.price > right.price * 1.02 &&
        Math.abs(left.price - right.price) / left.price < 0.03) {
      
      const troughs: Array<{ index: number; price: number }> = [];
      for (let i = left.index; i < right.index; i++) {
        const localIdx = i - (data.length - 20);
        if (localIdx > 0 && localIdx < recent.length - 1) {
          if (recent[localIdx] < recent[localIdx - 1] && recent[localIdx] < recent[localIdx + 1]) {
            troughs.push({ index: i, price: recent[localIdx] });
          }
        }
      }
      
      let necklineY = left.price;
      if (troughs.length >= 2) {
        necklineY = (troughs[0].price + troughs[troughs.length - 1].price) / 2;
      }
      
      return {
        type: 'Head and Shoulders',
        patternKey: 'head-and-shoulders',
        startIndex: left.index,
        endIndex: right.index,
        description: 'Classic head and shoulders reversal pattern forming',
        significance: 'Bearish reversal pattern - breaking below neckline suggests downward move',
        overlayData: {
          lines: [
            {
              x1: left.index,
              y1: necklineY,
              x2: right.index,
              y2: necklineY,
              label: 'Neckline'
            }
          ],
          points: [
            { x: left.index, y: left.price, label: 'Left Shoulder' },
            { x: head.index, y: head.price, label: 'Head' },
            { x: right.index, y: right.price, label: 'Right Shoulder' }
          ]
        }
      };
    }
  }
  
  return null;
}

function detectDoubleTopBottom(data: HistoricalDataPoint[]): TechnicalPattern | null {
  if (data.length < 15) return null;
  
  const prices = data.map(d => d.price);
  const recent = prices.slice(-15);
  
  const peaks: Array<{ index: number; price: number }> = [];
  const troughs: Array<{ index: number; price: number }> = [];
  
  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i] > recent[i - 1] && recent[i] > recent[i + 1]) {
      peaks.push({ index: data.length - 15 + i, price: recent[i] });
    }
    if (recent[i] < recent[i - 1] && recent[i] < recent[i + 1]) {
      troughs.push({ index: data.length - 15 + i, price: recent[i] });
    }
  }
  
  if (peaks.length >= 2) {
    const [first, second] = peaks.slice(-2);
    if (Math.abs(first.price - second.price) / first.price < 0.02) {
      return {
        type: 'Double Top',
        patternKey: 'double-top',
        startIndex: first.index,
        endIndex: second.index,
        description: 'Double top pattern indicating potential reversal',
        significance: 'Bearish reversal pattern - two failed attempts at higher prices',
        overlayData: {
          lines: [
            {
              x1: first.index,
              y1: first.price,
              x2: second.index,
              y2: second.price,
              label: 'Resistance'
            }
          ],
          points: [
            { x: first.index, y: first.price, label: 'First Top' },
            { x: second.index, y: second.price, label: 'Second Top' }
          ]
        }
      };
    }
  }
  
  if (troughs.length >= 2) {
    const [first, second] = troughs.slice(-2);
    if (Math.abs(first.price - second.price) / first.price < 0.02) {
      return {
        type: 'Double Bottom',
        patternKey: 'double-bottom',
        startIndex: first.index,
        endIndex: second.index,
        description: 'Double bottom pattern indicating potential reversal',
        significance: 'Bullish reversal pattern - two successful tests of support level',
        overlayData: {
          lines: [
            {
              x1: first.index,
              y1: first.price,
              x2: second.index,
              y2: second.price,
              label: 'Support'
            }
          ],
          points: [
            { x: first.index, y: first.price, label: 'First Bottom' },
            { x: second.index, y: second.price, label: 'Second Bottom' }
          ]
        }
      };
    }
  }
  
  return null;
}

function detectSupportResistance(data: HistoricalDataPoint[]): TechnicalPattern | null {
  if (data.length < 10) return null;
  
  const prices = data.map(d => d.price);
  const recent = prices.slice(-10);
  
  const recentHigh = Math.max(...recent);
  const recentLow = Math.min(...recent);
  const currentPrice = prices[prices.length - 1];
  const priceRange = recentHigh - recentLow;
  
  const highTouches = recent.filter(p => Math.abs(p - recentHigh) < priceRange * 0.02).length;
  const lowTouches = recent.filter(p => Math.abs(p - recentLow) < priceRange * 0.02).length;
  
  if (Math.abs(currentPrice - recentHigh) < priceRange * 0.05 && highTouches >= 2) {
    return {
      type: 'Testing Resistance',
      patternKey: 'resistance',
      startIndex: data.length - 10,
      endIndex: data.length - 1,
      description: `Price testing resistance level at $${recentHigh.toFixed(2)}`,
      significance: 'Breaking above resistance could trigger upward momentum',
      overlayData: {
        lines: [
          {
            x1: data.length - 10,
            y1: recentHigh,
            x2: data.length - 1,
            y2: recentHigh,
            label: `Resistance $${recentHigh.toFixed(2)}`
          }
        ]
      }
    };
  } else if (Math.abs(currentPrice - recentLow) < priceRange * 0.05 && lowTouches >= 2) {
    return {
      type: 'Testing Support',
      patternKey: 'support',
      startIndex: data.length - 10,
      endIndex: data.length - 1,
      description: `Price testing support level at $${recentLow.toFixed(2)}`,
      significance: 'Holding support suggests buying interest at this level',
      overlayData: {
        lines: [
          {
            x1: data.length - 10,
            y1: recentLow,
            x2: data.length - 1,
            y2: recentLow,
            label: `Support $${recentLow.toFixed(2)}`
          }
        ]
      }
    };
  }
  
  return null;
}

function detectTrendPattern(data: HistoricalDataPoint[]): TechnicalPattern | null {
  if (data.length < 15) return null;
  
  const prices = data.map(d => d.price);
  const recent = prices.slice(-15);
  
  const highs: Array<{ index: number; price: number }> = [];
  const lows: Array<{ index: number; price: number }> = [];
  
  for (let i = 1; i < recent.length - 1; i++) {
    if (recent[i] > recent[i - 1] && recent[i] > recent[i + 1]) {
      highs.push({ index: data.length - 15 + i, price: recent[i] });
    }
    if (recent[i] < recent[i - 1] && recent[i] < recent[i + 1]) {
      lows.push({ index: data.length - 15 + i, price: recent[i] });
    }
  }
  
  if (lows.length >= 2 && highs.length >= 2) {
    const lowSlope = (lows[lows.length - 1].price - lows[0].price) / (lows.length - 1);
    const highSlope = (highs[highs.length - 1].price - highs[0].price) / (highs.length - 1);
    
    const priceRange = Math.max(...recent) - Math.min(...recent);
    
    if (lowSlope > priceRange * 0.03 && highSlope > priceRange * 0.03) {
      return {
        type: 'Uptrend Channel',
        patternKey: 'uptrend',
        startIndex: data.length - 15,
        endIndex: data.length - 1,
        description: 'Price moving within an upward trending channel',
        significance: 'Bullish trend - higher highs and higher lows indicate strength',
        overlayData: {
          lines: [
            {
              x1: highs[0].index,
              y1: highs[0].price,
              x2: highs[highs.length - 1].index,
              y2: highs[highs.length - 1].price,
              label: 'Upper channel'
            },
            {
              x1: lows[0].index,
              y1: lows[0].price,
              x2: lows[lows.length - 1].index,
              y2: lows[lows.length - 1].price,
              label: 'Lower channel'
            }
          ]
        }
      };
    } else if (lowSlope < -priceRange * 0.03 && highSlope < -priceRange * 0.03) {
      return {
        type: 'Downtrend Channel',
        patternKey: 'downtrend',
        startIndex: data.length - 15,
        endIndex: data.length - 1,
        description: 'Price moving within a downward trending channel',
        significance: 'Bearish trend - lower highs and lower lows indicate weakness',
        overlayData: {
          lines: [
            {
              x1: highs[0].index,
              y1: highs[0].price,
              x2: highs[highs.length - 1].index,
              y2: highs[highs.length - 1].price,
              label: 'Upper channel'
            },
            {
              x1: lows[0].index,
              y1: lows[0].price,
              x2: lows[lows.length - 1].index,
              y2: lows[lows.length - 1].price,
              label: 'Lower channel'
            }
          ]
        }
      };
    }
  }
  
  return null;
}

function calculateVolatilityNumeric(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const changes = prices.slice(1).map((price, idx) => 
    Math.abs(price - prices[idx]) / prices[idx]
  );
  
  return changes.reduce((a, b) => a + b, 0) / changes.length;
}

export async function generateMovementAnalysis(
  stock: StockData,
  news: NewsArticle[],
  historicalData: HistoricalDataPoint[]
): Promise<StockInsight[]> {
  try {
    const recentTrend = calculateTrend(historicalData);
    const patterns = detectTechnicalPatterns(historicalData);
    const newsContext = news.map(n => `"${n.title}" (${n.sentiment}, ${n.source})`).join('\n');

    const prompt = spark.llmPrompt`You are an expert stock market analyst and educator teaching novice investors. Analyze why ${stock.symbol} (${stock.name}) moved ${stock.changePercent > 0 ? 'up' : 'down'} by ${Math.abs(stock.changePercent).toFixed(2)}% today.

Current price: $${stock.price.toFixed(2)}
30-day trend: ${recentTrend}

Technical patterns detected:
${patterns.map(p => `- ${p.type}: ${p.description}`).join('\n')}

Recent news articles:
${newsContext}

Generate exactly 3-4 insightful analyses explaining the price movement. For each insight:
1. Focus on ONE specific factor (technical pattern, news event, market condition, or sentiment)
2. Explain HOW that factor influenced the price movement (be specific and educational)
3. If referencing a technical pattern, explain what it means and why it matters
4. If referencing news, explain the specific impact of that news on investor behavior
5. Include a confidence level (0-100) based on evidence strength
6. Make it educational - explain concepts a beginner should understand

IMPORTANT: When mentioning technical patterns, use these EXACT pattern names if detected:
- "triangle" for triangle patterns (ascending, descending, symmetrical)
- "head-and-shoulders" for head and shoulders
- "double-top" or "double-bottom" for double top/bottom
- "support" or "resistance" for support/resistance levels
- "uptrend" or "downtrend" for trending channels

Return as JSON:
{
  "insights": [
    {
      "type": "movement|news|technical|sentiment",
      "title": "Concise headline (max 8 words)",
      "description": "2-3 educational sentences explaining the factor and its impact",
      "confidence": 75,
      "patternType": "triangle|head-and-shoulders|double-top|double-bottom|support|resistance|uptrend|downtrend|none",
      "newsIndices": [0, 1]
    }
  ]
}

Note: newsIndices should reference the index of relevant news articles (0-${news.length - 1}) if applicable, otherwise empty array.`;

    const response = await spark.llm(prompt, 'gpt-4o', true);
    const parsed = JSON.parse(response);

    return parsed.insights.map((insight: any, idx: number) => {
      const relatedNews = (insight.newsIndices || [])
        .filter((i: number) => i < news.length)
        .map((i: number) => news[i]);

      let technicalPattern: TechnicalPattern | undefined = undefined;
      if (insight.patternType && insight.patternType !== 'none') {
        technicalPattern = patterns.find(p => 
          p.patternKey === insight.patternType ||
          p.type.toLowerCase().includes(insight.patternType.toLowerCase()) ||
          insight.patternType.toLowerCase().includes(p.patternKey || '')
        );
      }

      return {
        id: `insight-${Date.now()}-${idx}`,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        confidence: insight.confidence,
        relatedNews: relatedNews.length > 0 ? relatedNews : undefined,
        technicalPattern,
        timestamp: new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return generateFallbackInsights(stock, news, historicalData);
  }
}

export async function generateMarketForecast(
  stock: StockData,
  historicalData: HistoricalDataPoint[],
  news: NewsArticle[]
): Promise<MarketForecast[]> {
  try {
    const trend = calculateTrend(historicalData);
    const volatility = calculateVolatility(historicalData);
    const newsSentiment = calculateNewsSentiment(news);
    const patterns = detectTechnicalPatterns(historicalData);

    const prompt = spark.llmPrompt`You are an investment educator analyzing ${stock.symbol} for teaching purposes. Generate educational market forecasts for three time horizons with technical analysis reasoning.

Current data:
- Price: $${stock.price.toFixed(2)} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)
- 30-day trend: ${trend}
- Volatility: ${volatility}
- News sentiment: ${newsSentiment}

Technical patterns observed:
${patterns.map(p => `- ${p.type}: ${p.description} (${p.significance})`).join('\n')}

For each time horizon (short: 1-4 weeks, medium: 1-3 months, long: 3-12 months):
1. Provide direction (bullish/bearish/neutral) with specific reasoning
2. Reference technical patterns and what they suggest
3. Explain key factors a professional investor would watch
4. Identify potential risks and their likelihood
5. Make it educational - teach what to look for

Return as JSON:
{
  "forecasts": [
    {
      "timeHorizon": "short|medium|long",
      "direction": "bullish|bearish|neutral",
      "confidence": 65,
      "reasoning": "Educational explanation referencing specific technical or fundamental factors",
      "keyFactors": ["Specific factor 1", "Specific factor 2", "Specific factor 3"],
      "risks": ["Specific risk 1", "Specific risk 2"],
      "technicalSignals": ["Signal 1", "Signal 2"]
    }
  ]
}`;

    const response = await spark.llm(prompt, 'gpt-4o', true);
    const parsed = JSON.parse(response);

    return parsed.forecasts;
  } catch (error) {
    console.error('Error generating forecast:', error);
    return generateFallbackForecast(stock);
  }
}

export async function generateTeachingQuestion(
  stock: StockData,
  step: number,
  totalSteps: number,
  previousAnswers: string[]
): Promise<string> {
  try {
    const topics = [
      'understanding price and volume',
      'analyzing price changes and trends',
      'interpreting market cap and valuation',
      'reading technical indicators',
      'evaluating news impact',
      'risk assessment',
    ];

    const currentTopic = topics[Math.min(step, topics.length - 1)];

    const prompt = spark.llmPrompt`You are a patient investment teacher helping a beginner learn to analyze ${stock.symbol}.

Current lesson step: ${step + 1} of ${totalSteps}
Topic: ${currentTopic}

Stock data:
- Price: $${stock.price.toFixed(2)}
- Change: ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
- Volume: ${stock.volume.toLocaleString()}

Generate ONE clear, focused question that:
1. Teaches the student what to look for in this aspect of stock analysis
2. Can be answered based on the data shown
3. Builds on previous concepts
4. Is appropriate for a complete beginner

Just return the question text, no extra formatting.`;

    return await spark.llm(prompt, 'gpt-4o-mini', false);
  } catch (error) {
    console.error('Error generating question:', error);
    return `Looking at ${stock.symbol}, what does the ${stock.changePercent > 0 ? 'positive' : 'negative'} price change tell you about today's trading activity?`;
  }
}

export async function evaluateTeachingAnswer(
  question: string,
  userAnswer: string,
  stock: StockData
): Promise<string> {
  try {
    const prompt = spark.llmPrompt`You are an encouraging investment teacher. A student answered your question about ${stock.symbol}.

Question: ${question}
Student's answer: ${userAnswer}

Provide constructive feedback that:
1. Acknowledges what they got right
2. Gently corrects misconceptions
3. Adds one key insight to deepen understanding
4. Encourages continued learning

Keep response to 2-3 sentences, warm and supportive tone.`;

    return await spark.llm(prompt, 'gpt-4o-mini', false);
  } catch (error) {
    console.error('Error evaluating answer:', error);
    return "Great thinking! Let's explore that concept further as we continue.";
  }
}

function calculateTrend(data: HistoricalDataPoint[]): string {
  if (data.length < 2) return 'stable';

  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const change = ((lastPrice - firstPrice) / firstPrice) * 100;

  if (change > 5) return 'strong upward';
  if (change > 2) return 'upward';
  if (change < -5) return 'strong downward';
  if (change < -2) return 'downward';
  return 'stable';
}

function calculateVolatility(data: HistoricalDataPoint[]): string {
  if (data.length < 2) return 'low';

  const changes = data.slice(1).map((point, idx) => 
    Math.abs(point.price - data[idx].price) / data[idx].price
  );

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;

  if (avgChange > 0.05) return 'high';
  if (avgChange > 0.02) return 'moderate';
  return 'low';
}

function calculateNewsSentiment(news: NewsArticle[]): string {
  if (news.length === 0) return 'neutral';

  const sentimentScore = news.reduce((score, article) => {
    if (article.sentiment === 'positive') return score + 1;
    if (article.sentiment === 'negative') return score - 1;
    return score;
  }, 0);

  if (sentimentScore > 1) return 'positive';
  if (sentimentScore < -1) return 'negative';
  return 'mixed';
}

function generateFallbackInsights(stock: StockData, news: NewsArticle[], historicalData: HistoricalDataPoint[]): StockInsight[] {
  const insights: StockInsight[] = [];
  const patterns = detectTechnicalPatterns(historicalData);

  if (Math.abs(stock.changePercent) > 3) {
    const relatedNews = news.filter(n => n.sentiment === (stock.changePercent > 0 ? 'positive' : 'negative'));
    
    insights.push({
      id: `insight-${Date.now()}-0`,
      type: 'movement',
      title: 'Significant Price Movement Detected',
      description: `${stock.symbol} experienced a ${Math.abs(stock.changePercent).toFixed(2)}% ${stock.changePercent > 0 ? 'increase' : 'decrease'} today. Large price movements often indicate strong market reaction to news or events. This magnitude of change suggests institutional investors or significant market participants are repositioning.`,
      confidence: 75,
      relatedNews: relatedNews.length > 0 ? relatedNews.slice(0, 2) : undefined,
      timestamp: new Date().toISOString(),
    });
  }

  if (patterns.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-1`,
      type: 'technical',
      title: `Technical Pattern: ${patterns[0].type}`,
      description: `${patterns[0].description}. ${patterns[0].significance}. Technical analysts use such patterns to anticipate potential price movements.`,
      confidence: 70,
      technicalPattern: patterns[0],
      timestamp: new Date().toISOString(),
    });
  }

  if (stock.volume > 50000000) {
    insights.push({
      id: `insight-${Date.now()}-2`,
      type: 'technical',
      title: 'Elevated Trading Volume',
      description: 'Today\'s trading volume is significantly higher than typical levels, suggesting increased investor interest and engagement. High volume typically confirms the strength and sustainability of a price movement.',
      confidence: 70,
      timestamp: new Date().toISOString(),
    });
  }

  const positiveNews = news.filter(n => n.sentiment === 'positive');
  const negativeNews = news.filter(n => n.sentiment === 'negative');
  
  if (positiveNews.length > negativeNews.length && positiveNews.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-3`,
      type: 'sentiment',
      title: 'Positive News Sentiment Dominance',
      description: 'Recent news coverage has been predominantly positive, which typically supports bullish investor sentiment. News sentiment is a leading indicator that often precedes price movements.',
      confidence: 65,
      relatedNews: positiveNews.slice(0, 2),
      timestamp: new Date().toISOString(),
    });
  } else if (negativeNews.length > positiveNews.length && negativeNews.length > 0) {
    insights.push({
      id: `insight-${Date.now()}-3`,
      type: 'sentiment',
      title: 'Negative News Pressure',
      description: 'Recent news coverage has been predominantly negative, creating headwinds for the stock. Negative sentiment can drive selling pressure as investors reassess positions.',
      confidence: 65,
      relatedNews: negativeNews.slice(0, 2),
      timestamp: new Date().toISOString(),
    });
  }

  return insights.slice(0, 4);
}

function generateFallbackForecast(stock: StockData): MarketForecast[] {
  const direction = stock.changePercent > 2 ? 'bullish' : stock.changePercent < -2 ? 'bearish' : 'neutral';

  return [
    {
      timeHorizon: 'short',
      direction,
      confidence: 60,
      reasoning: 'Short-term outlook based on recent price action and momentum indicators.',
      keyFactors: ['Recent price trend', 'Trading volume', 'Market sentiment'],
      risks: ['Market volatility', 'Unexpected news'],
    },
    {
      timeHorizon: 'medium',
      direction: 'neutral',
      confidence: 50,
      reasoning: 'Medium-term forecast requires monitoring upcoming earnings and industry trends.',
      keyFactors: ['Earnings reports', 'Industry performance', 'Economic indicators'],
      risks: ['Economic changes', 'Competition', 'Regulatory changes'],
    },
    {
      timeHorizon: 'long',
      direction: 'neutral',
      confidence: 45,
      reasoning: 'Long-term performance depends on company fundamentals and market position.',
      keyFactors: ['Business model strength', 'Innovation pipeline', 'Market share'],
      risks: ['Technological disruption', 'Market shifts', 'Management changes'],
    },
  ];
}
