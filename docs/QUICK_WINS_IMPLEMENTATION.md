# 🚀 Quick Wins - Implementation Guide

## Top 3 Features có Impact Cao Nhất (2-3 ngày)

---

## 1️⃣ Real-time Product Stock + Viewers Counter ⚡

### Why This First?

- ✨ Wow factor cực cao
- 🎯 Dễ implement (bạn đã có Socket.io)
- 💼 Real business value (FOMO marketing)
- 🔥 Show WebSocket expertise

### Implementation Steps:

#### Step 1: Backend WebSocket Setup

```typescript
// src/app/api/socket/route.ts (Next.js API route)
import { Server } from 'socket.io'
import { NextResponse } from 'next/server'

const productViewers = new Map<string, Set<string>>()
const productStock = new Map<string, number>()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' })
  }

  return NextResponse.json({
    viewers: productViewers.get(productId)?.size || 0,
    stock: productStock.get(productId) || 0
  })
}

// Socket handler (separate file)
// src/lib/socket-handler.ts
export function setupProductSockets(io: Server) {
  io.on('connection', socket => {
    console.log('User connected:', socket.id)

    // Join product room
    socket.on('product:watch', (productId: string) => {
      socket.join(`product:${productId}`)

      // Track viewer
      if (!productViewers.has(productId)) {
        productViewers.set(productId, new Set())
      }
      productViewers.get(productId)!.add(socket.id)

      // Broadcast viewer count
      io.to(`product:${productId}`).emit('viewers:updated', {
        productId,
        count: productViewers.get(productId)!.size
      })
    })

    // Leave product room
    socket.on('product:unwatch', (productId: string) => {
      socket.leave(`product:${productId}`)

      // Remove viewer
      productViewers.get(productId)?.delete(socket.id)

      // Broadcast new count
      io.to(`product:${productId}`).emit('viewers:updated', {
        productId,
        count: productViewers.get(productId)?.size || 0
      })
    })

    // Handle purchase (stock update)
    socket.on('product:purchased', ({ productId, quantity }) => {
      const currentStock = productStock.get(productId) || 0
      const newStock = Math.max(0, currentStock - quantity)

      productStock.set(productId, newStock)

      // Broadcast stock update
      io.to(`product:${productId}`).emit('stock:updated', {
        productId,
        stock: newStock
      })
    })

    // Disconnect
    socket.on('disconnect', () => {
      // Remove from all product rooms
      productViewers.forEach((viewers, productId) => {
        if (viewers.has(socket.id)) {
          viewers.delete(socket.id)

          io.to(`product:${productId}`).emit('viewers:updated', {
            productId,
            count: viewers.size
          })
        }
      })
    })
  })
}
```

#### Step 2: Frontend Hook

```typescript
// src/hooks/useProductRealtimeData.ts
'use client'

import { useEffect, useState } from 'react'
import { socket } from 'src/lib/socket'

interface ProductRealtimeData {
  viewers: number
  stock: number
  isConnected: boolean
}

export function useProductRealtimeData(productId: string | null) {
  const [data, setData] = useState<ProductRealtimeData>({
    viewers: 0,
    stock: 0,
    isConnected: false
  })

  useEffect(() => {
    if (!productId) return

    // Connect socket
    socket.connect()

    setData(prev => ({ ...prev, isConnected: true }))

    // Join product room
    socket.emit('product:watch', productId)

    // Listen for viewer updates
    socket.on('viewers:updated', ({ productId: pid, count }) => {
      if (pid === productId) {
        setData(prev => ({ ...prev, viewers: count }))
      }
    })

    // Listen for stock updates
    socket.on('stock:updated', ({ productId: pid, stock }) => {
      if (pid === productId) {
        setData(prev => ({ ...prev, stock }))
      }
    })

    // Cleanup
    return () => {
      socket.emit('product:unwatch', productId)
      socket.off('viewers:updated')
      socket.off('stock:updated')
    }
  }, [productId])

  return data
}
```

