import { StockInsight } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendUp, Newspaper, ChartLine, SmileyXEyes, ArrowSquareOut } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface InsightsPanelProps {
  insights: StockInsight[];
  onPatternClick?: (insightId: string | null) => void;
  activePatternId?: string | null;
}

export function InsightsPanel({ insights, onPatternClick, activePatternId }: InsightsPanelProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'movement':
        return <TrendUp size={20} />;
      case 'news':
        return <Newspaper size={20} />;
      case 'technical':
        return <ChartLine size={20} />;
      case 'sentiment':
        return <SmileyXEyes size={20} />;
      default:
        return <Lightbulb size={20} />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'bg-accent text-accent-foreground';
    if (confidence >= 50) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb size={24} />
            AI Insights
          </CardTitle>
          <CardDescription>
            Click "Generate Insights" to analyze this stock
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb size={24} />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Understanding why the stock moved the way it did
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div 
              className={`p-4 border rounded-lg transition-colors ${
                insight.technicalPattern 
                  ? 'cursor-pointer hover:border-primary' 
                  : ''
              } ${
                activePatternId === insight.id 
                  ? 'border-primary bg-primary/5' 
                  : ''
              }`}
              onClick={() => {
                if (insight.technicalPattern) {
                  onPatternClick?.(activePatternId === insight.id ? null : insight.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1 text-primary">{getIcon(insight.type)}</div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                    
                    {insight.technicalPattern && (
                      <div className={`p-3 rounded-md border transition-colors ${
                        activePatternId === insight.id
                          ? 'bg-primary/10 border-primary/40'
                          : 'bg-primary/5 border-primary/20'
                      }`}>
                        <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                          <ChartLine size={14} weight="bold" />
                          Technical Pattern - Click to {activePatternId === insight.id ? 'hide' : 'show'} on chart
                        </p>
                        <p className="text-xs text-foreground">
                          <strong>{insight.technicalPattern.type}:</strong> {insight.technicalPattern.significance}
                        </p>
                      </div>
                    )}
                    
                    {insight.relatedNews && insight.relatedNews.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          📰 Related News:
                        </p>
                        {insight.relatedNews.map((article, idx) => (
                          <a
                            key={idx}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 text-xs p-2 rounded bg-muted/30 hover:bg-muted transition-colors group"
                          >
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1 py-0 ${
                                article.sentiment === 'positive' 
                                  ? 'border-accent text-accent' 
                                  : article.sentiment === 'negative'
                                  ? 'border-destructive text-destructive'
                                  : 'border-muted-foreground text-muted-foreground'
                              }`}
                            >
                              {article.sentiment}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-foreground line-clamp-2 group-hover:text-primary">
                                {article.title}
                              </p>
                              <p className="text-muted-foreground mt-0.5">
                                {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <ArrowSquareOut size={14} className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getConfidenceColor(insight.confidence)}>
                  {insight.confidence}%
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
