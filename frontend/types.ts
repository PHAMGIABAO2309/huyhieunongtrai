
// types.ts
export interface CoinEntry {
  id: number;           // đổi từ string → number (vì MySQL auto_increment)
  so_xu: number;        // tên trường từ backend
  thoi_gian: string;    // tên trường từ backend
  created_at?: string;  // optional
}

export type RecordsMap = Record<string, CoinEntry[]>;  // date → YYYY-MM-DD

export interface DailyRecord {
  date: string; // ISO format or YYYY-MM-DD
  entries: CoinEntry[];
}



export interface AIScanResult {
  date: string;
  amount: number;
  time: string;
}
