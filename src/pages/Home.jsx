import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Award, Palette, Star, Instagram, ChevronRight } from 'lucide-react';
import { db } from '../services/dbBridge';
import { ProductCard } from '../components/products/ProductCard';

export const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const allProducts = await db.getProducts();
        const best = allProducts.filter((p) => p.is_best_seller).slice(0, 4);
        const newest = [...allProducts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

        setBestSellers(best.length > 0 ? best : allProducts.slice(0, 4));
        setNewArrivals(newest.length > 0 ? newest : allProducts.slice(2, 6));
      } catch (err) {
        console.error('Error fetching home products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeProducts();

    // Subscribe to product updates in realtime
    const unsubscribe = db.subscribe('products', () => {
      fetchHomeProducts();
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-charcoal text-white px-4 sm:px-6 lg:px-8">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=2000&q=85"
            alt="Hero Collectible"
            className="w-full h-full object-cover object-center opacity-35 scale-105 animate-pulse-subtle"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/40" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 sm:space-y-8 py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs tracking-widest uppercase font-semibold text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Wall Decor &bull; Precision Die-Casts</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] uppercase text-cream-50">
            For True Enthusiasts <br />
            <span className="text-accent italic font-serif">Art & Precision</span> in Harmony
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-charcoal-200 font-normal leading-relaxed">
            Elevate your personal space with museum-grade 320 GSM archival posters and heavy-metal die-cast supercar scale models. Direct UPI verified checkout with zero payment surcharges.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-charcoal rounded-xl text-xs uppercase tracking-widest font-extrabold hover:bg-cream-100 transition-all shadow-lift group"
            >
              <span>Shop All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/shop?category=diecast"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs uppercase tracking-widest font-bold backdrop-blur-md border border-white/20 transition-all"
            >
              <span>Explore Die-Cast Models</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
        {/* 2. FEATURED CATEGORIES (Posters, Die-Cast, Custom) */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-muted">
              Hand-Selected Collections
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-charcoal">
              Featured Categories
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category 1: Posters */}
            <Link
              to="/shop?category=posters"
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal text-white flex flex-col justify-end p-6 sm:p-8 shadow-card"
            >
              <img
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80"
                alt="Posters & Wall Art"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
                  Archival 320 GSM &bull; A3, A4, A5
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-wide">Posters & Wall Art</h3>
                <p className="text-xs text-charcoal-200">
                  Anime, technical car blueprints, movies, and aesthetic ambient prints.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors gap-1">
                  <span>Explore Collection</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Category 2: Die-Cast Models */}
            <Link
              to="/shop?category=diecast"
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal text-white flex flex-col justify-end p-6 sm:p-8 shadow-card"
            >
              <img
                src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80"
                alt="Die-Cast Model Cars"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
                  Precision Metal Alloy &bull; 1:18 to 1:64
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-wide">Die-Cast Supercars</h3>
                <p className="text-xs text-charcoal-200">
                  Lamborghini, Porsche, Ferrari, BMW, and AMG high-detail scale collector pieces.
                </p>
                <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors gap-1">
                  <span>Explore Models</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Category 3: Custom Posters */}
            <Link
              to="/custom-order"
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-charcoal text-white flex flex-col justify-end p-6 sm:p-8 shadow-card"
            >
              <img
                src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80"
                alt="Custom Posters"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-75 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent" />
              <div className="relative z-10 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
                  Bespoke Design Requests
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-wide">Custom Posters</h3>
                <p className="text-xs text-charcoal-200">
                  Have a favourite manga panel, vintage racer, or gaming artwork? We print custom orders!
                </p>
                <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-white group-hover:text-accent transition-colors gap-1">
                  <span>Submit Custom Request</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* 3. BEST SELLERS SECTION */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-border-light">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-muted">
                Collector Favorites
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
                Best Sellers
              </h2>
            </div>
            <Link
              to="/shop?sort=popularity"
              className="text-xs uppercase font-bold tracking-wider text-charcoal hover:text-black flex items-center gap-1 group"
            >
              <span>View All Best Sellers</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 4. PROMOTIONAL COLLECTOR BANNER */}
        <section className="relative rounded-3xl overflow-hidden bg-charcoal text-white p-8 sm:p-12 lg:p-16 shadow-lift">
          <div className="absolute right-0 top-0 w-full md:w-1/2 h-full opacity-30 md:opacity-50">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
              alt="Porsche 911 GT3"
              className="w-full h-full object-cover object-right"
            />
          </div>
          <div className="relative z-10 max-w-xl space-y-5">
            <span className="px-3 py-1 bg-accent/20 border border-accent/40 text-accent text-[11px] font-bold uppercase tracking-widest rounded-full inline-block">
              Limited Edition Drops
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold leading-tight">
              Exclusive Weissach & JDM Series Now In Stock
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-200 leading-relaxed">
              Every die-cast model features electrostatically cured automotive paints, authentic manufacturer licensing, and steerable rubber wheels. Packaged inside protective display cases.
            </p>
            <div className="pt-2">
              <Link
                to="/shop?category=diecast"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-charcoal rounded-xl text-xs uppercase tracking-wider font-extrabold hover:bg-cream transition-colors"
              >
                <span>Browse Die-Cast Models</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5. NEW ARRIVALS SECTION */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-border-light">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-muted">
                Fresh Drops
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/shop?sort=newest"
              className="text-xs uppercase font-bold tracking-wider text-charcoal hover:text-black flex items-center gap-1 group"
            >
              <span>View All New Releases</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 6. WHY CHOOSE US */}
        <section className="bg-white rounded-3xl border border-border-light p-8 sm:p-12 shadow-soft space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-muted">
              The Atelier Standard
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
              Why Discerning Collectors Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-charcoal mx-auto sm:mx-0">
                <Palette className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">320+ GSM Archival Art</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Ultra-heavyweight Japanese archival paper with deep ink saturations that resist UV fading for decades.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-charcoal mx-auto sm:mx-0">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">Precision Die-Cast Zinc</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Working steering, opening butterfly doors, high-density zinc alloy, and electrostatic high-gloss paint finishes.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-charcoal mx-auto sm:mx-0">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">Direct Verified UPI QR</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Zero processing fees or payment middleman surcharges. Pay directly to store UPI and submit reference ID.
              </p>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center text-charcoal mx-auto sm:mx-0">
                <Truck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-base text-charcoal">Reinforced Express Shipping</h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Posters ship in rigid crush-proof cardboard tubes; die-cast models are double-boxed in high-density foam.
              </p>
            </div>
          </div>
        </section>

        {/* 7. CUSTOMER TESTIMONIALS */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-muted">
              Collector Community
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal">
              Trusted by 10,000+ Enthusiasts
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Karan Singhania',
                location: 'Mumbai',
                item: 'Lamborghini Aventador SVJ 1:24',
                review:
                  'The weight of the die-cast is extraordinary! The scissor doors open with crisp hydraulic resistance, and the Verde Alceo paint has real metallic flakes.',
                rating: 5
              },
              {
                name: 'Ananya Bhattacharya',
                location: 'Kolkata',
                item: 'Akira Cyberpunk & Kyoto Lo-Fi (A3)',
                review:
                  'Museum grade is not an exaggeration. The 320 GSM matte finish looks completely non-reflective even under direct spotlight. Shipped in a solid hard tube!',
                rating: 5
              },
              {
                name: 'Aditya Patel',
                location: 'Ahmedabad',
                item: 'Porsche 911 GT3 RS Blueprint',
                review:
                  'The UPI verification was super smooth. I submitted my reference ID and received verification confirmation within 20 minutes. Will definitely order again.',
                rating: 5
              }
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-border-light p-6 space-y-4 shadow-soft flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-accent">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-accent" />
                    ))}
                  </div>
                  <p className="text-xs text-charcoal-600 leading-relaxed italic">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-border-light">
                  <h4 className="font-bold text-xs text-charcoal">{t.name}</h4>
                  <div className="flex items-center justify-between text-[11px] text-muted mt-0.5">
                    <span>{t.location}</span>
                    <span className="font-medium text-charcoal-400">{t.item}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. INSTAGRAM & NEWSLETTER SECTION */}
        <section className="bg-cream-100 rounded-3xl p-8 sm:p-12 border border-border-light text-center space-y-6">
          <div className="w-12 h-12 bg-charcoal text-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Instagram className="w-6 h-6" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="font-serif text-2xl font-bold text-charcoal">
              Join the Atelier Collector Circle
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Tag <span className="font-bold text-charcoal">#AtelierCollectibles</span> on Instagram to get featured on our gallery page and receive exclusive early access to drop announcements.
            </p>
          </div>

          <div className="pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-black transition-colors"
            >
              <span>Follow @atelier.art.cars</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

