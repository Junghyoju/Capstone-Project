import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { TrendingUp, DollarSign, Target, Zap, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// 파이어베이스 관련 import
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

interface LiveDefectData {
  name: '정상' | '불량';
  count: number;
}

export function ChartTab() {
  const [liveDefectData, setLiveDefectData] = useState<LiveDefectData[]>([]);

  // 🔥 파이어베이스 실시간 연동
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      orderBy("timestamp", "desc"),
      limit(100) // 최신 100개 데이터 기반으로 집계
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let normalCount = 0;
      let defectCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.target_value === 1) {
          defectCount++;
        } else {
          normalCount++;
        }
      });

      setLiveDefectData([
        { name: '정상', count: normalCount },
        { name: '불량', count: defectCount },
      ]);
    }, (error) => {
      console.error("Firebase Error in ChartTab:", error);
    });

    return () => unsubscribe();
  }, []);


  // ROI Data (기존 정적 데이터 유지)
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
    { metric: '재현율', value: 95.0 },
    { metric: 'F1-Score', value: 93.6 },
    { metric: '특이도', value: 98.1 },
  ];

  // Training Progress
  const currentEpoch = 48;
  const totalEpochs = 50;
  const trainingTime = '2시간 35분';
  const trainingStatus = currentEpoch >= totalEpochs ? '학습 완료' : '학습 중';

  const accuracy = 94.7;
  const precision = 92.2;
  const recall = 95.0;
  const f1Score = 93.6;

  return (
    <div className="space-y-6">
      {/* 실시간 불량 현황 차트 */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-500" />
          실시간 생산 현황 (최신 100개)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={liveDefectData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" width={60} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="수량">
              {liveDefectData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.name === '불량' ? '#ef4444' : '#22c55e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

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
          <h3 className="mb-4">혼동 행렬 (Confusion Matrix)</h3>
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
                <span className="text-sm">재현율 (Recall)</span>
                <Badge className="bg-purple-600">{recall}%</Badge>
              </div>
              <Progress value={recall} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">F1-Score</span>
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

      {/* Model Training Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>모델 학습 진행 상황</h3>
          <Badge className={trainingStatus === '학습 완료' ? 'bg-green-600' : 'bg-blue-600'}>
            {trainingStatus}
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">학습 시간</span>
              </div>
              <div className="text-2xl">{trainingTime}</div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">현재 Epoch</div>
              <div className="text-2xl">{currentEpoch} / {totalEpochs}</div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">진행률</div>
              <div className="text-2xl">{((currentEpoch / totalEpochs) * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">학습 진행</span>
              <span className="text-sm">{currentEpoch} / {totalEpochs} epochs</span>
            </div>
            <Progress value={(currentEpoch / totalEpochs) * 100} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-gray-600 mb-1">학습 손실 (Loss)</div>
              <div className="text-xl">0.0342</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">검증 손실 (Val Loss)</div>
              <div className="text-xl">0.0389</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