#### Step 3: UI Component

```typescript
// src/components/product-realtime-stats/index.tsx
'use client'

import { Box, Chip, Typography } from '@mui/material'
import { useProductRealtimeData } from 'src/hooks/useProductRealtimeData'
import Icon from 'src/components/Icon'
import { useTheme } from '@mui/material/styles'

interface Props {
  productId: string
  initialStock?: number
}

export default function ProductRealtimeStats({ productId, initialStock = 0 }: Props) {
  const { viewers, stock, isConnected } = useProductRealtimeData(productId)
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 2 }}>
      {/* Viewers Counter */}
      <Chip
        icon={<Icon icon="mdi:eye-outline" />}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">
              {viewers}
            </Typography>
            <Typography variant="caption">
              đang xem
            </Typography>
          </Box>
        }
        color="primary"
        variant="outlined"
        sx={{
          animation: viewers > 5 ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 }
          }
        }}
      />

      {/* Stock Counter */}
      <Chip
        icon={<Icon icon="mdi:package-variant" />}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">
              {stock || initialStock}
            </Typography>
            <Typography variant="caption">
              còn lại
            </Typography>
          </Box>
        }
        color={stock < 10 ? "error" : "success"}
        variant="outlined"
      />

      {/* Low Stock Warning */}
      {stock > 0 && stock < 10 && (
        <Chip
          label="🔥 Sắp hết hàng!"
          color="error"
          size="small"
          sx={{
            animation: 'blink 1s infinite',
            '@keyframes blink': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 }
            }
          }}
        />
      )}

      {/* Connection Status */}
      {!isConnected && (
        <Typography variant="caption" color="text.secondary">
          (Offline)
        </Typography>
      )}
    </Box>
  )
}
```

#### Step 4: Integrate vào Product Page

```typescript
// src/views/pages/product/DetailsProduct/index.tsx
import ProductRealtimeStats from 'src/components/product-realtime-stats'

// Inside component:
<ProductRealtimeStats
  productId={product._id}
  initialStock={product.countInStock}
/>
```

---

## 2️⃣ Advanced Search với Auto-complete 🔍

### Why This?

- 🎯 Tăng UX đáng kể
- 📊 Show debouncing/throttling skills
- 🧠 Algorithm knowledge (search relevance)

### Implementation:

#### Step 1: Search Service

```typescript
// src/services/search.ts
import axios from 'axios'

export interface SearchSuggestion {
  id: string
  name: string
  type: 'product' | 'category' | 'brand'
  thumbnail?: string
  price?: number
}

export interface SearchResult {
  products: any[]
  totalCount: number
  suggestions: SearchSuggestion[]
}

export const searchProducts = async (params: {
  q: string
  limit?: number
  page?: number
  filters?: {
    priceMin?: number
    priceMax?: number
    brands?: string[]
    categories?: string[]
    rating?: number
  }
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}): Promise<SearchResult> => {
  const response = await axios.get('/api/search/products', { params })
  return response.data
}

export const getSuggestions = async (q: string): Promise<SearchSuggestion[]> => {
  const response = await axios.get('/api/search/suggestions', { params: { q } })
  return response.data
}

export const getTrendingSearches = async (): Promise<string[]> => {
  const response = await axios.get('/api/search/trending')
  return response.data
}

// Save search to history
export const saveSearchHistory = (query: string) => {
  const history = JSON.parse(localStorage.getItem('searchHistory') || '[]')
  const updated = [query, ...history.filter(q => q !== query)].slice(0, 10)
  localStorage.setItem('searchHistory', JSON.stringify(updated))
}

export const getSearchHistory = (): string[] => {
  return JSON.parse(localStorage.getItem('searchHistory') || '[]')
}
```

#### Step 2: Search Hook với Debounce

