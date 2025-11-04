# Infinite Scroll Implementation - Community Page

## Status: ✅ Implemented

Infinite scroll telah diimplementasikan di **halaman Community** dengan **hemat request seperti home page** - hanya load 5 posts awal, kemudian fetch 5 posts per scroll.

## Apa yang Diimplementasikan

### 1. Hook `useInfiniteScroll`
📍 File: `/src/hooks/use-infinite-scroll.ts`

Hook ini menggunakan **Intersection Observer API** untuk:
- Mendeteksi ketika user scroll mendekati akhir list
- Trigger fetch data baru secara otomatis
- Menghemat bandwidth dengan hanya load konten yang diperlukan

**Fitur:**
- `threshold`: Kapan trigger (default: 0.1 = 10% visibility)
- `rootMargin`: Pre-load sebelum reach bottom (default: 100px)
- `enabled`: Toggle untuk enable/disable infinite scroll

### 2. API Pagination - `/api/community/posts`
📍 File: `/src/app/api/community/posts/route.ts`

**Perubahan:**
- ✅ Tambah parameter `page` untuk pagination
- ✅ Load 5 items per page (hemat request)
- ✅ Query: `.range(offset, offset + 4)` - Supabase range untuk pagination

**Contoh Request:**
```
GET /api/community/posts?page=1&category=All%20Topics&me=0x...  → 5 items
GET /api/community/posts?page=2&category=All%20Topics&me=0x...  → 5 items berikutnya
```

### 3. Community Page Component
📍 File: `/src/app/community/page.tsx`

**Perubahan:**
- ✅ State: `loading`, `loadingMore`, `posts`, `page`, `hasMore`, `error`
- ✅ Function `loadInitial()`: Initial load 20 posts pertama
- ✅ Function `fetchMore()`: Callback untuk load page berikutnya
- ✅ Hook `useInfiniteScroll`: Trigger fetchMore saat user scroll ke bawah
- ✅ Observer target element di akhir list
- ✅ Loading spinner saat fetch berlangsung
- ✅ Empty state ketika tidak ada posts

**Fitur:**
- Auto-fetch hanya ketika user scroll ke bawah (hemat bandwidth)
- Retain existing posts saat load more
- Filter by category terintegrasi
- Like/Reply/Share/Edit/Delete functionality

## Cara Kerja

```
Page Load
    ↓
loadInitial() → Fetch /api/community/posts?page=1
    ↓
Display 5 posts (atau kurang jika < 5)
    ↓
User scroll → Intersection Observer detect element near viewport
    ↓
fetchMore() → Fetch /api/community/posts?page=2
    ↓
Tambah 5 posts ke existing posts
    ↓
Repeat sampai dapat < 5 posts (berarti tidak ada page berikutnya)
```

## Bandwith Savings

**Sebelum (load semua):**
- Muat 100 posts sekaligus di page load
- User harus scroll banyak untuk lihat semua

**Sesudah (infinite scroll 5/page):**
- Mula muat 5 posts
- Load 5 lebih per scroll (on-demand)
- User hanya lihat konten yang mereka butuhkan
- **Hemat data ~95% untuk first page load** 🎉

## Desain & UX

- **Layout**: Landscape dengan avatar di kiri, content di kanan (original design)
- **Expand/Collapse**: Click "Read more" untuk baca full content
- **Replies**: Terintegrasi dengan section replies
- **Share**: Share ke Twitter/X
- **Edit/Delete**: Hanya untuk post owner

## Konfigurasi

Jika ingin ubah jumlah items per page, edit di `/api/community/posts/route.ts`:

```typescript
const pageSize = 5;  // Ubah ke nilai lain sesuai kebutuhan
```

## Testing

1. Buka halaman Community
2. Lihat 5 posts pertama load (sangat cepat!)
3. Scroll ke bawah hingga near bottom → lihat loading spinner
4. Otomatis load 5 posts berikutnya
5. DevTools → Network: lihat requests hanya dikirim saat scroll
   - Request 1: `/api/community/posts?page=1` (5 posts)
   - Request 2: `/api/community/posts?page=2` (saat user scroll)
   - Request 3: `/api/community/posts?page=3` (saat user scroll lagi)

---

✅ Production Ready - Hemat Request seperti YouTube! 🚀
