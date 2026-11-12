# ATELIER & CO. — Full-Stack E-Commerce Platform with Admin Dashboard
> Curated Wall Art, Posters & Precision Die-Cast Collectibles with Manual UPI QR Payment Verification

Built with **React (Vite)**, **Tailwind CSS**, **Supabase PostgreSQL & Storage**, **React Router DOM**, **Lucide Icons**, and **Recharts**.

---

## 🌟 Key Highlights & Architectural Features

### 1. Dual-Mode Database Architecture (Offline-First + Supabase)
- **Supabase Production Ready**: Includes complete schema in [`supabase-schema.sql`](file:///c:/Users/Aryan%20Kedar/Anitgravity%20%20IDE/Ecommerce%20Website/supabase-schema.sql) with PostgreSQL tables, foreign keys, triggers, auto-updating timestamps, Storage buckets, and Row Level Security (RLS) policies.
- **Immediate Local Persistence**: Built-in reactive database bridge ([`dbBridge.js`](file:///c:/Users/Aryan%20Kedar/Anitgravity%20%20IDE/Ecommerce%20Website/src/services/dbBridge.js)) with multi-tab `BroadcastChannel` real-time pub/sub synchronization. The application works **100% out of the box** with seed data even before setting up Supabase, and automatically connects to Supabase as soon as credentials are added to `.env`.

### 2. Manual UPI QR Payment Verification Workflow
- **Exact-Amount Dynamic UPI QR Generation**: Generates official NPCI UPI payload (`upi://pay?pa={upi_id}&pn={store_name}&am={amount}&tn={order_id}&cu=INR`) using `qrcode.react`, or displays the store owner's uploaded UPI standee QR code.
- **Copy UPI ID**: Instant one-click copy with clipboard toast feedback.
- **Strict Verification Boundary**: Orders are **never marked as paid automatically**. Customers submit their 12-digit UPI reference number (UTR) and optional screenshot receipt.
- **Admin Verification Console**: Store owner reconciles UTR against their bank account statement in the dedicated Admin Payment Verification Center (`/admin/payments`) before approving.
- **Rejection with Feedback**: If a payment is invalid, the admin can reject it with a specific note (e.g. "Reference number not found on bank statement"). Customers can immediately view the reason on the Order Tracking page and resubmit their payment details.

### 3. Customer Storefront
- **Color Palette**:
  - Primary Background: Warm Cream (`#F5F1E8`)
  - Secondary Background: Pure White (`#FFFFFF`)
  - Text: Deep Charcoal (`#171717`) & Muted Grey (`#777777`)
  - Accents: Vintage Brass / Gold (`#C99738`)
- **Product Categories**:
  - **Posters & Wall Art**: Anime, Car Blueprints, Movies, Aesthetic prints. Supports variant selection (**A3, A4, A5**) with variant-specific pricing and stock tracking.
  - **Die-Cast Model Cars**: Lamborghini, Ferrari, Porsche, BMW, Mercedes-Benz. Supports scale selection (**1:18, 1:24, 1:32, 1:64**), technical specifications (alloys, opening doors/hood, paint finish, packaging).
- **Custom Commission Requests**: Dedicated page (`/custom-order`) allowing customers to submit custom artwork concepts, specify desired dimensions, and upload reference images.
- **Cart & Checkout**: Slide-out cart drawer, dynamic free-shipping progress indicator, full checkout form with phone & address validation.
- **Customer Order Tracking**: Secure tracking portal (`/track-order`) guarded by Order ID and Phone Number. Real-time progress tracker (`Pending` &rarr; `Payment Verification` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered`).

### 4. Separate Admin Dashboard (`/admin`)
- **Secure Authentication**: Supported by Supabase Auth and built-in Admin session verification.
- **Live Operations Overview**: 7 summary statistic cards (Total Revenue, Total Orders, Pending Orders, Confirmed Orders, Total Products, Low Stock Alert, Pending UPI Checks) with interactive Recharts graphics.
- **Product CRUD**: Add, edit, and delete products with confirmation dialogs; configure multi-variant sizing/scale pricing and stock; upload images or enter URLs; toggle Featured and Best Seller status.
- **Order Management**: Search by Order ID, customer name, phone, city; inspect full item breakdowns; advance order statuses with payment safety checks.
- **UPI & Store Settings**: Manage UPI ID, payee display name, upload/replace custom QR code image, configure delivery fees and free shipping threshold.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Admin Access
- **Admin Login Route**: `/admin/login`
- **Email**: Pre-configured in your `admin_users` table (e.g. `admin@atelier.store` for local development)
- Secure authentication is verified strictly against the `admin_users` table.

---

## 🗄️ Supabase Setup (Optional for Live Cloud Mode)

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** and paste the contents of [`supabase-schema.sql`](file:///c:/Users/Aryan%20Kedar/Anitgravity%20%20IDE/Ecommerce%20Website/supabase-schema.sql). Click **Run**.
3. Create 3 storage buckets in **Storage** (mark as public):
   - `product-images`
   - `payment-proofs`
   - `store-assets`
4. Copy your project credentials from **Project Settings > API**:
5. Update your `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Restart Vite (`npm run dev`). The application will now read and write directly to your cloud Supabase database with live Postgres Realtime subscriptions!

---

## 📁 Project Structure

```
Ecommerce Website/
├── supabase-schema.sql         # PostgreSQL database schema, RLS policies, triggers
├── package.json
├── tailwind.config.js
├── vite.config.js
├── .env.example
├── .env
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # Client router & context hierarchy
│   ├── index.css               # Design system & Tailwind layer rules
│   ├── context/
│   │   ├── AuthContext.jsx     # Admin auth provider & sessions
│   │   ├── CartContext.jsx     # Cart state, variants & delivery calculation
│   │   ├── WishlistContext.jsx # Customer favorites list
│   │   ├── StoreSettingsContext.jsx # UPI & delivery configuration
│   │   └── ToastContext.jsx    # Alert toast notifications
│   ├── services/
│   │   ├── supabase.js         # Supabase client instance
│   │   ├── dbBridge.js         # Dual-mode database abstraction & realtime bus
│   │   └── storageService.js   # Cloud storage & Base64 preview fallback
│   ├── utils/
│   │   ├── formatters.js       # INR currency, order IDs, timestamps
│   │   └── upi.js              # NPCI UPI protocol generator & UTR validator
│   ├── data/
│   │   ├── initialProducts.js  # Curated seed catalog (posters & die-cast)
│   │   └── initialSettings.js  # Default UPI & store policies
│   ├── components/
│   │   ├── common/
│   │   │   ├── AnnouncementBar.jsx
│   │   │   ├── Navbar.jsx      # Header, search modal, drawer triggers
│   │   │   └── Footer.jsx
│   │   ├── products/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ProductFilter.jsx
│   │   │   └── QuickViewModal.jsx
│   │   └── cart/
│   │       └── CartDrawer.jsx
│   ├── pages/
│   │   ├── Home.jsx            # Hero, featured categories, best sellers
│   │   ├── Shop.jsx            # Full catalog with dynamic filtering & sorting
│   │   ├── ProductDetails.jsx  # Gallery, variant selector, specs & reviews
│   │   ├── Cart.jsx            # Full shopping bag page
│   │   ├── Checkout.jsx        # Customer address & order placement
│   │   ├── Payment.jsx         # Dynamic UPI QR & UTR submission form
│   │   ├── OrderSuccess.jsx    # Confirmation with confetti celebration
│   │   ├── TrackOrder.jsx      # Customer live order tracker
│   │   ├── CustomPosterRequest.jsx # Custom artwork submission
│   │   ├── Wishlist.jsx
│   │   ├── Policies.jsx
│   │   └── NotFound.jsx
│   └── admin/
│       ├── AdminGuard.jsx      # Route protection for admin panel
│       ├── AdminLayout.jsx     # Admin chrome & real-time badge sync
│       ├── AdminSidebar.jsx
│       ├── AdminLogin.jsx      # Admin login portal
│       ├── AdminDashboard.jsx  # Charts & operations summary
│       ├── AdminProducts.jsx   # Product CRUD table & stock alerts
│       ├── AdminProductForm.jsx# Add / Edit product with variant editor
│       ├── AdminOrders.jsx     # Order pipeline management & inspector
│       ├── AdminPayments.jsx   # Manual UPI verification console
│       ├── AdminCustomers.jsx  # Customer purchase directory
│       ├── AdminCustomRequests.jsx # Bespoke commissions inbox
│       └── AdminSettings.jsx   # UPI ID, QR upload & threshold config
```

---

## 🔒 Security & Best Practices Implemented

1. **Service Role Keys Kept Safe**: No secret keys or service role credentials are ever exposed in client code.
2. **Order Access Privacy**: Customer order tracking requires both **Order ID** and the customer's **registered Phone Number** before returning personal details or order contents.
3. **Price Validation on Order Placement**: Calculations are structured and validated against variant models in the database layer.
4. **Separation of Payment & Order Statuses**: Order confirmation is decoupled from customer submission. An order cannot be moved to confirmed or dispatched unless the payment has been verified by the administrator.
5. **Real-time State Synchronization**: Product inventory changes, order progress updates, and payment approvals propagate immediately between storefront and admin interfaces without requiring manual browser refreshes.

