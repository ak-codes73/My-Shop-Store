import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 bg-cream-100 rounded-full flex items-center justify-center text-charcoal mx-auto">
          <Compass className="w-10 h-10 text-accent animate-pulse-subtle" />
        </div>
        <div className="space-y-2">
          <span className="font-mono text-4xl font-extrabold text-charcoal block">404</span>
          <h1 className="font-serif text-2xl font-bold text-charcoal">Page Not Found</h1>
          <p className="text-xs text-muted leading-relaxed">
            The page or collectible you requested does not exist or may have been relocated.
          </p>
        </div>
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Gallery</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

