'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OverviewMetrics {
  totalRevenue: number;
  totalTransactions: number;
  activeUsers: number;
  newRegistrations: number;
}

interface VideoItem {
  id: string;
  title: string;
  comments?: number;
  likes?: number;
  creator: string;
  thumbnail: string | null;
  category: string;
}

interface VideoAnalytics {
  totalVideos: number;
  mostCommentedVideos: VideoItem[];
  mostLikedVideos: VideoItem[];
  videosByCategory: Record<string, number>;
  uploadTrend: { month: string; count: number }[];
  avgDuration: number;
  totalWatchTime: number;
}

interface UserAnalytics {
  totalUsers: number;
  userGrowth: { month: string; count: number }[];
  activeUsers: number;
  inactiveUsers: number;
  topCreators: { username: string; followers: number; videos: number }[];
}

interface EngagementMetrics {
  avgLikesPerVideo: number;
  avgCommentsPerVideo: number;
  avgSharesPerVideo: number;
  totalEngagement: number;
  mostActiveUsers: { username: string; engagement: number }[];
}

interface PlatformHealth {
  storageUsage: number;
  bandwidthUsage: number;
  errorRate: number;
  apiResponseTime: number;
}

interface ReportData {
  overview: OverviewMetrics;
  videoAnalytics: VideoAnalytics;
  userAnalytics: UserAnalytics;
  engagementMetrics: EngagementMetrics;
  platformHealth: PlatformHealth;
}

