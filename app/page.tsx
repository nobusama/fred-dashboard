'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchFredData, aggregateMonthlyData } from '@/lib/fred';

interface ChartData {
  date: string;
  value: number;
}

export default function Home() {
  const [cpiData, setCpiData] = useState<ChartData[]>([]);
  const [unemploymentData, setUnemploymentData] = useState<ChartData[]>([]);
  const [treasury10YData, setTreasury10YData] = useState<ChartData[]>([]);
  const [treasury3MData, setTreasury3MData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 並列でデータを取得
        const [cpi, unemployment, treasury10Y, treasury3M] = await Promise.all([
          fetchFredData('CPIAUCSL', 100),
          fetchFredData('UNRATE', 100),
          fetchFredData('DGS10', 100),
          fetchFredData('DGS3MO', 100),
        ]);

        // 月次データに集約
        setCpiData(aggregateMonthlyData(cpi, 24));
        setUnemploymentData(aggregateMonthlyData(unemployment, 24));
        setTreasury10YData(aggregateMonthlyData(treasury10Y, 24));
        setTreasury3MData(aggregateMonthlyData(treasury3M, 24));

      } catch (error) {
        console.error('Error loading FRED data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading economic data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">FRED Indicators</h1>
          <p className="text-sm text-gray-500">Economic Data Dashboard</p>
        </div>

        <nav className="space-y-1">
          <button className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Key Indicators
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {['Inflation', 'Employment', 'Interest Rates', 'Economic Growth', 'Exchange Rates', 'Housing', 'Consumer Spending'].map((item) => (
            <button key={item} className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {item}
              </div>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </nav>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Economic Indicators Dashboard</h1>
            <p className="text-gray-600">Real-time economic data from the Federal Reserve Economic Data (FRED) system</p>
          </div>

          {/* グラフグリッド */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPI チャート */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Consumer Price Index (CPI)</h2>
                <p className="text-sm text-gray-500">FRED All Urban Consumers: All Items (CPIAUCSL)</p>
              </div>
              {cpiData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={cpiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No data available</div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Last Updated: {new Date().toLocaleDateString()}
                <a href={`https://fred.stlouisfed.org/series/CPIAUCSL`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                  View Details →
                </a>
              </p>
            </div>

            {/* Unemployment チャート */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Unemployment Rate</h2>
                <p className="text-sm text-gray-500">FRED Civilian Unemployment Rate (UNRATE)</p>
              </div>
              {unemploymentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={unemploymentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fill="#86efac" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No data available</div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Last Updated: {new Date().toLocaleDateString()}
                <a href={`https://fred.stlouisfed.org/series/UNRATE`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                  View Details →
                </a>
              </p>
            </div>

            {/* 10-Year Treasury チャート */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">10-Year Treasury Yield</h2>
                <p className="text-sm text-gray-500">FRED Market Yield on U.S. Treasury Securities (DGS10)</p>
              </div>
              {treasury10YData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={treasury10YData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No data available</div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Last Updated: {new Date().toLocaleDateString()}
                <a href={`https://fred.stlouisfed.org/series/DGS10`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                  View Details →
                </a>
              </p>
            </div>

            {/* 3-Month Treasury チャート */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">3-Month Treasury Yield</h2>
                <p className="text-sm text-gray-500">FRED Market Yield on U.S. Treasury Securities (DGS3MO)</p>
              </div>
              {treasury3MData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={treasury3MData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">No data available</div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Last Updated: {new Date().toLocaleDateString()}
                <a href={`https://fred.stlouisfed.org/series/DGS3MO`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                  View Details →
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
