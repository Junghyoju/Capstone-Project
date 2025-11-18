import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} from 'recharts';
import { Calendar, TrendingUp, Activity, Search } from 'lucide-react';

// 파이어베이스 관련 import
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

interface SensorProbData {
  sensorId: string;
  평균확률: number;
  발생빈도: number;
}

interface HourlyDefectData {
  hour: string;
  불량률: number;
}

export function SensorSummaryTab() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [weekRange, setWeekRange] = useState([0]);
  const [searchTerm, setSearchTerm] = useState('');

  // 실시간 데이터 상태
  const [sensorProbabilityData, setSensorProbabilityData] = useState<SensorProbData[]>([]);
  const [hourlyDefectRateData, setHourlyDefectRateData] = useState<HourlyDefectData[]>([]);

  // 🔥 파이어베이스 실시간 연동
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      orderBy("timestamp", "desc"),
      limit(1000) // 요약 및 패턴 분석을 위해 더 많은 데이터(1000개)를 가져옴
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sensorMap = new Map<string, { values: number[], count: number }>();
      const hourlyDefects = Array(24).fill(0);
      const hourlyTotals = Array(24).fill(0);

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const dateObj = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
        const hour = dateObj.getHours();

        hourlyTotals[hour]++;

        if (data.target_value === 1) {
          hourlyDefects[hour]++;
          if (!sensorMap.has(data.sensor_id)) {
            sensorMap.set(data.sensor_id, { values: [], count: 0 });
          }
          const sensor = sensorMap.get(data.sensor_id)!;
          sensor.values.push(data.sensor_value);
          sensor.count++;
        }
      });

      // 센서별 데이터 가공
      const newSensorProbData: SensorProbData[] = Array.from(sensorMap.entries()).map(([sensorId, data]) => ({
        sensorId,
        // 불량일 때 sensor_value는 90~110 범위. 이를 70~100% 확률로 표현
        평균확률: (data.values.reduce((a, b) => a + b, 0) / data.values.length - 20),
        발생빈도: data.count,
      }));
      setSensorProbabilityData(newSensorProbData);

      // 시간대별 데이터 가공
      const newHourlyData: HourlyDefectData[] = hourlyDefects.map((defects, hour) => ({
        hour: `${hour < 10 ? '0' : ''}${hour}`,
        불량률: hourlyTotals[hour] > 0 ? (defects / hourlyTotals[hour]) * 100 : 0,
      }));
      setHourlyDefectRateData(newHourlyData);

    }, (error) => {
      console.error("Firebase Error in SensorSummaryTab:", error);
    });

    return () => unsubscribe();
  }, []);


  // 주별 불량률 데이터 (최근 12주) - 정적 데이터 유지
  const weeklyDefectRateData = [
    { week: '1주', 불량률: 4.2, 이벤트수: 1524 },
    { week: '2주', 불량률: 3.8, 이벤트수: 1612 },
    { week: '3주', 불량률: 5.1, 이벤트수: 1589 },
    { week: '4주', 불량률: 2.9, 이벤트수: 1643 },
    { week: '5주', 불량률: 4.5, 이벤트수: 1598 },
    { week: '6주', 불량률: 3.6, 이벤트수: 1621 },
    { week: '7주', 불량률: 4.8, 이벤트수: 1547 },
    { week: '8주', 불량률: 3.2, 이벤트수: 1634 },
    { week: '9주', 불량률: 5.3, 이벤트수: 1512 },
    { week: '10주', 불량률: 4.1, 이벤트수: 1605 },
    { week: '11주', 불량률: 3.7, 이벤트수: 1628 },
    { week: '12주', 불량률: 4.4, 이벤트수: 1591 },
  ];

  // 월별 불량률 데이터 (최근 3개월) - 정적 데이터 유지
  const monthlyDefectRateData = [
    { month: '10월', 불량률: 4.2, 이벤트수: 6368 },
    { month: '11월', 불량률: 3.9, 이벤트수: 6422 },
    { month: '12월', 불량률: 4.3, 이벤트수: 6336 },
  ];

  // 요일별 불량률 히트맵 데이터 (주차 x 요일) - 정적 데이터 유지
  const weekdayHeatmapData = [
    { week: '1주', 월: 3.2, 화: 3.8, 수: 4.1, 목: 4.5, 금: 5.2, 토: 2.1, 일: 1.8 },
    { week: '2주', 월: 2.9, 화: 3.5, 수: 3.9, 목: 4.2, 금: 4.8, 토: 1.9, 일: 1.6 },
    { week: '3주', 월: 4.1, 화: 4.6, 수: 5.0, 목: 5.4, 금: 6.1, 토: 2.5, 일: 2.2 },
    { week: '4주', 월: 2.5, 화: 3.1, 수: 3.4, 목: 3.8, 금: 4.3, 토: 1.7, 일: 1.4 },
  ];

  const getHeatColor = (value: number) => {
    if (value < 2) return '#22c55e';
    if (value < 3) return '#84cc16';
    if (value < 4) return '#eab308';
    if (value < 5) return '#f97316';
    return '#ef4444';
  };

  const filteredSensorData = sensorProbabilityData.filter(sensor =>
    sensor.sensorId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentData = period === 'week' ? weeklyDefectRateData : monthlyDefectRateData;
  const avgDefectRate = currentData.reduce((sum, d) => sum + d.불량률, 0) / currentData.length;

  return (
    <div className="space-y-6">
      {/* 기간 선택 및 요약 통계 */}
      <div className="flex items-center justify-between">
        <h2>센서 상태 요약 및 패턴 분석</h2>
        <Tabs value={period} onValueChange={(v: any) => setPeriod(v)}>
          <TabsList>
            <TabsTrigger value="week">주간</TabsTrigger>
            <TabsTrigger value="month">월간</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 핵심 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-blue-900">평균 불량률</div>
          </div>
          <div className="text-2xl text-blue-900">{avgDefectRate.toFixed(2)}%</div>
          <div className="text-xs text-blue-700 mt-1">{period === 'week' ? '주간' : '월간'} 평균</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-600" />
            <div className="text-sm text-green-900">최저 불량률</div>
          </div>
          <div className="text-2xl text-green-900">
            {Math.min(...currentData.map(d => d.불량률)).toFixed(2)}%
          </div>
          <div className="text-xs text-green-700 mt-1">기간 내 최저치</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <div className="text-sm text-red-900">최고 불량률</div>
          </div>
          <div className="text-2xl text-red-900">
            {Math.max(...currentData.map(d => d.불량률)).toFixed(2)}%
          </div>
          <div className="text-xs text-red-700 mt-1">기간 내 최고치</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <div className="text-sm text-purple-900">분석 기간</div>
          </div>
          <div className="text-2xl text-purple-900">
            {period === 'week' ? '12주' : '3개월'}
          </div>
          <div className="text-xs text-purple-700 mt-1">데이터 기간</div>
        </Card>
      </div>

      {/* 주별·월별 불량률 변화 그래프 */}
      <Card className="p-6">
        <h3 className="mb-4">{period === 'week' ? '주별' : '월별'} 불량률 변화 추이</h3>
        {period === 'week' && (
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-sm text-gray-600">기간 선택:</span>
              <span className="text-sm">최근 {12 - weekRange[0]}주</span>
            </div>
            <Slider
              value={weekRange}
              onValueChange={setWeekRange}
              max={9}
              step={1}
              className="w-64"
            />
          </div>
        )}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={period === 'week' ? weeklyDefectRateData.slice(weekRange[0]) : monthlyDefectRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={period === 'week' ? 'week' : 'month'} />
            <YAxis label={{ value: '불량률 (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="불량률" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#ef4444' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-900">
            💡 <span>추세 분석:</span> 최근 {period === 'week' ? '12주' : '3개월'} 동안 불량률은 평균 {avgDefectRate.toFixed(2)}%를 기록했습니다.
          </div>
        </div>
      </Card>

      {/* 센서별 평균 이상 확률 및 발생 빈도 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>센서별 평균 이상 확률 및 발생 빈도 (실시간)</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="센서 ID 검색 (예: SENSOR_001)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="평균확률" 
              name="평균 이상 확률" 
              unit="%" 
              domain={[60, 100]}
            />
            <YAxis 
              type="number" 
              dataKey="발생빈도" 
              name="발생 빈도" 
              unit="건"
            />
            <ZAxis range={[100, 400]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="text-sm mb-1">{data.sensorId}</p>
                      <p className="text-xs text-gray-600">평균 확률: {data.평균확률.toFixed(1)}%</p>
                      <p className="text-xs text-gray-600">발생 빈도: {data.발생빈도}건</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Scatter name="센서" data={filteredSensorData} fill="#8884d8">
              {filteredSensorData.map((entry, index) => {
                const heatValue = (entry.발생빈도 / 20) * 100; // 발생빈도 최대값을 20으로 가정
                const color = getHeatColor(heatValue / 20);
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-600">색상(발생빈도):</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-xs">낮음</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
            <span className="text-xs">중간</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs">높음</span>
          </div>
        </div>
      </Card>

      {/* 시간대별 평균 불량률 */}
      <Card className="p-6">
        <h3 className="mb-4">시간대별 평균 불량률 (실시간)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyDefectRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis label={{ value: '불량률 (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Bar dataKey="불량률" fill="#f97316">
              {hourlyDefectRateData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getHeatColor(entry.불량률)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-orange-50 rounded-lg">
          <div className="text-sm text-orange-900">
            💡 <span>패턴 인사이트:</span> 실시간 데이터에 따르면, 특정 시간대에 불량률이 집중되는 경향을 보입니다.
          </div>
        </div>
      </Card>

      {/* 요일별 불량률 히트맵 */}
      <Card className="p-6">
        <h3 className="mb-4">요일별 불량률 패턴 (히트맵)</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50 text-sm">주차</th>
                <th className="border p-2 bg-gray-50 text-sm">월</th>
                <th className="border p-2 bg-gray-50 text-sm">화</th>
                <th className="border p-2 bg-gray-50 text-sm">수</th>
                <th className="border p-2 bg-gray-50 text-sm">목</th>
                <th className="border p-2 bg-gray-50 text-sm">금</th>
                <th className="border p-2 bg-gray-50 text-sm">토</th>
                <th className="border p-2 bg-gray-50 text-sm">일</th>
              </tr>
            </thead>
            <tbody>
              {weekdayHeatmapData.map((row, idx) => (
                <tr key={idx}>
                  <td className="border p-2 text-sm text-center bg-gray-50">{row.week}</td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.월) }}>
                    {row.월}%
                  </td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.화) }}>
                    {row.화}%
                  </td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.수) }}>
                    {row.수}%
                  </td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.목) }}>
                    {row.목}%
                  </td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.금) }}>
                    {row.금}%
                  </td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.토) }}>
                    {row.토}%
                  </td>
                  <td className="border p-3 text-center text-sm" style={{ backgroundColor: getHeatColor(row.일) }}>
                    {row.일}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-purple-900">
            💡 <span>패턴 인사이트:</span> 주중 후반부(목·금요일)에 불량률이 높아지는 경향이 있으며, 주말에는 감소합니다.
          </div>
        </div>
      </Card>
    </div>
  );
}