export default function ViewReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // 7, 30, 90, or custom
  const router = useRouter();

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuth) {
      router.push('/panel-admin');
      return;
    }
    fetchReports();
  }, [router]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/reports');
      const data = await response.json();

      if (data.success) {
        setReportData(data);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      setError('Error loading reports');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };
  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    if (hours > 1000) {
      return `${(hours / 1000).toFixed(1)}K hours`;
    }
    return `${hours.toLocaleString()} hours`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const exportToCSV = () => {
    alert('Export to CSV - Coming soon!');
  };

  const exportToPDF = () => {
    alert('Export to PDF - Coming soon!');
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 rounded-2xl blur-xl" />
          <div className="relative flex items-center justify-between bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/panel-admin')}
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  View Reports
                </h1>
                <p className="text-neutral-400 text-sm mt-1">Analytics & Statistics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Filter */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="today">Today</option>
              </select>
              
              {/* Export Buttons */}
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm font-medium"
                title="Export to CSV"
              >
                📄 CSV
              </button>
              <button
                onClick={exportToPDF}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
                title="Export to PDF"
              >
                📕 PDF
              </button>
              
              <button
                onClick={fetchReports}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-700 hover:to-orange-800 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/20"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-12 border border-neutral-700/50">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mb-4" />
              <p className="text-neutral-400">Loading reports...</p>
            </div>
          </div>
        ) : reportData ? (
          <>
            {/* 1. Overview Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Overview Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-green-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-400">Total Revenue</h3>
                      <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold text-green-400 mb-1">
                      ${reportData.overview.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">Coming soon</p>
                  </div>
                </div>

                {/* Total Transactions */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-400">Transactions</h3>
                      <span className="text-2xl">🧾</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-400 mb-1">
                      {reportData.overview.totalTransactions.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">Coming soon</p>
                  </div>
                </div>

                {/* Active Users */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-400">Active Users</h3>
                      <span className="text-2xl">👥</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-400 mb-1">
                      {reportData.overview.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">Last 30 days</p>
                  </div>
                </div>

                {/* New Registrations */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-neutral-400">New Users</h3>
                      <span className="text-2xl">✨</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-400 mb-1">
                      {reportData.overview.newRegistrations.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500">This month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Video Analytics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Video Analytics
              </h2>

              {/* Video Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Total Videos */}
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Total Videos</h3>
                    <span className="text-xl">🎬</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-400">
                    {reportData.videoAnalytics.totalVideos.toLocaleString()}
                  </p>
                </div>

                {/* Average Duration */}
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Avg Duration</h3>
                    <span className="text-xl">⏱️</span>
                  </div>
                  <p className="text-3xl font-bold text-cyan-400">
                    {formatDuration(reportData.videoAnalytics.avgDuration)}
                  </p>
                </div>

                {/* Total Watch Time */}
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Total Watch Time</h3>
                    <span className="text-xl">📺</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    {formatWatchTime(reportData.videoAnalytics.totalWatchTime)}
                  </p>
                </div>

                {/* Categories */}
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Categories</h3>
                    <span className="text-xl">📁</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">
                    {Object.keys(reportData.videoAnalytics.videosByCategory).length}
                  </p>
                </div>
              </div>

              {/* Upload Trend */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold text-neutral-200 mb-4">Upload Trend (Last 6 Months)</h3>
                  <div className="flex items-end gap-4 h-48">
                    {reportData.videoAnalytics.uploadTrend.map((item, index) => {
                      const maxCount = Math.max(...reportData.videoAnalytics.uploadTrend.map(t => t.count), 1);
                      const height = (item.count / maxCount) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full flex items-end justify-center" style={{ height: '160px' }}>
                            <div 
                              className="w-full bg-gradient-to-t from-yellow-500 to-orange-500 rounded-t-lg transition-all duration-500 hover:from-yellow-400 hover:to-orange-400"
                              style={{ height: `${height}%`, minHeight: '20px' }}
                            >
                              <div className="flex items-start justify-center pt-2">
                                <span className="text-xs font-bold text-white">{item.count}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400 text-center">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Most Viewed & Most Liked Videos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Commented Videos */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 rounded-2xl blur-xl" />
                  <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <span>💬</span> Most Commented Videos
                    </h3>
                    <div className="space-y-3">
                      {reportData.videoAnalytics.mostCommentedVideos.slice(0, 5).map((video, index) => (
                        <div key={video.id} className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-colors">
                          <span className="text-2xl font-bold text-neutral-600 w-8">{index + 1}</span>
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-16 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-16 h-12 rounded bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                              <span className="text-xl">🎥</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{video.title}</p>
                            <p className="text-xs text-neutral-400">{video.creator}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-400">{(video.comments || 0).toLocaleString()}</p>
                            <p className="text-xs text-neutral-500">comments</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Most Liked Videos */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5 rounded-2xl blur-xl" />
                  <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                      <span>❤️</span> Most Liked Videos
                    </h3>
                    <div className="space-y-3">
                      {reportData.videoAnalytics.mostLikedVideos.slice(0, 5).map((video, index) => (
                        <div key={video.id} className="flex items-center gap-3 p-3 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-colors">
                          <span className="text-2xl font-bold text-neutral-600 w-8">{index + 1}</span>
                          {video.thumbnail ? (
                            <img src={video.thumbnail} alt={video.title} className="w-16 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-16 h-12 rounded bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                              <span className="text-xl">🎥</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{video.title}</p>
                            <p className="text-xs text-neutral-400">{video.creator}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-400">{(video.likes || 0).toLocaleString()}</p>
                            <p className="text-xs text-neutral-500">likes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Videos by Category */}
              <div className="relative mt-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold text-neutral-200 mb-4">Videos by Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Object.entries(reportData.videoAnalytics.videosByCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([category, count]) => (
                        <div key={category} className="bg-neutral-700/30 rounded-lg p-4 hover:bg-neutral-700/50 transition-colors">
                          <p className="text-sm text-neutral-400 mb-1">{category}</p>
                          <p className="text-2xl font-bold text-blue-400">{count}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. User Analytics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                User Analytics
              </h2>

              {/* User Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Total Users</h3>
                    <span className="text-xl">👥</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">
                    {reportData.userAnalytics.totalUsers.toLocaleString()}
                  </p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Active Users</h3>
                    <span className="text-xl">✅</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    {reportData.userAnalytics.activeUsers.toLocaleString()}
                  </p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Inactive Users</h3>
                    <span className="text-xl">💤</span>
                  </div>
                  <p className="text-3xl font-bold text-red-400">
                    {reportData.userAnalytics.inactiveUsers.toLocaleString()}
                  </p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Activity Rate</h3>
                    <span className="text-xl">📊</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">
                    {reportData.userAnalytics.totalUsers > 0 
                      ? Math.round((reportData.userAnalytics.activeUsers / reportData.userAnalytics.totalUsers) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold text-neutral-200 mb-4">User Growth (Last 6 Months)</h3>
                  <div className="flex items-end gap-4 h-48">
                    {reportData.userAnalytics.userGrowth.map((item, index) => {
                      const maxCount = Math.max(...reportData.userAnalytics.userGrowth.map(t => t.count), 1);
                      const height = (item.count / maxCount) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full flex items-end justify-center" style={{ height: '160px' }}>
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all duration-500 hover:from-blue-400 hover:to-purple-400"
                              style={{ height: `${height}%`, minHeight: '20px' }}
                            >
                              <div className="flex items-start justify-center pt-2">
                                <span className="text-xs font-bold text-white">{item.count}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-400 text-center">{item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Content Creators */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                    <span>🌟</span> Top Content Creators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.userAnalytics.topCreators.slice(0, 6).map((creator, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-colors">
                        <span className="text-2xl font-bold text-neutral-600 w-8">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{creator.username}</p>
                          <p className="text-xs text-neutral-400">{creator.videos} videos</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-yellow-400">{creator.followers.toLocaleString()}</p>
                          <p className="text-xs text-neutral-500">followers</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Financial Reports */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Financial Reports
              </h2>
              <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-8 border border-neutral-700/50 text-center">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-neutral-300 mb-2">Coming Soon</h3>
                <p className="text-neutral-500">Revenue tracking, transaction history, and payment analytics will be available soon.</p>
              </div>
            </div>

            {/* 5. Engagement Metrics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Engagement Metrics
              </h2>

              {/* Engagement Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Avg Likes/Video</h3>
                    <span className="text-xl">❤️</span>
                  </div>
                  <p className="text-3xl font-bold text-pink-400">
                    {reportData.engagementMetrics.avgLikesPerVideo.toFixed(1)}
                  </p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Avg Comments/Video</h3>
                    <span className="text-xl">💬</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    {reportData.engagementMetrics.avgCommentsPerVideo.toFixed(1)}
                  </p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Avg Shares/Video</h3>
                    <span className="text-xl">🔄</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">
                    {reportData.engagementMetrics.avgSharesPerVideo.toFixed(1)}
                  </p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Total Engagement</h3>
                    <span className="text-xl">🔥</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-400">
                    {reportData.engagementMetrics.totalEngagement.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Most Active Users */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 rounded-2xl blur-xl" />
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold text-neutral-200 mb-4 flex items-center gap-2">
                    <span>🚀</span> Most Active Users (by Engagement)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reportData.engagementMetrics.mostActiveUsers.slice(0, 6).map((user, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-colors">
                        <span className="text-2xl font-bold text-neutral-600 w-8">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{user.username}</p>
                          <p className="text-xs text-neutral-400">Engagement Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-400">{user.engagement.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Platform Health */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Platform Health
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Storage Usage</h3>
                    <span className="text-xl">💾</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400 mb-1">
                    {formatBytes(reportData.platformHealth.storageUsage)}
                  </p>
                  <p className="text-xs text-neutral-500">Placeholder data</p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Bandwidth Usage</h3>
                    <span className="text-xl">📡</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-400 mb-1">
                    {formatBytes(reportData.platformHealth.bandwidthUsage)}
                  </p>
                  <p className="text-xs text-neutral-500">Placeholder data</p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">Error Rate</h3>
                    <span className="text-xl">⚠️</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400 mb-1">
                    {reportData.platformHealth.errorRate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-neutral-500">Placeholder data</p>
                </div>

                <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-400">API Response Time</h3>
                    <span className="text-xl">⚡</span>
                  </div>
                  <p className="text-2xl font-bold text-green-400 mb-1">
                    {reportData.platformHealth.apiResponseTime}ms
                  </p>
                  <p className="text-xs text-neutral-500">Placeholder data</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
