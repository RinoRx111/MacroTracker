import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

export const FoodSearch = ({ onSearch, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const data = await onSearch(query);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Search Foods" subtitle="Find nutrition info" />
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for foods..."
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition"
              >
                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                {item.brand && <div className="text-xs text-gray-500">{item.brand}</div>}
              </button>

              {expanded === item.id && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-2 text-sm">
                  <div>Cal: {item.calories_per_100g}/100g</div>
                  <div>Protein: {item.protein_per_100g}g</div>
                  <div>Carbs: {item.carbs_per_100g}g</div>
                  <div>Fat: {item.fat_per_100g}g</div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => onSelect(item)}
                    className="col-span-2"
                  >
                    Add to Food Log
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No foods found. Try a different search.
        </div>
      )}
    </Card>
  );
};
