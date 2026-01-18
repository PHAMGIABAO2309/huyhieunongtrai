import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Trash2, Clock, FileSpreadsheet, Calculator, History 
} from 'lucide-react';
import { RecordsMap, CoinEntry } from './types';
import { formatXU, getTodayStr, formatTime, evaluateAmount } from './utils/formatters';

const API_BASE = 'http://localhost:5000/api';

const App: React.FC = () => {
  const [records, setRecords] = useState<RecordsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [amountInput, setAmountInput] = useState('');
  const [newTime, setNewTime] = useState(formatTime(new Date()));

  // Tải dữ liệu từ backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/hanhtrinh`);
        if (!res.ok) {
          throw new Error(`Lỗi HTTP ${res.status}: ${await res.text()}`);
        }
        const data = await res.json() as RecordsMap;
        setRecords(data);
      } catch (err: any) {
        console.error('Lỗi tải dữ liệu:', err);
        setError('Không kết nối được với backend. Kiểm tra server có đang chạy không?');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Tính tổng xu toàn bộ
  const totalXu = useMemo(() => {
    return Object.values(records)
      .flat()
      .reduce((sum, entry) => sum + entry.so_xu, 0);
  }, [records]);

  // Sắp xếp ngày từ mới nhất → cũ nhất (dùng Date để chính xác)
  const sortedDates = useMemo(() => {
    return Object.keys(records).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [records]);

  // Thêm lượt mới
  const handleAddEntry = useCallback(async () => {
    const amount = evaluateAmount(amountInput);
    if (amount <= 0 || isSaving) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE}/luot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngay: selectedDate,
          so_xu: amount,
          thoi_gian: newTime.trim() || formatTime(new Date()),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Lỗi ${res.status}`);
      }

      setAmountInput('');
      setNewTime(formatTime(new Date()));

      // Tải lại dữ liệu
      const refreshed = await fetch(`${API_BASE}/hanhtrinh`).then(r => r.json());
      setRecords(refreshed);
    } catch (err: any) {
      alert(`Không lưu được: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [amountInput, newTime, selectedDate, isSaving]);

  // Xóa lượt
  const handleDeleteEntry = async (id: number) => {
    if (!confirm('Xác nhận xóa lượt này?')) return;
    try {
      const res = await fetch(`${API_BASE}/luot/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');

      const refreshed = await fetch(`${API_BASE}/hanhtrinh`).then(r => r.json());
      setRecords(refreshed);
    } catch (err: any) {
      alert(`Lỗi khi xóa: ${err.message}`);
    }
  };

  const getTimeColor = (timeStr: string) => {
  const hourMatch = timeStr.match(/(\d{1,2})h/);
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  return hour >= 18 ? 'text-red-600' : 'text-emerald-600';
};


  const currentPreview = useMemo(() => evaluateAmount(amountInput), [amountInput]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-semibold text-slate-600 animate-pulse">
          Đang tải dữ liệu từ MySQL...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-300 rounded-2xl p-8 text-center max-w-md">
          <p className="text-xl font-bold text-red-700 mb-4">Có lỗi xảy ra</p>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Thử tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white border-b-4 border-yellow-400 p-6 sticky top-0 z-20 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
              <FileSpreadsheet size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">HÀNH TRÌNH HUY HIỆU VÀNG</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-0.5 rounded uppercase tracking-widest">XU NÔNG TRẠI</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">• Dữ liệu lưu trên MySQL</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-400 border-4 border-yellow-500 rounded-none p-4 min-w-[320px] text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] transition-transform hover:scale-105">
            <div className="text-[12px] font-black uppercase text-yellow-900 opacity-70 mb-1 tracking-tighter">TỔNG XU TẤT CẢ</div>
            <div className="text-5xl font-black text-red-600 tabular-nums drop-shadow-sm">
              {formatXU(totalXu)} <span className="text-xl">XU</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form nhập liệu */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[160px]">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
            
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg shadow-sm">
                <Plus size={20} className="text-yellow-900" />
              </div>
              NHẬP LƯỢT MỚI
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Ngày tháng</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold text-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Số Xu (Ví dụ: 434 515)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="12907 hoặc 434 515"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isSaving && handleAddEntry()}
                    className="w-full pl-5 pr-14 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all font-black text-2xl text-slate-800 placeholder:text-slate-300"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                    <Calculator size={22} />
                  </div>
                </div>
                {amountInput && (
                  <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <span className="text-xs text-emerald-600 font-bold italic">Tự động tính:</span>
                    <span className="text-lg font-black text-emerald-700 tabular-nums">
                      {formatXU(currentPreview)} <span className="text-xs font-black">xu</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Thời gian ghi nhận</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Lúc 19h50p"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full pl-5 pr-14 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold text-slate-600"
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleAddEntry}
                disabled={isSaving || !amountInput.trim()}
                className={`w-full py-5 font-black rounded-2xl transition-all shadow-xl shadow-yellow-200 flex items-center justify-center gap-3 mt-4 uppercase tracking-tight active:scale-95 ${
                  isSaving 
                    ? 'bg-yellow-300 text-yellow-800 cursor-wait' 
                    : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                }`}
              >
                {isSaving ? 'Đang lưu...' : (
                  <>
                    <Plus size={24} strokeWidth={3} />
                    LƯU VÀO NHẬT KÝ
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            <div className="relative z-10">
              <h4 className="font-black text-yellow-400 uppercase tracking-widest mb-3 text-xs flex items-center gap-2">
                <Calculator size={14} /> CÔNG THỨC NHANH
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Nhập <span className="text-yellow-400 font-black">12907</span> hoặc <span className="text-yellow-400 font-black">434 515</span> → tự động thành <span className="text-white font-black">12.907.000 xu</span> hoặc <span className="text-white font-black">949.000 xu</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Nhật ký thu hoạch - sắp xếp mới nhất trên cùng */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-white overflow-hidden">
            <div className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-slate-400">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">NHẬT KÝ THU HOẠCH</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Từ mới nhất đến cũ nhất</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-slate-100 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  {sortedDates.length} Ngày ghi nhận
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/30">
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng thu ngày</th>
                    <th className="px-10 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết lượt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedDates.map((date) => {
                    const entries = records[date] || [];
                    const dayTotal = entries.reduce((s, e) => s + e.so_xu, 0);
                    const formattedDate = new Date(date).toLocaleDateString('vi-VN', { 
                      day: '2-digit', month: '2-digit', year: 'numeric' 
                    });
                    
                    return (
                      <tr key={date} className="hover:bg-yellow-50/20 transition-colors group">
                        <td className="px-10 py-8 whitespace-nowrap align-top">
                          <span className="inline-block px-4 py-1.5 bg-yellow-400 text-yellow-900 font-black rounded-xl text-sm shadow-sm group-hover:scale-110 transition-transform">
                            {formattedDate}
                          </span>
                        </td>
                        <td className="px-10 py-8 whitespace-nowrap align-top">
                          <span className="text-3xl font-black text-slate-800 tabular-nums">
                            {formatXU(dayTotal)} <span className="text-sm font-black text-slate-400">xu</span>
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-wrap gap-3">
                            {entries.map((entry) => (
                              <div 
                                key={entry.id}
                                className="group/item relative bg-white border-2 border-slate-100 pl-4 pr-2 py-3 rounded-[1.25rem] flex items-center gap-4 hover:border-yellow-400 hover:shadow-xl transition-all"
                              >
                                <div className="flex flex-col">
                                  <span className="text-base font-black text-slate-700 tabular-nums leading-tight">
                                    {formatXU(entry.so_xu)} <span className="text-xs">xu</span>
                                  </span>
                                  <span className={`text-[10px] ${getTimeColor(entry.thoi_gian)} font-black uppercase tracking-wider`}>
  {entry.thoi_gian}
</span>
                                </div>
                                <button 
                                  onClick={() => handleDeleteEntry(entry.id)}
                                  className="w-9 h-9 flex items-center justify-center text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                  title="Xóa lượt này"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {sortedDates.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-10 py-40 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 border-2 border-dashed border-slate-200">
                            <History size={48} />
                          </div>
                          <div className="space-y-2">
                            <p className="text-slate-500 font-black uppercase tracking-wider text-sm">Chưa có dữ liệu hành trình</p>
                            <p className="text-slate-400 text-xs font-medium italic">Nhập lượt mới để bắt đầu hành trình</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;