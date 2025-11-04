'use client';

import { useAccount } from 'wagmi';
import { createClient } from '@/lib/supabase';
import { useState } from 'react';

export default function NotificationDebugPage() {
  const { address } = useAccount();
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDebug = async () => {
    if (!address) {
      alert('Please connect wallet first');
      return;
    }

    setLoading(true);
    try {
      const addr = address.toLowerCase();
      console.log('[DebugPage] Testing with address:', addr);

      // Test admin endpoint
      const res = await fetch(`/api/notifications/debug?addr=${addr}`);
      const data = await res.json();
      setDebugData(data);
      console.log('[DebugPage] Response:', data);

      // Also test direct query
      const supabase = createClient();
      const { data: directData, error: directError } = await supabase
        .from('notification_video_purchases')
        .select('*')
        .eq('creator_addr', addr)
        .order('created_at', { ascending: false });

      console.log('[DebugPage] Direct query:');
      console.log('  Error:', directError);
      console.log('  Data:', directData);
      console.log('  Count:', directData?.length || 0);

      setDebugData((prev: any) => ({
        ...prev,
        directQuery: { error: directError, data: directData },
      }));
    } catch (e) {
      console.error('[DebugPage] Error:', e);
      setDebugData({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full grow flex-row pb-16 md:pb-0">
      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8 p-4 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🐛 Notification Debug</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="font-semibold">Current Address:</p>
        <code className="bg-white p-2 rounded block mt-2 break-all">
          {address || 'Not connected'}
        </code>
      </div>

      <button
        onClick={testDebug}
        disabled={loading || !address}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
      >
        {loading ? 'Loading...' : 'Test Notifications'}
      </button>

      {debugData && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded border-l-4 border-blue-500">
            <p className="font-semibold mb-2">Admin Endpoint Result:</p>
            <pre className="bg-white p-3 rounded overflow-auto text-sm">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </div>

          {debugData.directQuery && (
            <div className="bg-gray-50 p-4 rounded border-l-4 border-green-500">
              <p className="font-semibold mb-2">Direct Query Result:</p>
              <p className="text-sm mb-2">
                Count: <strong>{debugData.directQuery.data?.length || 0}</strong>
              </p>
              {debugData.directQuery.error && (
                <p className="text-red-600 text-sm mb-2">
                  Error: {debugData.directQuery.error.message}
                </p>
              )}
              <pre className="bg-white p-3 rounded overflow-auto text-sm">
                {JSON.stringify(debugData.directQuery.data, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <p className="font-semibold mb-2">📋 Interpretation:</p>
            <ul className="text-sm space-y-1">
              <li>
                ✓ Admin endpoint count = {debugData.count || 0}
                {debugData.count > 0
                  ? ' (Data exists in DB)'
                  : ' (No data - check purchase API)'}
              </li>
              <li>
                ✓ Direct query count = {debugData.directQuery?.data?.length || 0}
                {debugData.directQuery?.data?.length > 0
                  ? ' (RLS allows access)'
                  : ' (RLS blocking access)'}
              </li>
              {debugData.count > 0 && debugData.directQuery?.data?.length === 0 && (
                <li className="text-red-600 font-semibold">
                  ⚠️ RLS POLICY BLOCKING ACCESS - Need to fix LOWER() in policies
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 pt-4 border-t">
        <h2 className="font-semibold mb-2">Browser Console Output:</h2>
        <p className="text-sm text-gray-600">
          Open DevTools (F12) → Console tab to see detailed logs including:
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
          <li>[useNotifications] Video Purchases: X</li>
          <li>[DebugPage] Direct query results</li>
          <li>Any errors from fetch</li>
        </ul>
      </div>
      </main>
    </div>
  );
}
