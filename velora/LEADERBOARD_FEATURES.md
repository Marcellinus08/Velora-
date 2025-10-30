# Profile History & Activity Feature

## Overview
Fitur History dan Activity telah dipindahkan dari leaderboard modal ke **halaman Profile** untuk memberikan pengalaman user yang lebih baik. User dapat melihat riwayat transaksi dan aktivitas mereka atau user lain dengan mengklik profile di leaderboard.

## Navigation Flow
```
Leaderboard → Click User → Profile Page (/profile?addr=0x...)
                                ↓
                    Tabs: All | History | Activity
```

## Perbedaan History dan Activity

### 📜 History (Riwayat Transaksi)
Tab History menampilkan **semua transaksi keuangan** yang dilakukan oleh user:

#### 1. Video Purchases
- Thumbnail & judul video
- Creator video
- Harga pembelian (USDC)
- Tanggal pembelian
- Status transaksi
- Link transaction hash

#### 2. Subscription Payments
- Tier langganan (Bronze/Silver/Gold)
- Harga & periode
- Tanggal mulai & berakhir
- Status (Active/Expired)

#### 3. Meet/Call Purchases
- Creator yang di-call
- Durasi call (menit)
- Total biaya
- Jadwal call
- Status (Scheduled/Completed/Cancelled)

#### 4. Ad Purchases *(Coming Soon)*
- Tipe iklan
- Durasi iklan
- Total biaya
- Impressions/Views

**Stats yang ditampilkan:**
- Total Spent (USDC)
- Total Transactions
- Video Purchases Count
- Meet Purchases Count

---

### 🎯 Activity (Aktivitas Platform)
Tab Activity menampilkan **semua aktivitas & pencapaian** user di platform:

#### 1. Video Uploads
- Video yang di-upload
- Views & Likes
- Points earned (+20 pts per upload)

#### 2. Task Completion
- Task yang diselesaikan
- Video terkait
- Points earned (bervariasi)

#### 3. Social Interactions
- Community posts created
- Videos shared
- Likes & comments received

#### 4. Meet Activity
- Calls hosted (sebagai creator)
- Calls attended (sebagai participant)
- Earnings dari calls
- Points earned

#### 5. Milestones & Achievements
- Points milestones (10, 25, 50, 100, 250, 500, 1000 pts)
- Leaderboard achievements
- Badges earned

**Stats yang ditampilkan:**
- Total Points Earned
- Videos Uploaded
- Tasks Completed
- Total Earnings (USDC)

---

## API Endpoints

### 1. GET `/api/leaderboard/history`
Mengambil riwayat transaksi user.

**Query Parameters:**
- `userAddr` (required): Wallet address user
- `type` (optional): Filter by type - `all`, `videos`, `subscriptions`, `meets`, `ads`
- `limit` (optional): Jumlah data yang diambil (default: 50)

**Response:**
```json
{
  "success": true,
  "userAddr": "0x...",
  "history": [...],
  "stats": {
    "totalTransactions": 10,
    "totalSpent": 150.50,
    "videoPurchases": 5,
    "meetPurchases": 3,
    "subscriptions": 1,
    "adPurchases": 1
  }
}
```

### 2. GET `/api/leaderboard/activity`
Mengambil aktivitas user.

**Query Parameters:**
- `userAddr` (required): Wallet address user
- `type` (optional): Filter by type - `all`, `content`, `tasks`, `social`, `earnings`
- `limit` (optional): Jumlah data yang diambil (default: 50)

**Response:**
```json
{
  "success": true,
  "userAddr": "0x...",
  "activities": [...],
  "stats": {
    "totalActivities": 50,
    "totalPointsEarned": 580,
    "totalEarnings": 45.00,
    "videosUploaded": 12,
    "tasksCompleted": 25,
    "postsCreated": 8,
    "meetsHosted": 3,
    "meetsAttended": 2
  }
}
```

---

## UI Features

### Filter & Search
- **Filter by Type**: Filter data berdasarkan kategori
- **Search**: Cari berdasarkan nama video, creator, atau deskripsi
- **Sort**: Urutkan berdasarkan Newest atau Oldest

### Visual Indicators
- **Color-coded icons**: Setiap tipe aktivitas memiliki warna berbeda
- **Status badges**: Green (completed/active), Yellow (pending/scheduled)
- **Points display**: Menampilkan points yang didapat dari setiap aktivitas
- **Earnings display**: Menampilkan earnings dalam USDC untuk creator