```typescript
// src/hooks/useSearch.ts
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebounce } from 'src/hooks/useDebounce'
import { getSuggestions, SearchSuggestion } from 'src/services/search'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce query để giảm API calls
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await getSuggestions(debouncedQuery)
        setSuggestions(results)
      } catch (err) {
        setError('Không thể tìm kiếm')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedQuery])

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    error
  }
}

// useDebounce hook
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

#### Step 3: Search Component

```typescript
// src/components/advanced-search/index.tsx
'use client'

import { useState } from 'react'
import {
  Autocomplete,
  TextField,
  Box,
  Paper,
  Typography,
  Avatar,
  CircularProgress,
  Chip
} from '@mui/material'
import { useSearch } from 'src/hooks/useSearch'
import { useNavigate } from 'src/hooks/useNavigate'
import { saveSearchHistory, getSearchHistory } from 'src/services/search'
import Icon from 'src/components/Icon'

export default function AdvancedSearch() {
  const { query, setQuery, suggestions, isLoading } = useSearch()
  const [history] = useState(getSearchHistory())
  const router = useNavigate()

  const handleSearch = (selectedQuery: string) => {
    if (!selectedQuery) return

    saveSearchHistory(selectedQuery)
    router.push(`/product?search=${encodeURIComponent(selectedQuery)}`)
  }

  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      loading={isLoading}
      inputValue={query}
      onInputChange={(_, newValue) => setQuery(newValue)}
      onChange={(_, value: any) => {
        if (typeof value === 'string') {
          handleSearch(value)
        } else if (value?.id) {
          router.push(`/product/${value.id}`)
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option
        return option.name
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Tìm kiếm sản phẩm..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Icon icon="mdi:magnify" style={{ marginRight: 8 }} />
            ),
            endAdornment: (
              <>
                {isLoading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {option.thumbnail && (
              <Avatar
                src={option.thumbnail}
                variant="rounded"
                sx={{ width: 40, height: 40 }}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {option.name}
              </Typography>
              {option.price && (
                <Typography variant="caption" color="text.secondary">
                  {option.price.toLocaleString('vi-VN')} VND
                </Typography>
              )}
            </Box>
            <Chip
              label={option.type}
              size="small"
              color={option.type === 'product' ? 'primary' : 'default'}
            />
          </Box>
        </li>
      )}
      PaperComponent={({ children }) => (
        <Paper>
          {history.length > 0 && !query && (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                Tìm kiếm gần đây
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {history.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    size="small"
                    onClick={() => handleSearch(item)}
                    icon={<Icon icon="mdi:history" />}
                  />
                ))}
              </Box>
            </Box>
          )}
          {children}
        </Paper>
      )}
      sx={{ width: '100%', maxWidth: 600 }}
    />
  )
}
```

---

## 3️⃣ Social Proof Widgets 👥

### Why This?

- ⚡ Quick to implement (1 day)
- 📈 Proven to increase conversions 15-30%
- 🎨 Great visual impact

### Implementation:

#### Step 1: Recent Purchases Popup

```typescript
// src/components/social-proof/RecentPurchasePopup.tsx
'use client'

import { useState, useEffect } from 'react'
import { Box, Paper, Typography, Avatar, Slide } from '@mui/material'
import { useTheme } from '@mui/material/styles'

interface Purchase {
  userName: string
  userAvatar?: string
  productName: string
  timestamp: Date
  location?: string
}

// Mock data generator (replace with real API)
const generateMockPurchase = (): Purchase => {
  const names = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D']
  const products = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M2', 'AirPods Pro']
  const locations = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ']

  return {
    userName: names[Math.floor(Math.random() * names.length)],
    productName: products[Math.floor(Math.random() * products.length)],
    timestamp: new Date(),
    location: locations[Math.floor(Math.random() * locations.length)]
  }
}

export default function RecentPurchasePopup() {
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [show, setShow] = useState(false)
  const theme = useTheme()

  useEffect(() => {
    const showNotification = () => {
      setPurchase(generateMockPurchase())
      setShow(true)

      // Hide after 5 seconds
      setTimeout(() => {
        setShow(false)
      }, 5000)
    }

    // Show random notification every 20-40 seconds
    const interval = setInterval(() => {
      showNotification()
    }, Math.random() * 20000 + 20000)

    return () => clearInterval(interval)
  }, [])

  if (!purchase) return null

  return (
    <Slide direction="left" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          p: 2,
          maxWidth: 300,
          zIndex: 1300,
          cursor: 'pointer',
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[12]
          }
        }}
        onClick={() => setShow(false)}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar src={purchase.userAvatar} sx={{ bgcolor: 'primary.main' }}>
            {purchase.userName[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Có người vừa mua! 🎉
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              <strong>{purchase.userName}</strong>
              {purchase.location && ` từ ${purchase.location}`}
            </Typography>
            <Typography variant="caption" color="primary.main" display="block" sx={{ mt: 0.5 }}>
              {purchase.productName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {Math.floor((Date.now() - purchase.timestamp.getTime()) / 60000)} phút trước
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Slide>
  )
}
```

#### Step 2: Trust Badges

```typescript
// src/components/social-proof/TrustBadges.tsx
import { Box, Chip, Tooltip } from '@mui/material'
import Icon from 'src/components/Icon'

export default function TrustBadges() {
  const badges = [
    { icon: 'mdi:shield-check', label: 'SSL Secure', tooltip: 'Thanh toán bảo mật 100%' },
    { icon: 'mdi:truck-fast', label: 'Giao hàng nhanh', tooltip: 'Giao trong 2-3 ngày' },
    { icon: 'mdi:undo-variant', label: 'Đổi trả 7 ngày', tooltip: 'Hoàn tiền dễ dàng' },
    { icon: 'mdi:check-decagram', label: 'Chính hãng 100%', tooltip: 'Cam kết hàng thật' }
  ]

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 2 }}>
      {badges.map((badge, index) => (
        <Tooltip key={index} title={badge.tooltip}>
          <Chip
            icon={<Icon icon={badge.icon} />}
            label={badge.label}
            size="small"
            color="success"
            variant="outlined"
          />
        </Tooltip>
      ))}
    </Box>
  )
}
```

#### Step 3: Integrate Everything

```typescript
// src/app/[locale]/layout.tsx - Add to layout
import RecentPurchasePopup from 'src/components/social-proof/RecentPurchasePopup'

