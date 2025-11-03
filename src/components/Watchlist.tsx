import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from '@phosphor-icons/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: string;
}

interface WatchlistProps {
  currentSymbol?: string;
  onSelectStock: (symbol: string) => void;
}

export function Watchlist({ currentSymbol, onSelectStock }: WatchlistProps) {
  const [watchlist, setWatchlist] = useKV<WatchlistItem[]>('stock-watchlist', []);

  const isInWatchlist = (symbol: string) => {
    return (watchlist || []).some((item) => item.symbol === symbol);
  };

  const addToWatchlist = (symbol: string, name: string) => {
    setWatchlist((current) => {
      const list = current || [];
      if (list.some((item) => item.symbol === symbol)) {
        return list;
      }
      return [
        ...list,
        {
          symbol,
          name,
          addedAt: new Date().toISOString(),
        },
      ];
    });
    toast.success(`${symbol} added to watchlist`);
  };

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist((current) => (current || []).filter((item) => item.symbol !== symbol));
    toast.success(`${symbol} removed from watchlist`);
  };

  const items = watchlist || [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star size={20} />
          Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Star size={48} className="mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Your watchlist is empty
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Search for stocks and add them here
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.symbol}
                  className={`p-3 border rounded-lg flex items-center justify-between hover:border-primary transition-colors cursor-pointer ${
                    currentSymbol === item.symbol ? 'border-primary bg-muted' : ''
                  }`}
                  onClick={() => onSelectStock(item.symbol)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{item.symbol}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWatchlist(item.symbol);
                    }}
                  >
                    <Star size={16} className="text-primary" weight="fill" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function WatchlistToggle({
  symbol,
  name,
}: {
  symbol: string;
  name: string;
}) {
  const [watchlist, setWatchlist] = useKV<WatchlistItem[]>('stock-watchlist', []);

  const toggleWatchlist = () => {
    setWatchlist((current) => {
      const currentList = current || [];
      const exists = currentList.some((item) => item.symbol === symbol);
      
      if (exists) {
        toast.success(`${symbol} removed from watchlist`);
        return currentList.filter((item) => item.symbol !== symbol);
      } else {
        toast.success(`${symbol} added to watchlist`);
        return [
          ...currentList,
          {
            symbol,
            name,
            addedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const isInWatchlist = (watchlist || []).some((item) => item.symbol === symbol);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleWatchlist}
      className="gap-2"
    >
      {isInWatchlist ? (
        <>
          <Star size={20} className="text-primary" weight="fill" />
          In Watchlist
        </>
      ) : (
        <>
          <Star size={20} />
          Add to Watchlist
        </>
      )}
    </Button>
  );
}