### Responsive Design
- Mobile-friendly layout
- Adaptive card design
- Scrollable content area
- Stats cards dengan grid responsive

---

## Data Sources

### History Data:
- `video_purchases` table
- `meets` table (as participant)
- `user_subscriptions` table *(coming soon)*
- `ad_purchases` table *(coming soon)*

### Activity Data:
- `videos` table (uploads)
- `user_video_progress` table (tasks, shares, purchases)
- `community_posts` table
- `meets` table (as creator or participant)

---

## Technical Implementation

### Files Modified:
1. **`/src/app/api/leaderboard/history/route.ts`** - History API endpoint
2. **`/src/app/api/leaderboard/activity/route.ts`** - Activity API endpoint
3. **`/src/components/leaderboard/types.ts`** - TypeScript types
4. **`/src/app/leaderboard/page.tsx`** - Removed ProfileModal, added redirect to profile
5. **`/src/app/profile/page.tsx`** - Added History & Activity tabs with API integration

### Files Removed/Deprecated:
1. **`/src/components/leaderboard/profilemodal.tsx`** - No longer used (replaced by profile page)
2. **`/src/components/leaderboard/data.ts`** - PROFILE_DB dummy data no longer needed

### Key Features:
- ✅ Real-time data fetching from Supabase
- ✅ Type-safe implementation dengan TypeScript
- ✅ Error handling & loading states
- ✅ Search & filter functionality
- ✅ Responsive design
- ✅ Transaction hash links ke blockchain explorer
- ✅ Stats aggregation & calculation
- ✅ Dynamic profile loading (own profile or other users)
- ✅ URL parameter support (?addr=0x...)
- ✅ Tab-based navigation (All/History/Activity)

---

## Future Enhancements

### Planned Features:
1. **Subscriptions Integration**
   - Track subscription purchases
   - Show active/expired status
   - Display subscription benefits

2. **Ads System**
   - Ad purchase history
   - Campaign performance metrics
   - Impressions & click tracking

3. **Enhanced Analytics**
   - Charts & graphs for activity trends
   - Week/month/year comparisons
   - Export data functionality

4. **Notifications**
   - Real-time updates for new activities
   - Achievement notifications
   - Transaction confirmations

---

## How to Test

1. **Buka halaman Leaderboard**
   ```
   http://localhost:3000/leaderboard
   ```

2. **Click pada user di leaderboard** untuk redirect ke profile page

3. **Profile Page akan terbuka** dengan URL:
   ```
   http://localhost:3000/profile?addr=0x...
   ```

4. **Test tab "All":**
   - Default view dengan activity summary

5. **Test tab "History":**
   - Lihat video purchases (jika ada)
   - Lihat meet purchases (jika ada)
   - Test filter by type (All/Videos/Subscriptions/Meets/Ads)
   - Test search functionality
   - Test sort (newest/oldest)
   - Check stats cards (Total Spent, Videos, Meets, Total)

6. **Test tab "Activity":**
   - Lihat video uploads
   - Lihat completed tasks
   - Lihat social activities
   - Lihat meet activities
   - Test filter by type (All/Content/Tasks/Social/Earnings)
   - Test search functionality
   - Test sort (newest/oldest)
   - Check stats cards (Points Earned, Videos, Tasks, Earnings)

7. **Verify Stats:**
   - Check total spent calculation di History
   - Check points earned calculation di Activity
   - Check transaction counts
   - Check profile header stats (followers, following, points, rank)

8. **Test Navigation:**
   - Click different users dari leaderboard
   - Verify URL changes dengan address yang benar
   - Verify data updates untuk setiap user
   - Test dengan own profile (tanpa ?addr parameter)

---

## Notes

- **Leaderboard** sekarang hanya menampilkan ranking list
- Click user di leaderboard akan redirect ke **Profile Page**
- **Profile Page** menampilkan 3 tabs: All, History, Activity
- History & Activity data akan kosong jika user belum melakukan aktivitas
- Semua transaksi menggunakan USDC sebagai currency
- Points calculation mengikuti sistem reward yang sudah ada
- Transaction hash links mengarah ke Abstract Explorer
- Profile page mendukung viewing profile orang lain via URL parameter
- Jika tidak ada ?addr parameter, profile page akan show connected wallet's profile

---

**Last Updated:** October 30, 2025
**Version:** 2.0.0 (Moved to Profile Page)
