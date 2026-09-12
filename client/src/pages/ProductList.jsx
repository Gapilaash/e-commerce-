import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 300 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sort = searchParams.get('sort') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const [priceInputs, setPriceInputs] = useState({ min: minPrice, max: maxPrice });

  useEffect(() => {
    api.get('/products/price-range').then(res => setPriceBounds(res.data));
  }, []);

  useEffect(() => {
    setPriceInputs({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (sort) params.sort = sort;
    if (category) params.category = category;
    if (search) params.search = search;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minRating) params.minRating = minRating;

    api.get('/products', { params })
      .then(res => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [sort, category, search, minPrice, maxPrice, minRating]);

  function updateParam(key, val) {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  }

  function applyPriceFilter(e) {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    priceInputs.min ? next.set('minPrice', priceInputs.min) : next.delete('minPrice');
    priceInputs.max ? next.set('maxPrice', priceInputs.max) : next.delete('maxPrice');
    setSearchParams(next);
  }

  function clearAllFilters() {
    setSearchParams(new URLSearchParams(search ? { search } : {}));
    setPriceInputs({ min: '', max: '' });
  }

  const hasActiveFilters = category || minPrice || maxPrice || minRating;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h1 className="font-display text-2xl sm:text-3xl">
          {category || (search ? `Results for "${search}"` : 'All products')}
        </h1>

        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(o => !o)} className="btn-secondary py-1.5 px-3 text-sm md:hidden">
            Filters {hasActiveFilters && '•'}
          </button>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted hidden sm:inline">Sort by price:</label>
            <select
              className="input w-auto"
              value={sort}
              onChange={e => updateParam('sort', e.target.value)}
            >
              <option value="">Default</option>
              <option value="low">Low to High</option>
              <option value="high">High to Low</option>
              <option value="medium">Medium range</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        {/* Filters sidebar */}
        <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block space-y-6 h-fit`}>
          {category && (
            <button onClick={() => updateParam('category', '')} className="text-sm text-forest underline">
              Clear category: {category}
            </button>
          )}

          <div>
            <h3 className="font-medium text-sm mb-3">Price range</h3>
            <form onSubmit={applyPriceFilter} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder={`Rs. ${priceBounds.min}`}
                className="input"
                value={priceInputs.min}
                onChange={e => setPriceInputs(p => ({ ...p, min: e.target.value }))}
              />
              <span className="text-muted text-sm">–</span>
              <input
                type="number"
                min="0"
                placeholder={`Rs. ${priceBounds.max}`}
                className="input"
                value={priceInputs.max}
                onChange={e => setPriceInputs(p => ({ ...p, max: e.target.value }))}
              />
            </form>
            <button onClick={applyPriceFilter} className="btn-secondary text-sm w-full mt-2">Apply</button>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-3">Minimum rating</h3>
            <div className="space-y-1.5">
              {[4, 3, 2].map(r => (
                <button
                  key={r}
                  onClick={() => updateParam('minRating', minRating === String(r) ? '' : String(r))}
                  className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded text-sm ${minRating === String(r) ? 'bg-forest-light text-forest-dark' : 'hover:bg-forest-light/50'}`}
                >
                  <StarRating value={r} size={13} /> <span>&amp; up</span>
                </button>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-sm text-muted underline">
              Clear all filters
            </button>
          )}
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <p className="text-muted">Loading products…</p>
          ) : products.length === 0 ? (
            <p className="text-muted">No products match your filters.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
