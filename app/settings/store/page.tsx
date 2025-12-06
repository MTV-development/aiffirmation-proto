'use client';

import { useEffect, useState } from 'react';
import { supabase, type KVStoreRow } from '@/lib/supabase/client';

type CheckStatus = 'pending' | 'running' | 'pass' | 'fail';

type DiagnosticCheck = {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  message?: string;
};

const initialChecks: DiagnosticCheck[] = [
  {
    id: 'env',
    name: 'Environment Variables',
    description: 'Check if NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set',
    status: 'pending',
  },
  {
    id: 'client',
    name: 'Supabase Client',
    description: 'Create Supabase client instance',
    status: 'pending',
  },
  {
    id: 'connection',
    name: 'Network Connection',
    description: 'Test connectivity to Supabase server',
    status: 'pending',
  },
  {
    id: 'auth',
    name: 'API Key Valid',
    description: 'Verify the anon key is accepted',
    status: 'pending',
  },
  {
    id: 'table',
    name: 'Table Exists',
    description: 'Check if kv_store table exists',
    status: 'pending',
  },
  {
    id: 'query',
    name: 'Data Query',
    description: 'Fetch rows from kv_store table',
    status: 'pending',
  },
];

export default function StorePage() {
  const [checks, setChecks] = useState<DiagnosticCheck[]>(initialChecks);
  const [entries, setEntries] = useState<KVStoreRow[]>([]);
  const [allPassed, setAllPassed] = useState(false);

  const updateCheck = (id: string, status: CheckStatus, message?: string) => {
    setChecks((prev) =>
      prev.map((check) =>
        check.id === id ? { ...check, status, message } : check
      )
    );
  };

  useEffect(() => {
    runDiagnostics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runDiagnostics() {
    // Check 1: Environment Variables
    updateCheck('env', 'running');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      updateCheck('env', 'fail', `Missing: ${!url ? 'SUPABASE_URL' : ''} ${!key ? 'ANON_KEY' : ''}`);
      return;
    }
    updateCheck('env', 'pass', `URL: ${url.substring(0, 30)}...`);

    // Check 2: Client Creation
    updateCheck('client', 'running');
    try {
      if (!supabase) throw new Error('Client is null');
      updateCheck('client', 'pass', 'Client created successfully');
    } catch (err) {
      updateCheck('client', 'fail', `Failed: ${err}`);
      return;
    }

    // Check 3: Network Connection + Check 4: API Key Validation
    // We test both together by making a real Supabase request
    updateCheck('connection', 'running');
    updateCheck('auth', 'running');
    try {
      const { error: testError } = await supabase.from('_dummy_').select('*').limit(1);
      // Check for network/connection errors
      if (testError?.message?.includes('Failed to fetch') ||
          testError?.message?.includes('NetworkError') ||
          testError?.message?.includes('ENOTFOUND')) {
        updateCheck('connection', 'fail', `Network error: ${testError.message}`);
        return;
      }
      updateCheck('connection', 'pass', 'Connected to Supabase');

      // Check for API key errors
      if (testError?.message?.includes('Invalid API key') ||
          testError?.message?.includes('JWT') ||
          testError?.code === 'PGRST301') {
        updateCheck('auth', 'fail', `Invalid API key: ${testError.message}`);
        return;
      }
      // "relation does not exist" means connection and auth worked, table just doesn't exist
      updateCheck('auth', 'pass', 'API key accepted');
    } catch (err) {
      updateCheck('connection', 'fail', `Connection error: ${err}`);
      return;
    }

    // Check 5: Table Existence
    updateCheck('table', 'running');
    const { error: tableError } = await supabase.from('kv_store').select('id').limit(1);
    if (tableError?.message?.includes('does not exist') ||
        tableError?.message?.includes('relation') ||
        tableError?.code === '42P01') {
      updateCheck('table', 'fail', 'Table kv_store not found. Run: npm run db:push');
      return;
    }
    updateCheck('table', 'pass', 'Table kv_store exists');

    // Check 6: Data Query
    updateCheck('query', 'running');
    const { data, error: queryError } = await supabase
      .from('kv_store')
      .select('*')
      .order('key');

    if (queryError) {
      updateCheck('query', 'fail', `Query failed: ${queryError.message}`);
      return;
    }

    const rowCount = data?.length ?? 0;
    updateCheck('query', 'pass', `Found ${rowCount} entries`);
    setEntries(data ?? []);
    setAllPassed(true);
  }

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'pending': return '○';
      case 'running': return '◐';
      case 'pass': return '●';
      case 'fail': return '✕';
    }
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'pending': return 'text-gray-400';
      case 'running': return 'text-blue-500';
      case 'pass': return 'text-green-500';
      case 'fail': return 'text-red-500';
    }
  };

  const passedCount = checks.filter((c) => c.status === 'pass').length;
  const totalCount = checks.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supabase Integration Status</h1>
        <p className="text-gray-500 mt-1">
          Diagnostic checks for database connectivity and KV Store
        </p>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Integration Progress</span>
          <span className={allPassed ? 'text-green-500' : 'text-gray-500'}>
            {passedCount}/{totalCount} checks passed
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              allPassed ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(passedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Diagnostic Checks */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium w-12">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Check</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {checks.map((check) => (
              <tr key={check.id}>
                <td className={`px-4 py-3 text-xl ${getStatusColor(check.status)}`}>
                  {getStatusIcon(check.status)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-gray-500">{check.description}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {check.message && (
                    <code className={`text-xs ${getStatusColor(check.status)}`}>
                      {check.message}
                    </code>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* KV Store Data (only shown when all checks pass) */}
      {allPassed && (
        <>
          <h2 className="text-xl font-bold mt-8">Key-Value Store Contents</h2>

          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              No entries in the store. Run <code>npm run db:seed</code> to add demo data.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Key</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-mono text-sm">{entry.key}</td>
                      <td className="px-4 py-3">
                        <pre className="text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto max-w-md">
                          {JSON.stringify(entry.value, null, 2)}
                        </pre>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(entry.updated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Help section when checks fail */}
      {!allPassed && checks.some((c) => c.status === 'fail') && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
            How to Fix
          </h3>
          <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            {checks.find((c) => c.id === 'env' && c.status === 'fail') && (
              <li>• Create <code>.env.local</code> with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            )}
            {checks.find((c) => c.id === 'connection' && c.status === 'fail') && (
              <li>• Check your internet connection and verify the Supabase URL is correct</li>
            )}
            {checks.find((c) => c.id === 'auth' && c.status === 'fail') && (
              <li>• Verify your anon key is copied correctly from Supabase dashboard</li>
            )}
            {checks.find((c) => c.id === 'table' && c.status === 'fail') && (
              <li>• Run <code>npm run db:push</code> to create the kv_store table</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
