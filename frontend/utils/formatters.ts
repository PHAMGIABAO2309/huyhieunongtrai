
export const formatXU = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export const parseXU = (str: string): number => {
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
};

export const getTodayStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}h${m}p`;
};

/**
 * Evaluates a string like "434 515" or "434 + 515".
 * Treats spaces and plus signs as addition.
 * If the resulting sum is < 10,000, it multiplies by 1,000 (shorthand conversion).
 */
export const evaluateAmount = (input: string): number => {
  if (!input) return 0;
  try {
    // Loại bỏ dấu phẩy, chữ 'xu', 'k', khoảng trắng thừa
    let processed = input
      .replace(/,/g, '')           // loại dấu phẩy
      .replace(/xu/gi, '')         // loại 'xu'
      .replace(/k/gi, '')          // loại 'k' nếu có
      .trim();

    // Tách các phần số bằng khoảng trắng hoặc dấu +
    const parts = processed.split(/[\s+]+/).filter(part => part.length > 0);

    let sum = 0;
    for (const part of parts) {
      const num = parseFloat(part);
      if (!isNaN(num)) {
        sum += num;
      }
    }

    // Logic tự động nhân 1000 nếu tổng nhỏ (ví dụ: 12907 → 12.907.000)
    // Ngưỡng 100000 để hỗ trợ nhập số lớn hơn mà vẫn tự nhân nếu cần
    if (sum > 0 && sum < 100000) {
      return Math.round(sum * 1000);  // nhân 1000 và làm tròn
    }

    return Math.round(sum);  // nếu lớn hơn thì giữ nguyên
  } catch (e) {
    console.error('Lỗi evaluateAmount:', e);
    return 0;
  }
};
