import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import CategoryIcon from '../components/CategoryIcon';

export default function Home() {
  const { user } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    api.get('/products').then(res => {
      setFeatured(res.data.slice(0, 8));
      setProductCount(res.data.length);
    });
    api.get('/products/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/ai/recommendations').then(res => setRecommended(res.data)).catch(() => {});
    }
  }, [user]);

  const heroProduct = featured[0];
  const sideProducts = featured.slice(1, 3);

  return (
    <div>
      {/* Bento hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-4">
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {/* Main headline card */}
          <div className="md:col-span-2 card bg-forest text-white p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden">
            <span className="inline-block text-xs font-medium tracking-wide uppercase text-forest-light/80 mb-4">
              AI-assisted shopping
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-[1.12] mb-4 max-w-lg">
              Find things you'll actually use.
            </h1>
            <p className="text-white/75 mb-7 max-w-sm text-sm sm:text-base">
              Meridian learns from your cart and past orders to surface products
              worth your attention — no endless scrolling required.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="bg-gold text-white px-5 py-2.5 rounded font-medium hover:brightness-105 transition">
                Browse products
              </Link>
              <Link to="/products?sort=low" className="border border-white/30 text-white px-5 py-2.5 rounded font-medium hover:bg-white/10 transition">
                Shop by lowest price
              </Link>
            </div>
            <div className="mt-8 flex gap-6 text-sm text-white/70">
              <span><strong className="text-white font-display text-lg">{productCount}+</strong> products</span>
              <span><strong className="text-white font-display text-lg">{categories.length}</strong> categories</span>
              <span><strong className="text-white font-display text-lg">AI</strong> recommendations</span>
            </div>
          </div>

          {/* Featured product spotlight */}
          <div className="card overflow-hidden flex flex-col">
            {heroProduct && (
              <Link to={`/products/${heroProduct.id}`} className="block flex-1">
                <div className="h-40 sm:h-48">
                  <ProductImage src={heroProduct.image} alt={heroProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <span className="text-xs text-muted">{heroProduct.category}</span>
                  <p className="font-medium text-sm mt-1 line-clamp-2">{heroProduct.name}</p>
                  <p className="font-display text-lg mt-2">Rs. {heroProduct.price.toFixed(2)}</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Small stat + preview strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mt-4 sm:mt-5">
          {sideProducts.map(p => (
            <Link key={p.id} to={`/products/${p.id}`} className="card overflow-hidden hidden md:block">
              <div className="h-28"><ProductImage src={p.image} alt={p.name} className="w-full h-full object-cover" /></div>
              <div className="p-3">
                <p className="text-xs font-medium line-clamp-1">{p.name}</p>
                <p className="font-display text-sm mt-0.5">Rs. {p.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
          <div className="card p-5 flex flex-col justify-center bg-gold-light">
            <span className="font-display text-2xl text-gold">4.6★</span>
            <span className="text-xs text-muted mt-1">Average rating across reviewed products</span>
          </div>
          <div className="card p-5 flex flex-col justify-center">
            <span className="font-display text-2xl text-forest">Free</span>
            <span className="text-xs text-muted mt-1">Simulated checkout — practice safely</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h2 className="font-display text-2xl mb-5">Shop by category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map(c => (
            <Link
              key={c}
              to={`/products?category=${c}`}
              className="card flex flex-col items-center justify-center gap-2 py-5 px-2 text-center hover:border-forest transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-forest-light text-forest-dark flex items-center justify-center">
                <CategoryIcon category={c} />
              </span>
              <span className="text-xs font-medium">{c}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Recommendations */}
      {user && recommended.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-display text-2xl">Recommended for you</h2>
            <span className="text-xs text-muted">Based on your cart &amp; order history</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {recommended.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="font-display text-2xl">Featured products</h2>
          <Link to="/products" className="text-sm text-forest hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
