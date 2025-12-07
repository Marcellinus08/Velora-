'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AbstractProfile } from '@/components/abstract-profile';

interface Profile {
  id: string;
  abstract_id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_path: string | null;
  followers_count: number;
  following_count: number;
  updated_at: string;
  created_at: string;
}

// Custom Avatar Component that prioritizes database avatar
const UserAvatar = ({ user }: { user: Profile }) => {
  const [imgError, setImgError] = useState(false);
  const getAbstractAvatar = (address: string) => {
    return `https://abstract-assets.abs.xyz/avatars/${address.toLowerCase()}.png`;
  };

  // If user has avatar_url in database and no error, use it
  if (user.avatar_url && !imgError) {
    return (
      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-neutral-700/50">
        <img
          src={user.avatar_url}
          alt={user.username || 'User'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback to Abstract Profile
  return (
    <AbstractProfile
      address={user.abstract_id as `0x${string}`}
      size="sm"
      showTooltip={false}
      ring={true}
    />
  );
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuth) {
      router.push('/panel-admin');
      return;
    }

    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.abstract_id?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl blur-xl" />
          <div className="relative flex items-center justify-between bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/panel-admin')}
                className="p-2 hover:bg-neutral-700/50 rounded-lg transition-colors"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Manage Users
                </h1>
                <p className="text-neutral-400 text-sm mt-1">Total: {users.length} users</p>
              </div>
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/20 via-purple-500/10 to-neutral-800/20 rounded-xl blur-xl" />
          <div className="relative">
            <input
              type="text"
              placeholder="Search by username or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm"
            />
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
              <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
              <p className="text-neutral-400">Loading users...</p>
            </div>
          </div>
        ) : (
          /* Users Table */
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-800/80 border-b border-neutral-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">Avatar</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">Username</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">Abstract ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">Followers</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">Following</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-300">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700/30">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl mb-2">👤</span>
                            <p className="text-neutral-500">No users found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className="hover:bg-neutral-700/20 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="text-neutral-400 font-medium">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <UserAvatar user={user} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-white">
                              {user.username || <span className="text-neutral-500 italic">No username</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm text-neutral-400">
                              {user.abstract_id.slice(0, 6)}...{user.abstract_id.slice(-4)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-blue-400 font-medium">
                              {user.followers_count}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-green-400 font-medium">
                              {user.following_count}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-neutral-400">
                              {formatDate(user.created_at)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
