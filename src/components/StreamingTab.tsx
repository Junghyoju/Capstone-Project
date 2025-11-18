import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

interface StreamingTabProps {
  uploadedData?: any[]; // 이제 안 쓰지만 호환성 위해 남겨둠
}

// 파이어베이스 데이터 구조에 맞게 수정
interface DataPoint {
  id: string;
  timestamp: string; // 화면 표시용 (문자열)
  rawTimestamp: Date; // 정렬용 (Date 객체)
  status: "normal" | "defect";
  sensorId: string;
  sensorValue: number;
}

export function StreamingTab({ uploadedData }: StreamingTabProps) {
  const [streamData, setStreamData] = useState<DataPoint[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 통계용 State
  const [normalCount, setNormalCount] = useState(0);
  const [defectCount, setDefectCount] = useState(0);

  const streamContainerRef = useRef<HTMLDivElement>(null);

  // 🔥 파이어베이스 실시간 데이터 연동
  useEffect(() => {
    // 1. 쿼리: 최신순으로 50개만 가져오기
    const q = query(
      collection(db, "factory_log"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    // 2. 실시간 구독
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dataList: DataPoint[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const isDefect = data.target_value === 1; // target_value가 1이면 불량

          // Timestamp 변환
          const dateObj =
            data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : new Date();

          return {
            id: doc.id,
            timestamp: dateObj.toLocaleTimeString("ko-KR"),
            rawTimestamp: dateObj,
            status: isDefect ? "defect" : "normal",
            sensorId: data.sensor_id || "Unknown",
            sensorValue: Number(data.sensor_value) || 0,
          };
        });

        // 스트리밍 데이터 업데이트
        setStreamData(dataList);

        // 📊 통계 및 차트 데이터 계산 (전체 데이터 기준이 아니라, 가져온 50개 기준)
        // 실제 서비스에서는 서버에서 통계를 따로 가져오거나, 더 많은 데이터를 로드해야 정확합니다.
        let n_count = 0;
        let d_count = 0;

        // 시간순 오름차순으로 정렬해서 차트 데이터 만들기
        const sortedForChart = [...dataList].sort(
          (a, b) => a.rawTimestamp.getTime() - b.rawTimestamp.getTime()
        );

        const newChartData = sortedForChart.map((item) => {
          if (item.status === "normal") n_count++;
          else d_count++;

          return {
            time: item.timestamp,
            정상: n_count,
            불량: d_count,
          };
        });

        setNormalCount(n_count);
        setDefectCount(d_count);
        setChartData(newChartData); // 차트 업데이트
      },
      (error) => {
        console.error("Firebase error:", error);
      }
    );

    return () => unsubscribe(); // 컴포넌트 해제 시 구독 취소
  }, []);

  // 통계 계산 (화면에 보여줄 비율)
  const totalCount = normalCount + defectCount;
  const normalPercentage =
    totalCount > 0 ? ((normalCount / totalCount) * 100).toFixed(1) : 0;
  const defectPercentage =
    totalCount > 0 ? ((defectCount / totalCount) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Real-time Streaming Data */}
      <Card className="p-6">
        <h3 className="mb-4">실시간 데이터 스트리밍</h3>
        <div
          ref={streamContainerRef}
          className="h-96 overflow-y-auto space-y-2 bg-slate-50 p-4 rounded-lg"
        >
          {streamData.map((data) => (
            <div
              key={data.id}
              className={`p-4 rounded-lg border-l-4 animate-in slide-in-from-bottom-2 ${
                data.status === "normal"
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {data.status === "normal" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          data.status === "normal" ? "default" : "destructive"
                        }
                      >
                        {data.status === "normal" ? "정상" : "불량"}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {data.sensorId}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {data.timestamp}
                      </span>
                    </div>
                    {/* 센서값 추가 표시 */}
                    <div className="text-xs text-gray-400 mt-1">
                      Value: {data.sensorValue.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-green-900">정상</h3>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-4xl mb-2 text-green-900">
            {normalPercentage}%
          </div>
          <div className="text-sm text-green-700">
            {normalCount.toLocaleString()} 건 (최근 50개 중)
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-red-900">불량</h3>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <div className="text-4xl mb-2 text-red-900">{defectPercentage}%</div>
          <div className="text-sm text-red-700">
            {defectCount.toLocaleString()} 건 (최근 50개 중)
          </div>
        </Card>
      </div>

      {/* Real-time Quality Trend Chart */}
      <Card className="p-6">
        <h3 className="mb-4">실시간 품질 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="정상"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 4 }}
              isAnimationActive={false} // 실시간 데이터라 애니메이션 끄는 게 자연스러움
            />
            <Line
              type="monotone"
              dataKey="불량"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
