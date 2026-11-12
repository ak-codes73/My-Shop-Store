export const initialProducts = [
  // --- POSTERS & WALL ART ---
  {
    id: 'prod-post-001',
    name: 'Neo-Tokyo Akira Cyberpunk Canvas',
    slug: 'neo-tokyo-akira-cyberpunk-canvas',
    category: 'posters',
    subcategory: 'anime',
    description: 'Ultra-high resolution Neo-Tokyo street cityscape with iconic red motorcycle aesthetics. Printed on museum-grade 320 GSM natural archival paper with non-reflective matte finish.',
    images: [
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 499,
    original_price: 799,
    variants: [
      { size: 'A5', price: 299, originalPrice: 499, stock: 45 },
      { size: 'A4', price: 499, originalPrice: 799, stock: 30 },
      { size: 'A3', price: 799, originalPrice: 1199, stock: 18 }
    ],
    stock: 93,
    tags: ['Cyberpunk', 'Anime', '320 GSM', 'Archival Matte'],
    is_featured: true,
    is_best_seller: true,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-01-10T10:00:00Z'
  },
  {
    id: 'prod-post-002',
    name: 'Porsche 911 GT3 RS Blueprint Technical Art',
    slug: 'porsche-911-gt3-rs-blueprint-technical-art',
    category: 'posters',
    subcategory: 'car',
    description: 'Detailed vector engineering blueprint schematic of the iconic Porsche 911 GT3 RS (992). Displays aerodynamics CFD data, wheelbase dimensions, and flat-six engine specs.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 549,
    original_price: 899,
    variants: [
      { size: 'A5', price: 349, originalPrice: 549, stock: 20 },
      { size: 'A4', price: 549, originalPrice: 899, stock: 25 },
      { size: 'A3', price: 849, originalPrice: 1299, stock: 12 }
    ],
    stock: 57,
    tags: ['Porsche', 'Blueprint', 'Motorsport', 'Minimalist'],
    is_featured: true,
    is_best_seller: true,
    created_at: '2026-01-12T11:00:00Z',
    updated_at: '2026-01-12T11:00:00Z'
  },
  {
    id: 'prod-post-003',
    name: 'Interstellar "Gargantua" Minimalist Movie Print',
    slug: 'interstellar-gargantua-minimalist-movie-print',
    category: 'posters',
    subcategory: 'movie',
    description: 'Cinematic visual ode to Christopher Nolan’s Interstellar depicting the gravitational lensing of black hole Gargantua with Endurance spacecraft silhouette.',
    images: [
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 499,
    original_price: 749,
    variants: [
      { size: 'A5', price: 299, originalPrice: 499, stock: 15 },
      { size: 'A4', price: 499, originalPrice: 749, stock: 22 },
      { size: 'A3', price: 799, originalPrice: 1149, stock: 9 }
    ],
    stock: 46,
    tags: ['Sci-Fi', 'Movie', 'Space', 'Astronomy'],
    is_featured: false,
    is_best_seller: true,
    created_at: '2026-01-14T09:30:00Z',
    updated_at: '2026-01-14T09:30:00Z'
  },
  {
    id: 'prod-post-004',
    name: 'Kyoto Autumn Rain Lofi Aesthetic Print',
    slug: 'kyoto-autumn-rain-lofi-aesthetic-print',
    category: 'posters',
    subcategory: 'aesthetic',
    description: 'Serene warm-toned Japanese alleyway in Gion during late autumn rain. Soft glow lanterns and maple leaves create a calming, ambient aesthetic for workspaces.',
    images: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 449,
    original_price: 699,
    variants: [
      { size: 'A5', price: 279, originalPrice: 449, stock: 30 },
      { size: 'A4', price: 449, originalPrice: 699, stock: 25 },
      { size: 'A3', price: 749, originalPrice: 1049, stock: 14 }
    ],
    stock: 69,
    tags: ['Kyoto', 'Aesthetic', 'Warm', 'Lo-Fi'],
    is_featured: false,
    is_best_seller: false,
    created_at: '2026-01-15T14:00:00Z',
    updated_at: '2026-01-15T14:00:00Z'
  },
  {
    id: 'prod-post-005',
    name: 'Attack on Titan "Freedom" Scout Regiment Tribute',
    slug: 'attack-on-titan-freedom-scout-regiment-tribute',
    category: 'posters',
    subcategory: 'anime',
    description: 'Wings of Freedom crest etched with battle-worn textures, featuring Eren and Levi in high-contrast graphite ink styling.',
    images: [
      'https://images.unsplash.com/photo-1569701814144-8c8868a8fbe1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 499,
    original_price: 799,
    variants: [
      { size: 'A5', price: 299, originalPrice: 499, stock: 20 },
      { size: 'A4', price: 499, originalPrice: 799, stock: 15 },
      { size: 'A3', price: 799, originalPrice: 1199, stock: 8 }
    ],
    stock: 43,
    tags: ['Anime', 'AOT', 'Wings of Freedom', 'Dark Art'],
    is_featured: true,
    is_best_seller: false,
    created_at: '2026-01-18T16:20:00Z',
    updated_at: '2026-01-18T16:20:00Z'
  },
  {
    id: 'prod-post-006',
    name: 'Ferrari F40 Rosso Corsa Vintage Horizon',
    slug: 'ferrari-f40-rosso-corsa-vintage-horizon',
    category: 'posters',
    subcategory: 'car',
    description: 'The definitive hypercar: twin-turbo V8 Ferrari F40 staged against a sunset coastline with retro 80s synthwave horizon line.',
    images: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 549,
    original_price: 899,
    variants: [
      { size: 'A5', price: 349, originalPrice: 549, stock: 18 },
      { size: 'A4', price: 549, originalPrice: 899, stock: 20 },
      { size: 'A3', price: 849, originalPrice: 1299, stock: 10 }
    ],
    stock: 48,
    tags: ['Ferrari', 'Supercar', 'Retro 80s', 'Rosso Corsa'],
    is_featured: false,
    is_best_seller: true,
    created_at: '2026-01-20T12:00:00Z',
    updated_at: '2026-01-20T12:00:00Z'
  },

  // --- DIE-CAST MODEL CARS ---
  {
    id: 'prod-diecast-001',
    name: 'Lamborghini Aventador SVJ Verde Alceo',
    slug: 'lamborghini-aventador-svj-verde-alceo',
    category: 'diecast',
    subcategory: 'lamborghini',
    brand: 'Lamborghini',
    model: 'Aventador SVJ',
    description: 'Precision handcrafted 1:18 scale collector replica of the Nürburgring lap record holding Aventador SVJ. Features scissor opening doors, active rear wing detail, carbon fibre texture engine bay, and functioning steering mechanism.',
    images: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 4999,
    original_price: 6499,
    variants: [
      { scale: '1:64', price: 1499, originalPrice: 1899, stock: 12 },
      { scale: '1:32', price: 2899, originalPrice: 3499, stock: 8 },
      { scale: '1:24', price: 4999, originalPrice: 6499, stock: 6 },
      { scale: '1:18', price: 9499, originalPrice: 11999, stock: 3 }
    ],
    specs: {
      material: 'Die-cast Heavy Zinc Alloy with ABS Interior',
      openingFeatures: 'Scissor Doors, Hood, Engine Cover, Steerable Wheels',
      paintFinish: 'Electrostatic Matte Verde Alceo with Pearl Flakes',
      packaging: 'Padded Deluxe Acrylic Showcase Box with Plaque'
    },
    stock: 29,
    tags: ['V12', 'Limited Edition', 'Supercar', 'Scissor Doors'],
    is_featured: true,
    is_best_seller: true,
    created_at: '2026-01-08T08:00:00Z',
    updated_at: '2026-01-08T08:00:00Z'
  },
  {
    id: 'prod-diecast-002',
    name: 'Porsche 911 GT3 RS Weissach Package Shark Blue',
    slug: 'porsche-911-gt3-rs-weissach-package-shark-blue',
    category: 'diecast',
    subcategory: 'porsche',
    brand: 'Porsche',
    model: '911 GT3 RS (992)',
    description: 'Exquisite motorsport edition replica boasting swan-neck aerodynamic rear wing, DRS hydraulic mock-up, exposed carbon weave roof, and roll cage interior.',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 4699,
    original_price: 5999,
    variants: [
      { scale: '1:64', price: 1399, originalPrice: 1799, stock: 15 },
      { scale: '1:32', price: 2699, originalPrice: 3299, stock: 9 },
      { scale: '1:24', price: 4699, originalPrice: 5999, stock: 5 },
      { scale: '1:18', price: 8999, originalPrice: 10999, stock: 2 }
    ],
    specs: {
      material: 'Die-cast High Density Alloy + Composite Carbon Parts',
      openingFeatures: 'Doors, Functional Front Aero Flaps, Opening Hood',
      paintFinish: 'Shark Blue Gloss with Carbon Fiber Accents',
      packaging: 'Collector Edition Box with Certification Number'
    },
    stock: 31,
    tags: ['Track Car', 'Weissach', 'Aero', 'Stuttgart'],
    is_featured: true,
    is_best_seller: true,
    created_at: '2026-01-09T10:00:00Z',
    updated_at: '2026-01-09T10:00:00Z'
  },
  {
    id: 'prod-diecast-003',
    name: 'Ferrari Daytona SP3 Rosso Corsa Heritage',
    slug: 'ferrari-daytona-sp3-rosso-corsa-heritage',
    category: 'diecast',
    subcategory: 'ferrari',
    brand: 'Ferrari',
    model: 'Daytona SP3 Icona',
    description: 'Maranello’s Icona masterpiece paying homage to 1967 24 Hours of Daytona. Features butterfly doors, horizontal strakes rear grille, and naturally aspirated V12 replica.',
    images: [
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 5299,
    original_price: 6999,
    variants: [
      { scale: '1:64', price: 1599, originalPrice: 1999, stock: 10 },
      { scale: '1:32', price: 2999, originalPrice: 3699, stock: 7 },
      { scale: '1:24', price: 5299, originalPrice: 6999, stock: 4 },
      { scale: '1:18', price: 9999, originalPrice: 12499, stock: 2 }
    ],
    specs: {
      material: 'Zinc Die-cast Metal with Hand-stitched Leather-feel Seats',
      openingFeatures: 'Butterfly Doors, Removable Targa Hardtop, Rear Engine Cover',
      paintFinish: 'Rosso Corsa Multi-layer High Gloss Clearcoat',
      packaging: 'Velvet-lined Luxury Wood Display Plaque'
    },
    stock: 23,
    tags: ['Icona', 'V12', 'Maranello', 'Targa'],
    is_featured: false,
    is_best_seller: true,
    created_at: '2026-01-11T13:00:00Z',
    updated_at: '2026-01-11T13:00:00Z'
  },
  {
    id: 'prod-diecast-004',
    name: 'BMW M3 G80 Competition Isle of Man Green',
    slug: 'bmw-m3-g80-competition-isle-of-man-green',
    category: 'diecast',
    subcategory: 'bmw',
    brand: 'BMW',
    model: 'M3 Competition (G80)',
    description: 'Aggressive twin-turbo inline-six German touring powerhouse. Finished in iconic Isle of Man Green metallic with Kyoto orange carbon bucket seat interior.',
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 3999,
    original_price: 4999,
    variants: [
      { scale: '1:64', price: 1249, originalPrice: 1599, stock: 18 },
      { scale: '1:32', price: 2399, originalPrice: 2899, stock: 12 },
      { scale: '1:24', price: 3999, originalPrice: 4999, stock: 6 },
      { scale: '1:18', price: 7999, originalPrice: 9499, stock: 3 }
    ],
    specs: {
      material: 'Die-cast Alloy + Rubber Tread High Grip Tires',
      openingFeatures: '4 Doors, Hood with S58 Twin-turbo Detail, Trunk',
      paintFinish: 'Isle of Man Green Metallic with Gloss Shadowline trim',
      packaging: 'Signature M Power Collector Window Box'
    },
    stock: 39,
    tags: ['Bimmer', 'M Power', 'Twin Turbo', 'Sedan'],
    is_featured: false,
    is_best_seller: false,
    created_at: '2026-01-16T15:00:00Z',
    updated_at: '2026-01-16T15:00:00Z'
  },
  {
    id: 'prod-diecast-005',
    name: 'Mercedes-AMG GT Black Series Magno Orange',
    slug: 'mercedes-amg-gt-black-series-magno-orange',
    category: 'diecast',
    subcategory: 'mercedes',
    brand: 'Mercedes-Benz',
    model: 'AMG GT Black Series',
    description: 'Affalterbach’s track monster featuring flat-plane crankshaft V8 replica, two-stage adjustable carbon rear wing, and slotted front hood extractor vents.',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80'
    ],
    price: 4799,
    original_price: 5999,
    variants: [
      { scale: '1:64', price: 1399, originalPrice: 1799, stock: 14 },
      { scale: '1:32', price: 2699, originalPrice: 3299, stock: 10 },
      { scale: '1:24', price: 4799, originalPrice: 5999, stock: 5 },
      { scale: '1:18', price: 9299, originalPrice: 11499, stock: 2 }
    ],
    specs: {
      material: 'Heavy Die-cast Alloy with Realistic Suspension Dampers',
      openingFeatures: 'Both Doors, Front Clamshell Hood, Working Steering',
      paintFinish: 'AMG Magno Beam Orange Satin Finish',
      packaging: 'Acrylic Display Case with Affalterbach Crest'
    },
    stock: 31,
    tags: ['AMG', 'Black Series', 'Affalterbach', 'Track Beast'],
    is_featured: true,
    is_best_seller: false,
    created_at: '2026-01-19T11:45:00Z',
    updated_at: '2026-01-19T11:45:00Z'
  }
];

