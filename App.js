import { useEffect, useState } from 'react';
import { Card, CardContent } from './components/ui/card'; // 更新這裡的引入
import { Button } from './components/ui/button'; // 更新這裡的引入
import { format } from 'date-fns';

const dailyLimits = {
  '2025-04-09': 25,
  '2025-04-10': 25,
  '2025-04-11': 20,
  '2025-04-12': 10,
};

export default function VoucherRedeemApp() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const nowFull = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
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

  const handleRedeem = async () => {
    if (!memberName) {
      setMessage('請輸入會員姓名再進行兌換');
      return;
    }

    const currentCount = usageCounts[today]?.count || 0;
    const limit = dailyLimits[today] || Infinity;

    console.log(`Today's date: ${today}`);
    console.log(`Current usage: ${currentCount}`);
    console.log(`Limit for today: ${limit}`);

    if (currentCount >= limit) {
      console.log(`Redemption blocked: ${memberName} tried to redeem after reaching limit.`);
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

    try {
      const res = await fetch('http://localhost:3001/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: memberName, date: nowFull }),
      });
      if (!res.ok) throw new Error('Network response was not ok');
      console.log('Successfully sent to backend');
    } catch (err) {
      console.error('Failed to send to backend', err);
    }
  };

  const handleExport = () => {
    const csvRows = ['日期,會員紀錄'];
    Object.entries(usageCounts).forEach(([date, data]) => {
      data.records.forEach((entry) => {
        csvRows.push(`${date},${entry}`);
      });
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '兌換紀錄.csv';  // 確保文件名設置正確
    document.body.appendChild(link); // 確保可以點擊
    link.click(); // 觸發下載
    document.body.removeChild(link); // 清理 DOM
    window.URL.revokeObjectURL(url);  // 釋放 URL
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">每日兌換卷系統</h2>
          <p className="text-center">今日：{nowFull}</p>
          <input
            className="border rounded p-2"
            type="text"
            placeholder="請輸入會員姓名"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
          />
          <Button onClick={handleRedeem}>兌換</Button>
          {message && <p className="text-center text-green-600 font-semibold">{message}</p>}
          <Button variant="outline" onClick={() => setShowAdmin(!showAdmin)}>
            {showAdmin ? '隱藏後台紀錄' : '顯示後台紀錄'}
          </Button>
          {showAdmin && (
            <div className="bg-white border p-2 text-sm max-h-64 overflow-y-auto">
              <h3 className="font-semibold mb-2">兌換紀錄</h3>
              {Object.entries(usageCounts).map(([date, data]) => (
                <div key={date} className="mb-2">
                  <p className="font-medium">{date}</p>
                  <ul className="list-disc list-inside">
                    {data.records.map((name, idx) => (
                      <li key={idx}>{name}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <Button className="mt-4" onClick={handleExport}>
                匯出 Excel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
