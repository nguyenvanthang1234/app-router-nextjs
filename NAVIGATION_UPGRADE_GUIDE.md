# 🚀 Navigation Performance Upgrade Guide

## 🎯 Vấn Đề Đã Giải Quyết

- ❌ Delay khi chuyển trang
- ❌ Phải click 2 lần mới navigate được
- ❌ Không có visual feedback khi đang chuyển trang
- ✅ Giờ có loading bar mượt mà như Facebook, YouTube

## 📦 Đã Cài Đặt

### 1. **NProgress Loading Bar** ✅

- File: `src/hooks/useNProgress.ts`
- File: `src/components/nprogress-provider/index.tsx`
- Đã integrate vào: `src/app/[locale]/layout.tsx`
- Styles: `src/app/globals.css`

**Kết quả:** Loading bar màu xanh ở top màn hình khi navigate

### 2. **Custom Navigation Hook** ✅

- File: `src/hooks/useNavigate.ts`
- Thay thế: `useRouter()` từ Next.js
- Features:
  - ✅ Auto start/stop NProgress
  - ✅ Use React transitions (smoother)
  - ✅ Return `isNavigating` state
  - ✅ Prevent double-click issues

### 3. **Example Migration** ✅

- Updated: `src/views/pages/product/components/CardProduct.tsx`

---

## 🔧 Cách Migration Code Hiện Tại

### **BEFORE (Old Code)**

```tsx
import { useRouter } from 'next/navigation'

function MyComponent() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/some-page')
  }

  return <button onClick={handleClick}>Go</button>
}
```

### **AFTER (New Code)**

```tsx
import { useNavigate } from 'src/hooks/useNavigate'

function MyComponent() {
  const router = useNavigate()

  const handleClick = () => {
    router.push('/some-page') // Same API!
  }

  // Optional: Show loading state
  return (
    <button onClick={handleClick} disabled={router.isNavigating}>
      {router.isNavigating ? 'Loading...' : 'Go'}
    </button>
  )
}
```

---

## 📝 Migration Checklist

Thay đổi trong **TẤT CẢ** các file sau:

### High Priority (Navigation nhiều)

- [ ] `src/views/layouts/components/language-dropdown/index.tsx`
- [ ] `src/views/layouts/components/cart-product/index.tsx`
- [ ] `src/views/layouts/components/user-dropdown/index.tsx`
- [ ] `src/views/layouts/components/notification-dropdown/components/NotificationItem.tsx`
- [ ] `src/views/pages/dashboard/components/CardProductPopular.tsx`
- [ ] `src/views/pages/product/components/CardRelatedProduct.tsx`
- [ ] `src/views/pages/my-order/components/CardOrder.tsx`

### Medium Priority

- [ ] `src/views/pages/login/index.tsx`
- [ ] `src/views/pages/register/index.tsx`
- [ ] `src/views/pages/forgot-password/index.tsx`
- [ ] `src/views/pages/reset-password/index.tsx`
- [ ] `src/views/pages/my-cart/index.tsx`
- [ ] `src/views/pages/checkout-product/index.tsx`
- [ ] `src/views/pages/checkout-product/components/ModalWarning.tsx`

### Guards & Contexts

- [ ] `src/guard/AuthGuard.tsx`
- [ ] `src/guard/GuestGuard.tsx`
- [ ] `src/guard/AclGuard.tsx`
- [ ] `src/contexts/AuthContext.tsx`
- [ ] `src/helpers/axios/index.tsx`

---

## 🎨 Bonus: Customize Loading Bar

### Thay đổi màu sắc

```css
/* src/app/globals.css */
#nprogress .bar {
  background: #29d; /* Đổi màu tại đây */
}
```

### Themes phổ biến:

```css
/* Facebook Blue */
background: #1877f2;

/* YouTube Red */
background: #ff0000;

/* GitHub Purple */
background: #8b5cf6;

/* Success Green */
background: #10b981;
```

---

## 🧪 Testing

1. **Dev mode:**

```bash
npm run dev
```

2. **Test navigation:**

- Click vào bất kỳ link nào
- ✅ Phải thấy loading bar màu xanh ở top
- ✅ Navigation phải mượt, không delay
- ✅ Click 1 lần là đủ

3. **Production build:**

```bash
npm run build
npm start
```

---

## 📊 Performance Improvements

| Metric             | Before     | After          |
| ------------------ | ---------- | -------------- |
| Visual Feedback    | ❌ None    | ✅ Loading Bar |
| Click Response     | ❌ Delayed | ✅ Immediate   |
| Double Click Issue | ❌ Yes     | ✅ No          |
| User Experience    | 😞 Poor    | 😊 Smooth      |

---

## 🚨 Notes

### Khi nào dùng `useNavigate()`?

✅ **Use**: Khi dùng `router.push()`, `router.replace()` trong event handlers

❌ **Don't use**: Khi dùng Next.js `<Link>` component (Link đã tối ưu sẵn)

### Example:

```tsx
// ✅ GOOD - Use <Link> for simple navigation
import Link from 'next/link'
;<Link href='/product/123'>View Product</Link>

// ✅ GOOD - Use useNavigate() for programmatic navigation
const router = useNavigate()
const handleSubmit = async () => {
  await saveData()
  router.push('/success')
}

// ❌ BAD - Don't use onClick with Link AND router.push
;<Link href='/product/123'>
  <div onClick={() => router.push('/product/123')}>...</div>
</Link>
```

---

## 🎓 Next Steps

1. **Migration từng file một** theo checklist ở trên
2. **Test kỹ** sau mỗi file migration
3. **Commit changes** thường xuyên
4. **Deploy lên Vercel** để test production

---

## 💡 Pro Tips cho CV

Khi trình bày với nhà tuyển dụng:

✨ **"Tôi đã optimize navigation experience bằng cách:**

- Implement custom loading indicator với NProgress
- Reduce double-click issues với React transitions
- Improve perceived performance bằng visual feedback"

**Từ khóa kỹ thuật:**

- Progressive loading
- User experience optimization
- Performance tuning
- React transitions
- Client-side navigation

---

## ❓ FAQ

**Q: Có cần update tất cả files ngay không?**
A: Không, có thể migration dần. Ưu tiên files có navigation nhiều nhất.

**Q: Có ảnh hưởng đến SEO không?**
A: Không, vì chỉ optimize client-side navigation.

**Q: Production build có lỗi không?**
A: Không, đã test compatible với Next.js 14 App Router.

---

**Tác giả:** AI Assistant  
**Ngày tạo:** 28/11/2024  
**Version:** 1.0.0
