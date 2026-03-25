# 🚀 RentalHub - Modern E-Commerce Platform

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/status-Active-success?style=for-the-badge)

A powerful, modern, and scalable e-commerce rental platform built with cutting-edge web technologies. Designed for seamless multi-role support including Customers, Vendors, and Administrators.

[Live Demo](#) • [Documentation](#) • [Support](#)

</div>

---

## ✨ Key Features

### 👥 Multi-Role System
- **Customers** - Browse, rent, and manage orders
- **Vendors** - Sell and manage rental inventory  
- **Administrators** - Oversee platform, approve products, and manage users

### 🛍️ E-Commerce Excellence
- **Product Catalog** - Browse and search rental items
- **Smart Pricing** - Hourly rental pricing strategy
- **Inventory Management** - Real-time stock tracking
- **Shopping Cart** - Add, modify, and manage items
- **Secure Checkout** - PCI-compliant payments

### 📦 Order Management
- **Order Tracking** - Real-time order status updates
- **Delivery Options** - COD and Pickup support
- **Invoice Generation** - Automated invoice creation
- **Order History** - Complete transaction records

### 🎯 Vendor Dashboard  
- **Product Management** - Add, edit, manage rental items
- **Order Fulfillment** - Track and process customer orders
- **Analytics & Reports** - Revenue insights and performance metrics
- **Customer Communication** - Direct vendor-customer interface

### 🔐 Security & Authentication
- **NextAuth Integration** - Secure JWT-based authentication
- **Password Encryption** - bcryptjs hashing
- **Role-Based Access Control** - Route protection by user role
- **GSTIN Tracking** - GST compliance for vendors

### 📱 Modern UI/UX
- **Responsive Design** - Mobile-first approach
- **Smooth Animations** - Framer Motion transitions
- **Interactive Charts** - Recharts analytics
- **Image Carousel** - Swiper integration

---

## 🛠️ Technology Stack

<div align="center">

| Category | Technologies |
|----------|---------------|
| **Frontend** | ![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react) ![Next.js](https://img.shields.io/badge/Next.js-16.1-000000?style=flat-square&logo=next.js) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-API%20Routes-339933?style=flat-square&logo=node.js) ![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=flat-square&logo=prisma) |
| **Database** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql) |
| **Authentication** | ![NextAuth](https://img.shields.io/badge/NextAuth-4.24-222222?style=flat-square) ![bcryptjs](https://img.shields.io/badge/bcryptjs-3.0-555555?style=flat-square) |
| **UI Libraries** | ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12.29-0055FF?style=flat-square) ![Swiper](https://img.shields.io/badge/Swiper-12.1-6332F6?style=flat-square) ![Recharts](https://img.shields.io/badge/Recharts-3.7-8884D8?style=flat-square) ![Lucide React](https://img.shields.io/badge/Lucide%20React-0.563-FF6B6B?style=flat-square) |
| **Utilities** | ![html2canvas](https://img.shields.io/badge/html2canvas-1.4-4CAF50?style=flat-square) ![jsPDF](https://img.shields.io/badge/jsPDF-4.0-FF1744?style=flat-square) |

</div>

---

## 📋 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd boiler-plate
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory:
```bash
# Database
DATABASE_URL="postgresql://user:password@host/database"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Payment Gateway (if applicable)
NEXT_PUBLIC_PAYMENT_KEY="your-payment-key"
```

4. **Setup Prisma Database**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Architecture

```
boiler-plate/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── products/             # Product management
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Checkout flow
│   │   ├── payments/             # Payment processing
│   │   ├── admin/                # Admin operations
│   │   └── vendor/               # Vendor endpoints
│   ├── admin/                    # Admin dashboard
│   ├── vendor/                   # Vendor portal
│   ├── user/                     # Customer dashboard
│   ├── product/                  # Product details
│   ├── cart/                     # Shopping cart UI
│   ├── checkout/                 # Checkout page
│   └── components/               # Reusable components
├── components/                   # Shared components
│   └── SessionProvider.js        # NextAuth provider
├── lib/                          # Utility functions
│   ├── auth.js                   # Authentication config
│   ├── prisma.js                 # Prisma client
│   └── toast.js                  # Toast notifications
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
└── public/                       # Static assets

```

---

## 🗄️ Database Schema

The application uses Prisma ORM with PostgreSQL. Key models:

- **User** - Customer, Vendor, and Admin profiles with roles
- **Product** - Rental items with hourly pricing and inventory tracking
- **Category** - Product categorization system
- **Order** - Complete order lifecycle (Quotation → Sale Order → Invoiced)
- **OrderItem** - Individual items within orders
- **Invoice** - Generated invoices for transactions

---

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build optimized production bundle
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint on codebase

# Database
npx prisma studio       # Open Prisma Studio GUI
npx prisma migrate dev   # Create and apply migrations
npx prisma generate      # Generate Prisma Client
```

---

## 📚 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/auth/session` - Get current user session

### Products
- `GET /api/products` - List all approved products
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (Vendor)
- `PUT /api/products/[id]` - Update product (Vendor)
- `GET /api/categories` - Get product categories

### Orders & Checkout
- `GET /api/cart` - Get shopping cart items
- `POST /api/cart` - Add to cart
- `POST /api/checkout` - Create order from cart
- `GET /api/orders` - Get user orders
- `GET /api/payments/create-order` - Initiate payment

### Admin Operations
- `GET /api/admin/stats` - Admin dashboard statistics
- `GET /api/admin/users` - Manage users
- `GET /api/admin/products/pending` - Pending product approvals
- `POST /api/admin/products/approve` - Approve vendor products

### Vendor Operations
- `GET /api/vendor/products` - Vendor's product list
- `GET /api/vendor/orders` - Vendor's customer orders
- `GET /api/vendor/customers` - Vendor's customers list
- `GET /api/vendor/reports` - Vendor analytics & reports

---

## 🎨 UI Components

### Core Components
- **Navbar** - Responsive navigation (Customer, Vendor, Admin variants)
- **Carousel** - Swiper-based image slider for product showcase
- **Cart** - Shopping cart management and updates
- **Product Cards** - Reusable product listing displays

### Pages & Forms
- **Login** - User authentication form
- **Signup** - User registration with role selection
- **Checkout** - Multi-step checkout flow
- **Dashboard** - Analytics and management interfaces
- **Vendor Portal** - Product and order management

---

## 🔐 Security Features

✅ **Role-Based Access Control (RBAC)** - Route and API protection  
✅ **JWT Authentication** - Via NextAuth sessions  
✅ **Password Encryption** - bcryptjs with salt rounds  
✅ **Protected API Routes** - Middleware validation  
✅ **CSRF Protection** - NextAuth built-in  
✅ **Environment Variable Management** - Sensitive data isolation  
✅ **GSTIN Validation** - GST compliance for invoicing  

---

## 📊 Performance Optimization

- ⚡ **Next.js 16 App Router** - Server & client components
- 🖼️ **Image Optimization** - Automatic compression & lazy loading
- 📦 **Code Splitting** - Route-based bundle splitting
- 🎯 **Tailwind CSS 4** - PurgeCSS for minimal bundle
- 🔄 **Database Query Optimization** - Prisma query selection
- 💾 **Caching Strategies** - ISR and dynamic routes

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and commit (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with detailed description

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
npm run dev

# Run linter before commit
npm run lint

# Commit with meaningful message
git commit -m "feat: add new feature"
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL in .env.local
# Check PostgreSQL/Neon credentials
# Restart development server
npm run dev
```

### Prisma Client Not Found
```bash
npm install
npx prisma generate
npm run dev
```

### NextAuth Errors
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies and cache
- Restart development server

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Support & Resources

- 📧 **Email**: support@rentalhub.dev
- 🐛 **Bug Reports**: [GitHub Issues](#)
- 💡 **Feature Requests**: [Discussions](#)
- 📖 **Full Documentation**: [Wiki](#)
- 🎓 **Tutorials**: [Video Guides](#)
- 💬 **Discord Community**: [Join Server](#)

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Push to GitHub and connect to Vercel
# Environment variables are configured in Vercel dashboard
# Automatic deployments on every push to main
```

### Other Platforms
- **Railway** - `railway up`
- **Render** - Connect GitHub repository
- **AWS Amplify** - Amplify Console deployment

Refer to [Next.js Deployment Documentation](https://nextjs.org/docs/app/building-your-application/deploying) for detailed instructions.

---

<div align="center">

### 🌟 Show Your Support

Give a ⭐ if this project helped you!

**Made with ❤️ by the RentalHub Team**

[⬆ Back to Top](#-rentalhub---modern-e-commerce-platform)

</div>
