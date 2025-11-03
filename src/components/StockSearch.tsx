import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { searchStocks } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

export function StockSearch({ onSelectStock }: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const stocks = await searchStocks(value);
      setResults(stocks);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (symbol: string) => {
    onSelectStock(symbol);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          type="text"
          placeholder="Search stocks (e.g., AAPL, TSLA)"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
          {results.map((stock) => (
            <Button
              key={stock.symbol}
              variant="ghost"
              className="w-full justify-start px-4 py-3 hover:bg-muted"
              onClick={() => handleSelect(stock.symbol)}
            >
              <div className="flex flex-col items-start">
                <span className="font-semibold">{stock.symbol}</span>
                <span className="text-sm text-muted-foreground">{stock.name}</span>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
