import { useState, useEffect } from 'react';
import { StockSearch } from '@/components/StockSearch';
import { StockHeader } from '@/components/StockHeader';
import { StockChart } from '@/components/StockChart';
import { InsightsPanel } from '@/components/InsightsPanel';
import { ForecastPanel } from '@/components/ForecastPanel';
import { TeachingAssistant } from '@/components/TeachingAssistant';
import { Watchlist, WatchlistToggle } from '@/components/Watchlist';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { fetchStockData, fetchHistoricalData, fetchStockNews } from '@/lib/api';
import { generateMovementAnalysis, generateMarketForecast } from '@/lib/ai-analysis';
import { StockData, HistoricalDataPoint, StockInsight, MarketForecast, NewsArticle, TechnicalPattern } from '@/lib/types';
import { Lightbulb, ChartLine, Robot } from '@phosphor-icons/react';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [insights, setInsights] = useState<StockInsight[]>([]);
  const [forecasts, setForecasts] = useState<MarketForecast[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isForecasting, setIsForecasting] = useState(false);
  const [isTeachingOpen, setIsTeachingOpen] = useState(false);
  const [highlightedPattern, setHighlightedPattern] = useState<TechnicalPattern | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedSymbol) {
      loadStockData(selectedSymbol);
    }
  }, [selectedSymbol]);

  const loadStockData = async (symbol: string) => {
    setIsLoading(true);
    setInsights([]);
    setForecasts([]);
    setHighlightedPattern(null);
    setActivePatternId(null);
    
    try {
      const [stock, historical, newsData] = await Promise.all([
        fetchStockData(symbol),
        fetchHistoricalData(symbol, 30),
        fetchStockNews(symbol),
      ]);

      setStockData(stock);
      setHistoricalData(historical);
      setNews(newsData);
    } catch (error) {
      console.error('Error loading stock data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!stockData) return;

    setIsAnalyzing(true);
    try {
      const generatedInsights = await generateMovementAnalysis(
        stockData,
        news,
        historicalData
      );
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateForecast = async () => {
    if (!stockData) return;

    setIsForecasting(true);
    try {
      const generatedForecasts = await generateMarketForecast(
        stockData,
        historicalData,
        news
      );
      setForecasts(generatedForecasts);
    } catch (error) {
      console.error('Error generating forecast:', error);
    } finally {
      setIsForecasting(false);
    }
  };

  const handlePatternClick = (insightId: string | null) => {
    if (!insightId || insightId === activePatternId) {
      setHighlightedPattern(null);
      setActivePatternId(null);
      return;
    }
    
    const insight = insights.find(i => i.id === insightId);
    if (insight?.technicalPattern) {
      setHighlightedPattern(insight.technicalPattern);
      setActivePatternId(insightId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ChartLine size={32} className="text-primary" weight="bold" />
              <div>
                <h1 className="text-2xl font-bold">StockSense AI</h1>
                <p className="text-sm text-muted-foreground">Learn to invest like a pro</p>
              </div>
            </div>
            <StockSearch onSelectStock={setSelectedSymbol} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ) : stockData ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <StockHeader stock={stockData} />
                  </div>
                </div>

                <Card id="price-chart">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Price Chart (30 Days)</CardTitle>
                    <WatchlistToggle symbol={stockData.symbol} name={stockData.name} />
                  </CardHeader>
                  <CardContent>
                    {historicalData.length > 0 ? (
                      <StockChart 
                        data={historicalData} 
                        height={300} 
                        highlightedPattern={highlightedPattern}
                      />
                    ) : (
                      <Skeleton className="h-[300px] w-full" />
                    )}
                  </CardContent>
                </Card>

                <Tabs defaultValue="insights" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                    <TabsTrigger value="forecast">Forecast</TabsTrigger>
                    <TabsTrigger value="learn">Learn</TabsTrigger>
                  </TabsList>

                  <TabsContent value="insights" className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        onClick={handleGenerateInsights}
                        disabled={isAnalyzing}
                        className="gap-2"
                      >
                        <Lightbulb size={20} />
                        {isAnalyzing ? 'Analyzing...' : 'Generate Insights'}
                      </Button>
                    </div>
                    <InsightsPanel 
                      insights={insights} 
                      onPatternClick={handlePatternClick}
                      activePatternId={activePatternId}
                    />
                  </TabsContent>

                  <TabsContent value="forecast" className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        onClick={handleGenerateForecast}
                        disabled={isForecasting}
                        className="gap-2"
                      >
                        <ChartLine size={20} />
                        {isForecasting ? 'Forecasting...' : 'Generate Forecast'}
                      </Button>
                    </div>
                    <ForecastPanel forecasts={forecasts} />
                  </TabsContent>

                  <TabsContent value="learn" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Robot size={24} />
                          Interactive Learning
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          Start a guided analysis session to learn how to evaluate {stockData.symbol} like 
                          an experienced investor. Our AI teaching assistant will ask you questions and 
                          provide feedback as you learn.
                        </p>
                        <Button
                          onClick={() => setIsTeachingOpen(true)}
                          className="gap-2"
                        >
                          <Robot size={20} />
                          Start Learning Session
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <ChartLine size={64} className="mx-auto mb-4 text-muted-foreground" />
                  <h2 className="text-2xl font-semibold mb-2">Welcome to StockSense AI</h2>
                  <p className="text-muted-foreground">
                    Search for a stock symbol above to get started with AI-powered analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {!isTeachingOpen && (
            <div className="lg:col-span-1">
              <Watchlist
                currentSymbol={selectedSymbol}
                onSelectStock={setSelectedSymbol}
              />
            </div>
          )}
        </div>
      </main>

      {stockData && (
        <TeachingAssistant
          stock={stockData}
          isOpen={isTeachingOpen}
          onClose={() => setIsTeachingOpen(false)}
        />
      )}

      <Toaster />
    </div>
  );
}

export default App;