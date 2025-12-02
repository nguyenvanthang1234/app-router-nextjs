# 🌐 API Endpoints Guide - Complete Reference

## 📚 Overview

Danh sách API endpoints cần implement để hoàn thiện dự án e-commerce.

---

## 🔍 Search & Discovery APIs

### 1. Product Search

```typescript
GET / api / search / products
```

**Query Parameters:**

```typescript
{
  q: string                    // Search query
  limit?: number              // Results per page (default: 20)
  page?: number               // Page number (default: 1)

  // Filters
  priceMin?: number
  priceMax?: number
  brands?: string[]           // Array of brand IDs
  categories?: string[]       // Array of category IDs
  rating?: number             // Min rating (1-5)
  inStock?: boolean           // Only in-stock products

  // Sorting
  sort?: 'relevance'          // Default: by search relevance
       | 'price_asc'          // Lowest price first
       | 'price_desc'         // Highest price first
       | 'rating'             // Highest rated first
       | 'newest'             // Newest first
       | 'sold'               // Best sellers
}
```

**Response:**

```typescript
{
  products: Product[],
  totalCount: number,
  page: number,
  limit: number,
  filters: {
    brands: { id: string, name: string, count: number }[],
    categories: { id: string, name: string, count: number }[],
    priceRange: { min: number, max: number }
  }
}
```

**Example:**

```bash
GET /api/search/products?q=laptop&priceMin=10000000&brands[]=apple&sort=price_asc
```

---

### 2. Search Suggestions (Autocomplete)

```typescript
GET / api / search / suggestions
```

**Query Parameters:**

```typescript
{
  q: string,                  // Search query (min 2 chars)
  limit?: number              // Max suggestions (default: 10)
}
```

**Response:**

```typescript
{
  suggestions: [
    {
      id: string,
      name: string,
      type: 'product' | 'category' | 'brand',
      thumbnail?: string,
      price?: number,
      slug?: string
    }
  ]
}
```

---

### 3. Trending Searches

```typescript
GET / api / search / trending
```

**Response:**

```typescript
{
  trending: string[],         // Top 10 search queries
  period: 'daily' | 'weekly'
}
```

---

## 🛒 Cart & Wishlist APIs

### 4. Wishlist Management

```typescript
// Get user wishlist
GET /api/users/:userId/wishlist

// Add to wishlist
POST /api/users/:userId/wishlist
Body: { productId: string }

// Remove from wishlist
DELETE /api/users/:userId/wishlist/:productId

// Share wishlist
POST /api/wishlist/share
Body: { productIds: string[] }
Response: { shareUrl: string, expiresAt: Date }
```

---

### 5. Product Comparison

```typescript
GET /api/products/compare?ids[]=123&ids[]=456&ids[]=789
```

**Response:**

```typescript
{
  products: Product[],
  comparisonMatrix: {
    features: [
      {
        name: string,
        values: any[]           // Values for each product
      }
    ]
  }
}
```

---

## 🎫 Promotions & Coupons APIs

### 6. Validate Coupon

```typescript
POST / api / coupons / validate
```

**Body:**

```typescript
{
  code: string,
  cartTotal: number,
  productIds: string[],
  userId?: string
}
```

**Response:**

```typescript
{
  valid: boolean,
  discount: {
    type: 'percentage' | 'fixed' | 'free_shipping',
    value: number,
    appliedAmount: number
  },
  message: string,
  error?: string              // If invalid
}
```

---

### 7. Available Coupons for User

```typescript
GET /api/users/:userId/coupons/available
```

**Response:**

```typescript
{
  coupons: [
    {
      id: string,
      code: string,
      description: string,
      discountType: 'percentage' | 'fixed',
      discountValue: number,
      minOrderValue: number,
      expiresAt: Date,
      usageLeft: number
    }
  ]
}
```

---

### 8. Apply Coupon to Order

```typescript
POST /api/orders/:orderId/coupon
```

**Body:**

```typescript
{
  couponCode: string
}
```

---

## 📊 Analytics & Insights APIs

### 9. Product Analytics

```typescript
// Track product view
POST /api/analytics/track/view
Body: { productId: string, userId?: string, sessionId: string }

// Track add to cart
POST /api/analytics/track/cart
Body: { productId: string, userId?: string }

// Track purchase
POST /api/analytics/track/purchase
Body: { productId: string, userId: string, orderId: string }
```

---

### 10. Admin Dashboard Analytics

