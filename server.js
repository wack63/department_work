// 修改為支援部署到 Vercel 的 Next.js 專案
// 並新增 package.json 以解決 "No Next.js version" 錯誤

// == pages/index.js ==
import { useEffect, useState } from 'react';

const dailyLimits = {
  '2025-04-09': 25,
  '2025-04-10': 25,
  '2025-04-11': 20,
  '2025-04-12': 10,
};

export default function VoucherRedeemApp() {
  const today = new Date().toISOString().split('T')[0];
  const nowFull = new Date().toLocaleString('zh-TW', { hour12: false });
  const [usageCounts, setUsageCounts] = useState({});
  const [message, setMessage] = useState('');
  const [memberName, setMemberName] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const storedCounts = localStorage.getItem('usageCounts');
    if (storedCounts) {
      setUsageCounts(JSON.parse(storedCounts));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('usageCounts', JSON.stringify(usageCounts));
  }, [usageCounts]);

  const handleRedeem = () => {
    if (!memberName) {
      setMessage('請輸入會員姓名再進行兌換');
      return;
    }

    const currentCount = usageCounts[today]?.count || 0;
    const limit = dailyLimits[today] || Infinity;

    if (currentCount >= limit) {
      setMessage(`今日已達兌換上限，無法兌換`);
      return;
    }

    const updatedCounts = {
      ...usageCounts,
      [today]: {
        count: currentCount + 1,
        records: [...(usageCounts[today]?.records || []), `${memberName} (${nowFull})`],
      },
    };

    setUsageCounts(updatedCounts);
    setMessage(`兌換成功！謝謝 ${memberName} 的參與！`);
    setMemberName('');
  };

  const handleExport = () => {
    const csvRows = ['日期,會員紀錄'];
    Object.entries(usageCounts).forEach(([date, data]) => {
      const records = data.records || [];
      records.forEach((entry) => {
        csvRows.push(`${date},${entry}`);
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '兌換紀錄.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '1rem', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>每日兌換卷系統</h2>
        <p style={{ textAlign: 'center' }}>今日：{nowFull}</p>
        <input
          style={{ border: '1px solid #ccc', borderRadius: '0.375rem', padding: '0.5rem', width: '100%', marginBottom: '0.5rem' }}
          type="text"
          placeholder="請輸入會員姓名"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
        />
        <button onClick={handleRedeem} style={{ padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#2563eb', color: 'white', width: '100%', marginBottom: '0.5rem' }}>
          兌換
        </button>
        {message && <p style={{ textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>{message}</p>}
        <button onClick={() => setShowAdmin(!showAdmin)} style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #ccc', width: '100%' }}>
          {showAdmin ? '隱藏後台紀錄' : '顯示後台紀錄'}
        </button>
        {showAdmin && (
          <div style={{ marginTop: '1rem', border: '1px solid #e5e7eb', padding: '0.5rem', maxHeight: '250px', overflowY: 'auto', fontSize: '0.875rem' }}>
            <h3 style={{ fontWeight: 'bold' }}>兌換紀錄</h3>
            {Object.entries(usageCounts).map(([date, data]) => (
              <div key={date} style={{ marginBottom: '0.5rem' }}>
                <p style={{ fontWeight: '500' }}>{date}</p>
                <ul style={{ paddingLeft: '1rem' }}>
                  {(data.records || []).map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            ))}
            <button onClick={handleExport} style={{ marginTop: '1rem', padding: '0.5rem', borderRadius: '0.375rem', backgroundColor: '#10b981', color: 'white', width: '100%' }}>
              匯出 Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}