// Inside return:
<>
  {children}
  <RecentPurchasePopup />
</>

// In Product page - Add TrustBadges
import TrustBadges from 'src/components/social-proof/TrustBadges'

// Inside product details:
<TrustBadges />
```

---

## 🎯 Testing & Verification

### Test Checklist:

```
□ Real-time viewers counter updates
□ Stock decreases on purchase
□ Search suggestions appear < 500ms
□ Recent purchase popup shows
□ Trust badges display correctly
□ Mobile responsive
□ No console errors
□ Loading states work
```

### Demo Video Script:

```
1. "Đây là real-time features với WebSocket"
2. Open 2 tabs → show viewer count increases
3. "Advanced search với debouncing"
4. Type slowly → show suggestions appear
5. "Social proof để tăng conversion"
6. Show recent purchase popup
```

---

## 📊 Expected Results

### After Implementation:

✅ **Portfolio looks 10x more impressive**
✅ **Shows full-stack capabilities**
✅ **Demonstrates modern patterns**
✅ **Production-ready features**

### Interview Talking Points:

```
"Tôi implement WebSocket để real-time stock updates,
giảm stale data và tăng user trust"

"Advanced search với debouncing giảm API calls 80%,
improve performance và user experience"

"Social proof widgets tăng conversion rate theo
psychological principles"
```

---

## 🚀 Next Features to Add

After these 3, continue with:

1. Wishlist + Compare
2. Product recommendations
3. Voucher system
4. Advanced analytics

**Estimated total time: 1 week for all Quick Wins** ⚡

---

**Created:** Nov 28, 2024  
**Difficulty:** ⭐⭐⭐ (Medium)  
**Impact:** ⭐⭐⭐⭐⭐ (Very High)