```typescript
// Revenue stats
GET /api/admin/analytics/revenue
Query: { startDate: string, endDate: string, groupBy: 'day'|'week'|'month' }

// Top products
GET /api/admin/analytics/top-products
Query: { limit: number, metric: 'revenue'|'quantity'|'views' }

// Conversion funnel
GET /api/admin/analytics/funnel
Response: {
  views: number,
  addToCart: number,
  checkout: number,
  purchase: number,
  conversionRate: number
}

// Real-time stats
GET /api/admin/analytics/live
Response: {
  activeUsers: number,
  currentSales: number,
  ordersToday: number,
  revenueToday: number
}
```

---

## 🤖 Recommendations APIs

### 11. Product Recommendations

```typescript
// Similar products
GET /api/recommendations/similar/:productId
Query: { limit?: number }

// Frequently bought together
GET /api/recommendations/frequently-bought/:productId
Query: { limit?: number }

// Personalized recommendations
GET /api/recommendations/personalized
Headers: { Authorization: Bearer <token> }
Query: { limit?: number }

// Based on browsing history
GET /api/recommendations/based-on-history
Headers: { Authorization: Bearer <token> }
```

**Response Format:**

```typescript
{
  products: Product[],
  reason: string              // e.g., "Based on your recent views"
}
```

---

## 📍 Location & Delivery APIs

### 12. Address Autocomplete

```typescript
GET /api/address/autocomplete
Query: { q: string, country?: string }
```

**Response:**

```typescript
{
  predictions: [
    {
      id: string,
      description: string,
      mainText: string,
      secondaryText: string
    }
  ]
}
```

---

### 13. Delivery Time Slots

```typescript
GET /api/delivery/slots
Query: { addressId: string, date: string }
```

**Response:**

```typescript
{
  slots: [
    {
      id: string,
      time: string, // e.g., "09:00 - 12:00"
      available: boolean,
      fee: number
    }
  ]
}
```

---

### 14. Shipping Cost Calculation

```typescript
POST / api / shipping / calculate
```

**Body:**

```typescript
{
  addressId: string,
  items: {
    productId: string,
    quantity: number,
    weight?: number
  }[],
  shippingMethod: 'standard' | 'express' | 'same_day'
}
```

**Response:**

```typescript
{
  cost: number,
  estimatedDays: number,
  carrier: string
}
```

---

## 💬 Q&A & Reviews APIs

### 15. Product Questions

```typescript
// Get questions
GET /api/products/:productId/questions
Query: {
  sort?: 'recent' | 'helpful' | 'unanswered',
  limit?: number,
  page?: number
}

// Ask question
POST /api/products/:productId/questions
Body: { question: string, userId: string }

// Answer question
POST /api/questions/:questionId/answers
Body: { answer: string, userId: string }

// Vote on question/answer
POST /api/questions/:questionId/vote
Body: { type: 'up' | 'down' }

// Mark as verified answer (seller only)
PUT /api/questions/:questionId/verify
Body: { answerId: string }
```

---

### 16. Advanced Review System

```typescript
// Get reviews with filters
GET /api/products/:productId/reviews
Query: {
  rating?: number,            // Filter by rating
  verified?: boolean,         // Only verified purchases
  hasImages?: boolean,        // Only reviews with images
  sort?: 'recent' | 'helpful' | 'rating_high' | 'rating_low',
  limit?: number,
  page?: number
}

// Review statistics
GET /api/products/:productId/reviews/stats
Response: {
  totalReviews: number,
  averageRating: number,
  ratingDistribution: {
    5: number,
    4: number,
    3: number,
    2: number,
    1: number
  },
  verifiedPurchasePercent: number
}

// Vote on review
POST /api/reviews/:reviewId/vote
Body: { helpful: boolean }

// Report review
POST /api/reviews/:reviewId/report
Body: { reason: string }
```

---

## 👤 User Profile & Preferences APIs

### 17. User Preferences

```typescript
// Get preferences
GET /api/users/:userId/preferences

// Update preferences
PUT /api/users/:userId/preferences
Body: {
  favoriteCategories?: string[],
  favoriteBrands?: string[],
  priceRange?: { min: number, max: number },
  notifications?: {
    email: boolean,
    push: boolean,
    sms: boolean
  }
}
```

---

### 18. Saved Addresses

```typescript
// List addresses
GET /api/users/:userId/addresses

// Add address
POST /api/users/:userId/addresses
Body: {
  name: string,
  phone: string,
  address: string,
  city: string,
  district: string,
  ward: string,
  isDefault?: boolean
}

// Update address
PUT /api/users/:userId/addresses/:addressId
Body: { ... }

// Delete address
DELETE /api/users/:userId/addresses/:addressId

// Set default
POST /api/users/:userId/addresses/:addressId/set-default
```

