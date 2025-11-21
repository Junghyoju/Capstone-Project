import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { TrendingUp, DollarSign, Target, Zap, Clock } from 'lucide-react';

export function ChartTab() {
  // ROI Data
  const roiData = [
    { month: '1월', roi: 45 },
    { month: '2월', roi: 78 },
    { month: '3월', roi: 112 },
    { month: '4월', roi: 156 },
    { month: '5월', roi: 203 },
    { month: '6월', roi: 245 },
    { month: '7월', roi: 285 },
  ];

  // Confusion Matrix Data
  const confusionMatrix = {
    truePositive: 1847,
    trueNegative: 8234,
    falsePositive: 156,
    falseNegative: 98,
  };

  // Performance Metrics Radar Data
  const radarData = [
    { metric: '정확도', value: 94.7 },
    { metric: '정밀도', value: 92.2 },
    { metric: '탐지율', value: 95.0 },
    { metric: '균형점', value: 93.6 },
    { metric: '특이도', value: 98.1 },
  ];



  const accuracy = 94.7;
  const precision = 92.2;
  const recall = 95.0;
  const f1Score = 93.6;

  return (
    <div className="space-y-6">
      {/* ROI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-green-900">총 절약액</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl text-green-900">₩2.85M</div>
          <div className="text-xs text-green-700 mt-1">연간 기준</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-blue-900">불량률 감소</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl text-blue-900">67.5%</div>
          <div className="text-xs text-blue-700 mt-1">8.5% → 2.8%</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-purple-900">생산 효율 증가</h3>
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl text-purple-900">23.8%</div>
          <div className="text-xs text-purple-700 mt-1">처리량 향상</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-orange-900">투자 수익률</h3>
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl text-orange-900">285%</div>
          <div className="text-xs text-orange-700 mt-1">18개월 회수</div>
        </Card>
      </div>

      {/* ROI Trend Chart */}
      <Card className="p-6">
        <h3 className="mb-4">투자 수익률 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={roiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="roi" 
              name="ROI (%)"
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Confusion Matrix and Performance Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">결과 요약표</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-green-100 rounded-lg text-center border-2 border-green-300">
              <div className="text-xs text-green-700 mb-2">True Positive</div>
              <div className="text-3xl text-green-900">{confusionMatrix.truePositive.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">정확한 불량 탐지</div>
            </div>
            <div className="p-6 bg-red-100 rounded-lg text-center border-2 border-red-300">
              <div className="text-xs text-red-700 mb-2">False Positive</div>
              <div className="text-3xl text-red-900">{confusionMatrix.falsePositive.toLocaleString()}</div>
              <div className="text-xs text-red-600 mt-1">오탐 (정상→불량)</div>
            </div>
            <div className="p-6 bg-yellow-100 rounded-lg text-center border-2 border-yellow-300">
              <div className="text-xs text-yellow-700 mb-2">False Negative</div>
              <div className="text-3xl text-yellow-900">{confusionMatrix.falseNegative.toLocaleString()}</div>
              <div className="text-xs text-yellow-600 mt-1">미탐 (불량→정상)</div>
            </div>
            <div className="p-6 bg-blue-100 rounded-lg text-center border-2 border-blue-300">
              <div className="text-xs text-blue-700 mb-2">True Negative</div>
              <div className="text-3xl text-blue-900">{confusionMatrix.trueNegative.toLocaleString()}</div>
              <div className="text-xs text-blue-600 mt-1">정확한 정상 판정</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">성능 지표</h3>
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">정확도 (Accuracy)</span>
                <Badge className="bg-blue-600">{accuracy}%</Badge>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">정밀도 (Precision)</span>
                <Badge className="bg-green-600">{precision}%</Badge>
              </div>
              <Progress value={precision} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">탐지율 (Recall)</span>
                <Badge className="bg-purple-600">{recall}%</Badge>
              </div>
              <Progress value={recall} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">균형점 (F1-score)</span>
                <Badge className="bg-orange-600">{f1Score}%</Badge>
              </div>
              <Progress value={f1Score} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Radar Chart */}
      <Card className="p-6">
        <h3 className="mb-4">성능 지표 레이더</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar 
              name="성능" 
              dataKey="value" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>


    </div>
  );
}
