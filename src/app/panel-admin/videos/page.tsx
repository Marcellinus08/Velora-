'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Creator {
  username: string | null;
  abstract_id: string;
  avatar_url: string | null;
}

interface Video {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  category: string;
  duration_seconds: number;
  video_path: string;
  video_url: string;
  thumb_path: string | null;
  thumb_url: string | null;
  abstract_id: string;
  price_cents: number;
  currency: string;
  tasks_json: any;
  points_total: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  points_buy_share: number;
  points_task_share: number;
  points_share_share: number;
  creator: Creator;
}

export default function ManageVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    price_cents: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuth) {
      router.push('/panel-admin');
      return;
    }

    fetchVideos();
  }, [router]);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/videos');
      const data = await response.json();

      if (data.success) {
        setVideos(data.videos);
      } else {
        setError('Failed to load videos');
      }
    } catch (err) {
      setError('Error fetching videos');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = videos.filter((video) => {
    const query = searchQuery.toLowerCase();
    return (
      video.title?.toLowerCase().includes(query) ||
      video.creator?.username?.toLowerCase().includes(query) ||
      video.category?.toLowerCase().includes(query)
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (cents: number, currency: string) => {
    const amount = (cents / 100).toFixed(2);
    return `${currency} ${amount}`;
  };

  const handleEdit = (video: Video) => {
    setSelectedVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || '',
      category: video.category,
      price_cents: video.price_cents,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (video: Video) => {
    setSelectedVideo(video);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateVideo = async () => {
    if (!selectedVideo) return;

    try {
      const response = await fetch('/api/admin/videos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVideo.id,
          ...editForm,
        }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchVideos();
        setIsEditModalOpen(false);
        setSelectedVideo(null);
      } else {
        setError('Failed to update video');
      }
    } catch (err) {
      setError('Error updating video');
      console.error(err);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;

    try {
      const response = await fetch(`/api/admin/videos?id=${selectedVideo.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchVideos();
        setIsDeleteModalOpen(false);
        setSelectedVideo(null);
      } else {
        setError('Failed to delete video');
      }
    } catch (err) {
      setError('Error deleting video');
      console.error(err);
    }
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
                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <span className="text-2xl">←</span>
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Manage Videos
                </h1>
                <p className="text-neutral-400 text-sm mt-1">Total: {videos.length} videos</p>
              </div>
            </div>
            <button
              onClick={fetchVideos}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-500/20"
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
              placeholder="Search by title, creator, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
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
              <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4" />
              <p className="text-neutral-400">Loading videos...</p>
            </div>
          </div>
        ) : (
          /* Videos Table */
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 rounded-2xl blur-xl" />
            <div className="relative bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                  <thead className="bg-neutral-800/80 border-b border-neutral-700/50">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-16">No</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-28">Thumbnail</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-52">Title</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-32">Creator</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-32">Category</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-24">Duration</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-28">Price</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-neutral-300 w-20">Likes</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-neutral-300 w-20">Shares</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-neutral-300 w-24">Comments</th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-neutral-300 w-36">Created</th>
                      <th className="px-4 py-4 text-center text-sm font-semibold text-neutral-300 w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVideos.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <span className="text-4xl mb-2">🎬</span>
                            <p className="text-neutral-500">No videos found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredVideos.map((video, index) => (
                        <tr
                          key={video.id}
                          className="hover:bg-neutral-700/20 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <div className="text-neutral-400 font-medium text-center">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center overflow-hidden border border-neutral-700/50">
                              {video.thumb_url ? (
                                <img
                                  src={video.thumb_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">🎥</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-white truncate">
                              {video.title}
                            </div>
                            {video.description && (
                              <div className="text-xs text-neutral-500 truncate mt-0.5">
                                {video.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-neutral-300 truncate">
                              {video.creator?.username || (
                                <span className="text-neutral-500 italic text-xs">
                                  {video.abstract_id.slice(0, 6)}...{video.abstract_id.slice(-4)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="inline-block px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30 whitespace-nowrap truncate max-w-full">
                              {video.category}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-neutral-400 font-mono text-sm whitespace-nowrap">
                              {formatDuration(video.duration_seconds)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-yellow-400 font-medium text-sm whitespace-nowrap">
                              {formatPrice(video.price_cents, video.currency)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-pink-400 font-medium text-center">
                              {video.likes_count}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-blue-400 font-medium text-center">
                              {video.shares_count}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-green-400 font-medium text-center">
                              {video.comments_count}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-neutral-400 whitespace-nowrap">
                              {formatDate(video.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEdit(video)}
                                className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors border border-blue-500/30 text-xs font-medium whitespace-nowrap"
                                title="Edit video"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => handleDelete(video)}
                                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/30 text-xs font-medium whitespace-nowrap"
                                title="Delete video"
                              >
                                🗑️ Delete
                              </button>
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

        {/* Edit Modal */}
        {isEditModalOpen && selectedVideo && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-neutral-800 rounded-2xl max-w-2xl w-full border border-neutral-700/50 shadow-2xl">
              <div className="p-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
                  Edit Video
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Category
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer [&>option]:bg-neutral-800 [&>option]:text-white [&>option:checked]:bg-blue-600 [&>option:hover]:bg-neutral-700"
                      >
                        <option value="Technology" className="bg-neutral-800 text-white py-2">Technology</option>
                        <option value="Gaming" className="bg-neutral-800 text-white py-2">Gaming</option>
                        <option value="Education" className="bg-neutral-800 text-white py-2">Education</option>
                        <option value="Entertainment" className="bg-neutral-800 text-white py-2">Entertainment</option>
                        <option value="Music" className="bg-neutral-800 text-white py-2">Music</option>
                        <option value="Sports" className="bg-neutral-800 text-white py-2">Sports</option>
                        <option value="Travel" className="bg-neutral-800 text-white py-2">Travel</option>
                        <option value="Food" className="bg-neutral-800 text-white py-2">Food</option>
                        <option value="Cooking" className="bg-neutral-800 text-white py-2">Cooking</option>
                        <option value="Fashion" className="bg-neutral-800 text-white py-2">Fashion</option>
                        <option value="Health" className="bg-neutral-800 text-white py-2">Health</option>
                        <option value="Fitness" className="bg-neutral-800 text-white py-2">Fitness</option>
                        <option value="Business" className="bg-neutral-800 text-white py-2">Business</option>
                        <option value="Finance" className="bg-neutral-800 text-white py-2">Finance</option>
                        <option value="Art" className="bg-neutral-800 text-white py-2">Art</option>
                        <option value="Photography" className="bg-neutral-800 text-white py-2">Photography</option>
                        <option value="Science" className="bg-neutral-800 text-white py-2">Science</option>
                        <option value="News" className="bg-neutral-800 text-white py-2">News</option>
                        <option value="Comedy" className="bg-neutral-800 text-white py-2">Comedy</option>
                        <option value="Vlog" className="bg-neutral-800 text-white py-2">Vlog</option>
                        <option value="Other" className="bg-neutral-800 text-white py-2">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Price (cents)
                      </label>
                      <input
                        type="number"
                        value={editForm.price_cents}
                        onChange={(e) => setEditForm({ ...editForm, price_cents: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateVideo}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setSelectedVideo(null);
                    }}
                    className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedVideo && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-neutral-800 rounded-2xl max-w-md w-full border border-neutral-700/50 shadow-2xl">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    <span className="text-4xl">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Delete Video?
                  </h2>
                  <p className="text-neutral-400">
                    Are you sure you want to delete "{selectedVideo.title}"? This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteVideo}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/20"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedVideo(null);
                    }}
                    className="flex-1 px-4 py-3 bg-neutral-700 hover:bg-neutral-600 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