---

## 📧 Notification APIs

### 19. Email Notifications

```typescript
// Subscribe to price drop alert
POST /api/notifications/price-alert
Body: { productId: string, targetPrice: number }

// Subscribe to back-in-stock alert
POST /api/notifications/stock-alert
Body: { productId: string }

// Get user notifications
GET /api/users/:userId/notifications
Query: {
  type?: 'order' | 'promotion' | 'alert' | 'system',
  unread?: boolean,
  limit?: number
}

// Mark as read
PUT /api/notifications/:notificationId/read

// Delete notification
DELETE /api/notifications/:notificationId

// Mark all as read
POST /api/users/:userId/notifications/read-all
```

---

## 🔐 Authentication & Security APIs

### 20. Enhanced Auth

```typescript
// Two-factor authentication
POST /api/auth/2fa/enable
POST /api/auth/2fa/verify
Body: { code: string }

// Login history
GET /api/users/:userId/login-history

// Active sessions
GET /api/users/:userId/sessions

// Revoke session
DELETE /api/users/:userId/sessions/:sessionId
```

---

## 📱 Mobile & PWA APIs

### 21. Push Notifications

```typescript
// Register device for push
POST /api/push/subscribe
Body: {
  subscription: PushSubscription,
  deviceInfo: { type: 'ios' | 'android' | 'web' }
}

// Send test notification
POST /api/push/test
Body: { userId: string, message: string }
```

---

## 🏪 Multi-vendor APIs (Advanced)

### 22. Vendor Management

```typescript
// Register as vendor
POST /api/vendors/register
Body: { businessName, documents, ... }

// Vendor dashboard stats
GET /api/vendors/:vendorId/stats

// Vendor products
GET /api/vendors/:vendorId/products
POST /api/vendors/:vendorId/products
PUT /api/vendors/:vendorId/products/:productId

// Vendor orders
GET /api/vendors/:vendorId/orders

// Payout requests
POST /api/vendors/:vendorId/payout
GET /api/vendors/:vendorId/payouts
```

---

## 🎮 Gamification APIs

### 23. Loyalty Points

```typescript
// Get user points
GET /api/users/:userId/points

// Points history
GET /api/users/:userId/points/history

// Redeem points
POST /api/users/:userId/points/redeem
Body: { reward: string, points: number }

// Available rewards
GET /api/rewards
```

---

## 📊 API Best Practices Implemented

### Rate Limiting

```typescript
// Add to all routes
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

### Pagination

```typescript
// Standard pagination response
{
  data: T[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

### Error Responses

```typescript
{
  error: {
    code: string,              // e.g., "PRODUCT_NOT_FOUND"
    message: string,           // User-friendly message
    details?: any,             // Additional error info
    timestamp: string
  }
}
```

### Caching Headers

```typescript
Cache-Control: public, max-age=3600
ETag: "abc123"
Last-Modified: Thu, 28 Nov 2024 09:00:00 GMT
```

---

## 🚀 Implementation Priority

### Phase 1 (Week 1):

1. ✅ Search & Suggestions
2. ✅ Wishlist
3. ✅ Product Comparison
4. ✅ Coupon System

### Phase 2 (Week 2):

5. ✅ Recommendations
6. ✅ Advanced Reviews
7. ✅ Q&A System
8. ✅ Address Management

### Phase 3 (Week 3):

9. ✅ Analytics APIs
10. ✅ Notifications
11. ✅ Delivery Management
12. ✅ User Preferences

### Phase 4 (Week 4):

13. ✅ Multi-vendor (if needed)
14. ✅ Gamification
15. ✅ Advanced Security
16. ✅ Performance optimization

---

## 📝 Testing Tools

### Postman Collection

Create a complete Postman collection with:

- All endpoints
- Example requests
- Test scripts
- Environment variables

### API Documentation

Use Swagger/OpenAPI:

```yaml
openapi: 3.0.0
info:
  title: E-Commerce API
  version: 1.0.0
paths:
  /api/search/products:
    get:
      summary: Search products
      parameters: ...
      responses: ...
```

---

## 🎯 Interview Talking Points

When discussing APIs:

✨ **"Tôi design RESTful APIs với:**

- Consistent naming conventions
- Proper HTTP status codes
- Pagination & filtering
- Rate limiting
- Caching strategies
- Comprehensive error handling"

✨ **"API optimization techniques:**

- Database query optimization
- Redis caching
- Response compression
- API versioning
- Load balancing"

---

**Created:** Nov 28, 2024  
**Total Endpoints:** 70+  
**Documentation:** Complete with examples
