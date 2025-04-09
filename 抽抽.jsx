import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const dailyLimits = {
  '2025-04-18': 25,
  '2025-04-19': 25,
  '2025-04-20': 20,
  '2025-04-21': 10,
};

export default function VoucherRedeemApp() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [usageCounts, setUsageCounts] = useState({});
  const [message, setMessage] = useState('');

  const handleRedeem = () => {
    const currentCount = usageCounts[today] || 0;
    const limit = dailyLimits[today] || 0;

    if (currentCount >= limit) {
      setMessage('今日的兌換卷已兌換完畢！');
      return;
    }

    const updatedCounts = {
      ...usageCounts,
      [today]: currentCount + 1,
    };

    setUsageCounts(updatedCounts);
    setMessage(`兌換成功！今天已兌換 ${updatedCounts[today]} / ${limit}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-center">每日兌換卷系統</h2>
          <p className="text-center">今日：{today}</p>
          <p className="text-center">剩餘次數：{(dailyLimits[today] || 0) - (usageCounts[today] || 0)}</p>
          <Button onClick={handleRedeem}>兌換</Button>
          {message && <p className="text-center text-green-600 font-semibold">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
