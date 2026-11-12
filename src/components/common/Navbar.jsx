import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, Shield, User, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/dbBridge';
import { formatCurrency } from '../../utils/formatters';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const dropdownRef = useRef(null);

  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { 
    user, 
    profile, 
    isCustomerAuthenticated, 
    customerLogout, 
    adminUser, 
    isAdminAuthenticated 
  } = useAuth();
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Check if logged in customer or admin session has admin privileges in admin_users table
  useEffect(() => {
    let isMounted = true;
    const verifyAdmin = async () => {
      if (isAdminAuthenticated && adminUser) {
        if (isMounted) setIsAdminUser(true);
        return;
      }
      if (user?.id || user?.email) {
        const hasAdminRole = await db.checkIsAdmin(user.id, user.email);
        if (isMounted) setIsAdminUser(hasAdminRole);
      } else {
        if (isMounted) setIsAdminUser(false);
      }
    };
    verifyAdmin();
    return () => { isMounted = false; };
  }, [user, isAdminAuthenticated, adminUser]);

  // Scroll detection for slight elevation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await db.getProducts({ search: searchQuery });
        setSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchResultClick = (slug) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Posters & Wall Art', path: '/shop?category=posters' },
    { label: 'Die-Cast Cars', path: '/shop?category=diecast' },
    { label: 'Custom Orders', path: '/custom-order' },
    { label: 'Track Order', path: '/track-order' }
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream/95 backdrop-blur-md shadow-soft border-b border-charcoal/10 py-3.5'
            : 'bg-cream border-b border-charcoal/5 py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-charcoal hover:text-black focus:outline-none"
                aria-label="Open navigation menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-1 lg:flex-initial text-center lg:text-left">
              <Link to="/" className="inline-block group">
                <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-widest text-charcoal uppercase block group-hover:text-black transition-colors">
                  ATELIER & CO.
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-muted font-medium block">
                  Art &bull; Wall Decors &bull; Die-Cast
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-wider font-semibold transition-all relative py-1 ${
                      isActive
                        ? 'text-charcoal font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-charcoal'
                        : 'text-charcoal-500 hover:text-charcoal'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Utility Actions */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              {/* Search Icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-charcoal hover:text-black transition-colors rounded-full hover:bg-black/5"
                title="Search Products"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 text-charcoal hover:text-black transition-colors rounded-full hover:bg-black/5 relative hidden sm:inline-flex"
                title="Your Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-charcoal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 bg-charcoal text-white rounded-full hover:bg-black transition-all shadow-sm"
                aria-label="Open Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wider hidden sm:inline">Cart</span>
                <span className="w-5 h-5 bg-white text-charcoal rounded-full text-xs font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              </button>

              {/* Customer Account Icon & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className={`p-2 rounded-full transition-colors flex items-center justify-center ${
                    isCustomerAuthenticated
                      ? 'text-charcoal bg-black/5 hover:bg-black/10'
                      : 'text-charcoal hover:text-black hover:bg-black/5'
                  }`}
                  title={isCustomerAuthenticated ? (profile?.name || user?.email || 'My Account') : 'Account'}
                  aria-label="Account Menu"
                >
                  <User className="w-5 h-5" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lift border border-border-light py-2 z-50 animate-fade-in">
                    {isCustomerAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-border-light mb-1">
                          <p className="text-xs font-bold text-charcoal truncate">
                            {profile?.name || 'Customer'}
                          </p>
                          <p className="text-[11px] text-muted truncate">
                            {user?.email}
                          </p>
                        </div>
                        <Link
                          to="/account"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-cream transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span>My Account</span>
                        </Link>
                        <button
                          onClick={async () => {
                            setUserDropdownOpen(false);
                            await customerLogout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-cream transition-colors"
                        >
                          <span>Login</span>
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted hover:text-charcoal hover:bg-cream transition-colors"
                        >
                          <span>Sign Up</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Shield Icon: ONLY shown if user is verified in admin_users table */}
              {isAdminUser && (
                <Link
                  to="/admin/dashboard"
                  className="p-2 rounded-full transition-colors text-amber-700 bg-amber-100 hover:bg-amber-200"
                  title="Admin Dashboard"
                >
                  <Shield className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-lift w-full max-w-2xl overflow-hidden border border-border-light">
            <div className="p-4 border-b border-border-light flex items-center gap-3">
              <Search className="w-5 h-5 text-muted" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posters, car models, brands, anime, sizes..."
                className="w-full text-base outline-none bg-transparent placeholder-muted font-medium"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 text-muted hover:text-charcoal rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestions / Filter Chips */}
            <div className="px-4 py-2 bg-cream-50 border-b border-border-light flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-muted font-medium">Quick:</span>
              <button
                onClick={() => setSearchQuery('Porsche')}
                className="px-2.5 py-1 bg-white rounded-full border border-border-light hover:border-charcoal transition-colors"
              >
                Porsche
              </button>
              <button
                onClick={() => setSearchQuery('Aventador')}
                className="px-2.5 py-1 bg-white rounded-full border border-border-light hover:border-charcoal transition-colors"
              >
                Lamborghini
              </button>
              <button
                onClick={() => setSearchQuery('Anime')}
                className="px-2.5 py-1 bg-white rounded-full border border-border-light hover:border-charcoal transition-colors"
              >
                Anime Posters
              </button>
              <button
                onClick={() => setSearchQuery('Movie')}
                className="px-2.5 py-1 bg-white rounded-full border border-border-light hover:border-charcoal transition-colors"
              >
                Movie Art
              </button>
            </div>

            {/* Results list */}
            <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-border-light">
              {isSearching ? (
                <div className="py-8 text-center text-muted text-sm">Searching our curated catalog...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.slug)}
                    className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-cream-50 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover bg-cream border border-border-light"
                      />
                      <div>
                        <h4 className="font-semibold text-charcoal text-sm">{product.name}</h4>
                        <span className="text-xs text-muted capitalize">
                          {product.category === 'posters' ? 'Poster & Wall Art' : `Die-Cast Scale Model (${product.brand})`}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-charcoal">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="py-8 text-center text-muted text-sm">
                  No products matched &ldquo;{searchQuery}&rdquo;. Try another keyword or browse our collections.
                </div>
              ) : (
                <div className="py-6 text-center text-muted text-xs">
                  Type any keyword to search across products, descriptions, and specifications.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-cream h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-charcoal/10">
                <span className="font-serif text-xl font-bold tracking-wider">ATELIER & CO.</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X className="w-6 h-6 text-charcoal" />
                </button>
              </div>

              <div className="py-6 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold tracking-wide uppercase text-charcoal hover:text-black py-2 border-b border-charcoal/5"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-sm font-semibold uppercase text-charcoal py-2 border-b border-charcoal/5"
                >
                  <span>Wishlist</span>
                  <span className="w-5 h-5 bg-charcoal text-white rounded-full text-xs flex items-center justify-center">
                    {wishlistCount}
                  </span>
                </Link>

                {isCustomerAuthenticated ? (
                  <>
                    <Link
                      to="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 text-sm font-semibold uppercase text-charcoal py-2 border-b border-charcoal/5"
                    >
                      <User className="w-4 h-4" />
                      <span>My Account ({profile?.name || user?.email})</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        await customerLogout();
                        navigate('/');
                      }}
                      className="flex items-center gap-2 text-sm font-semibold uppercase text-red-600 py-2 border-b border-charcoal/5 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2 text-center rounded-lg bg-charcoal text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex-1 py-2 text-center rounded-lg border border-charcoal text-charcoal text-xs font-bold uppercase tracking-wider"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal/10 space-y-3">
              {isAdminUser && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-amber-700 text-white rounded-xl text-xs uppercase font-bold tracking-wider"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <p className="text-center text-[11px] text-muted">
                Premium Curated Wall Decor & Scale Collectibles
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

