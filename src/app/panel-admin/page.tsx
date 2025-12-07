'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanelPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalVideos, setTotalVideos] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        setError('Password salah. Silakan coba lagi.');
        setPassword('');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setPassword('');
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    setIsAuthenticated(isAuth);
    
    // Fetch stats if authenticated
    if (isAuth) {
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setTotalUsers(usersData.users.length);
      }

      // Fetch videos
      const videosResponse = await fetch('/api/admin/videos');
      const videosData = await videosResponse.json();
      if (videosData.success) {
        setTotalVideos(videosData.videos.length);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white relative overflow-hidden pt-0">
        {/* Background decorative elements - matching home page */}
        <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>

        <div className="relative container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Header with gradient effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl blur-xl" />
            <div className="relative flex justify-between items-center bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-neutral-400 text-sm mt-1">Glonic Management Dashboard</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-500/20 font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Dashboard Stats Cards with gradient hover */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1: User Stats */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-200">Total Users</h2>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                {isLoadingStats ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-3 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-blue-400 mb-2">
                      {totalUsers !== null ? totalUsers.toLocaleString() : '--'}
                    </p>
                    <p className="text-neutral-500 text-sm">Registered users</p>
                  </>
                )}
              </div>
            </div>

            {/* Card 2: Video Stats */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-green-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-200">Total Videos</h2>
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                </div>
                {isLoadingStats ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-3 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-green-400 mb-2">
                      {totalVideos !== null ? totalVideos.toLocaleString() : '--'}
                    </p>
                    <p className="text-neutral-500 text-sm">Uploaded videos</p>
                  </>
                )}
              </div>
            </div>

            {/* Card 3: Revenue */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-200">Total Revenue</h2>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
                <p className="text-4xl font-bold text-purple-400 mb-2">--</p>
                <p className="text-neutral-500 text-sm">Coming soon</p>
              </div>
            </div>
          </div>

          {/* Admin Actions Section */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/20 via-purple-500/10 to-neutral-800/20 rounded-2xl opacity-50 blur-xl" />
            <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Admin Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => router.push('/panel-admin/users')}
                  className="group relative px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <span className="font-medium">Manage Users</span>
                  </div>
                </button>
                <button 
                  onClick={() => router.push('/panel-admin/videos')}
                  className="group relative px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/20 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-3">
                    <span className="text-2xl">🎥</span>
                    <span className="font-medium">Manage Videos</span>
                  </div>
                </button>
                <button 
                  onClick={() => router.push('/panel-admin/reports')}
                  className="group relative px-6 py-4 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <span className="font-medium">View Reports</span>
                  </div>
                </button>
                <button className="group relative px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/20 text-left overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="relative flex items-center gap-3">
                    <span className="text-2xl">⚙️</span>
                    <span className="font-medium">System Settings</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
              <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Recent Activity
              </h2>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-700/50 flex items-center justify-center mb-4">
                  <span className="text-3xl opacity-50">📋</span>
                </div>
                <p className="text-neutral-500">No recent activity to display.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="fixed bottom-8 right-8 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none hover:pointer-events-auto">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
          </div>
        </div>
      </div>
    );
  }

  // Login Form with matching design
  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
      </div>

      <div className="max-w-md w-full relative">
        {/* Glow effect behind card */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur-2xl opacity-50" />
        
        <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-neutral-700/50">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-purple-500/20">
                <span className="text-3xl">🔒</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Admin Panel
            </h1>
            <p className="text-neutral-400">Enter password to access admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-neutral-400 hover:text-white transition-colors duration-300 text-sm inline-flex items-center gap-2"
            >
              <span>←</span> Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
