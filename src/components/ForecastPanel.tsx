import { MarketForecast } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendUp, TrendDown, ArrowsLeftRight, ChartLine } from '@phosphor-icons/react';
import { Separator } from '@/components/ui/separator';

interface ForecastPanelProps {
  forecasts: MarketForecast[];
}

export function ForecastPanel({ forecasts }: ForecastPanelProps) {
  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return <TrendUp size={20} className="text-positive" />;
      case 'bearish':
        return <TrendDown size={20} className="text-negative" />;
      default:
        return <ArrowsLeftRight size={20} className="text-muted-foreground" />;
    }
  };

  const getDirectionColor = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return 'bg-accent text-accent-foreground';
      case 'bearish':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getTimeLabel = (horizon: string) => {
    switch (horizon) {
      case 'short':
        return 'Short-term (1-4 weeks)';
      case 'medium':
        return 'Medium-term (1-3 months)';
      case 'long':
        return 'Long-term (3-12 months)';
      default:
        return horizon;
    }
  };

  if (forecasts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine size={24} />
            Market Forecast
          </CardTitle>
          <CardDescription>
            Click "Generate Forecast" to see AI predictions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartLine size={24} />
          Market Forecast
        </CardTitle>
        <CardDescription>
          Educational predictions showing what experienced investors look for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {forecasts.map((forecast, index) => (
          <div key={index}>
            {index > 0 && <Separator className="mb-6" />}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getDirectionIcon(forecast.direction)}
                  <div>
                    <h4 className="font-semibold">{getTimeLabel(forecast.timeHorizon)}</h4>
                    <Badge className={`mt-1 ${getDirectionColor(forecast.direction)}`}>
                      {forecast.direction.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-semibold">{forecast.confidence}%</p>
                </div>
              </div>

              <div>
                <p className="text-sm leading-relaxed text-foreground">
                  {forecast.reasoning}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Key Factors</p>
                  <ul className="space-y-1">
                    {forecast.keyFactors.map((factor, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">Risks to Consider</p>
                  <ul className="space-y-1">
                    {forecast.risks.map((risk, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-destructive mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {forecast.technicalSignals && forecast.technicalSignals.length > 0 && (
                <div className="bg-muted/50 p-3 rounded-md border">
                  <p className="text-sm font-medium mb-2 text-primary">📊 Technical Signals</p>
                  <ul className="space-y-1">
                    {forecast.technicalSignals.map((signal, idx) => (
                      <li key={idx} className="text-xs flex items-start gap-2">
                        <span className="text-primary mt-0.5">▸</span>
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
