/**
 * FRED API からデータを取得するユーティリティ関数
 */

// デバッグ用
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FRED_API_KEY) {
  console.log('FRED API Key configured:', process.env.NEXT_PUBLIC_FRED_API_KEY.substring(0, 4) + '...');
}

export interface FredDataPoint {
  date: string;
  value: number;
}

/**
 * FRED APIから特定のシリーズのデータを取得
 * @param seriesId FRED シリーズID（例: 'CPIAUCSL', 'UNRATE'）
 * @param limit 取得するデータポイント数（デフォルト: 100）
 * @returns データポイントの配列
 */
export async function fetchFredData(
  seriesId: string,
  limit: number = 100
): Promise<FredDataPoint[]> {
  try {
    // 自分のAPI Routeを呼び出す（CORS問題を回避）
    const url = `/api/fred?series_id=${seriesId}&limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // データを整形して返す
    const observations = data.observations || [];

    return observations
      .filter((obs: any) => obs.value !== '.')  // 欠損値を除外
      .map((obs: any) => ({
        date: obs.date,
        value: parseFloat(obs.value)
      }))
      .reverse();  // 古い順に並び替え

  } catch (error) {
    console.error(`Error fetching FRED data for ${seriesId}:`, error);
    return [];
  }
}

/**
 * グラフ表示用に日付をフォーマット
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns フォーマットされた日付（例: "Jan 23"）
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear().toString().slice(-2);
  return `${month} ${year}`;
}

/**
 * データを月次データに集約（最新12ヶ月分）
 * @param data データポイント配列
 * @param months 取得する月数（デフォルト: 24）
 * @returns 月次データ
 */
export function aggregateMonthlyData(
  data: FredDataPoint[],
  months: number = 24
): Array<{ date: string; value: number }> {
  // 月ごとにグループ化
  const monthlyMap = new Map<string, number>();

  data.forEach(point => {
    const yearMonth = point.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(yearMonth)) {
      monthlyMap.set(yearMonth, point.value);
    }
  });

  // 最新N ヶ月分を取得
  const sortedMonths = Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-months);

  return sortedMonths.map(([yearMonth, value]) => ({
    date: formatDate(yearMonth + '-01'),
    value
  }));
}
