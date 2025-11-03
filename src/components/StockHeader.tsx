import { StockData } from '@/lib/types';
import { TrendUp, TrendDown } from '@phosphor-icons/react';
import { Card, CardContent } from '@/components/ui/card';

interface StockHeaderProps {
  stock: StockData;
}

export function StockHeader({ stock }: StockHeaderProps) {
  const isPositive = stock.change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{stock.symbol}</h1>
              <div className={`flex items-center gap-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? <TrendUp size={24} weight="bold" /> : <TrendDown size={24} weight="bold" />}
              </div>
            </div>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-4xl font-semibold tabular-nums">
              ${stock.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-2 text-lg font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
              <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)}</span>
              <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Open</p>
            <p className="text-lg font-medium tabular-nums">${stock.open.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">High</p>
            <p className="text-lg font-medium tabular-nums">${stock.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Low</p>
            <p className="text-lg font-medium tabular-nums">${stock.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="text-lg font-medium tabular-nums">{stock.volume.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
