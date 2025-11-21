import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
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

interface SensorEvent {
  id: string;
  timestamp: string; // 화면 표시용 시간
  rawTimestamp: Date; // 계산용 시간 객체
  sensorId: string;
  prediction: "normal" | "defect";
  probability: number; // 센서값 (여기서는 확률 대신 센서값으로 사용하거나 로직 수정 가능)
  modelVersion: string;
  status: "ACK" | "UNACK";
}

export function RealtimeMonitoringTab() {
  const [events, setEvents] = useState<SensorEvent[]>([]);
  const [defectCount5min, setDefectCount5min] = useState(0);
  const [totalDefectCount, setTotalDefectCount] = useState(0);
  const [kpiPeriod, setKpiPeriod] = useState<"session" | "daily" | "total">(
    "session"
  );
  const [lastUpdate, setLastUpdate] = useState<string>("");

  // 연결 상태 확인용
  const [isLive, setIsLive] = useState(false);
  const streamContainerRef = useRef<HTMLDivElement>(null);

  // StreamingTab에서 가져온 State
  const [chartData, setChartData] = useState<any[]>([]);
  const [normalCount, setNormalCount] = useState(0);
  const [defectCount, setDefectCount] = useState(0);

  // 🔥 파이어베이스 실시간 연동 (무한루프 방지)
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      orderBy("timestamp", "desc"),
      limit(1000) // 최신 1000개만 가져옴
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setIsLive(true);
        const dataList: SensorEvent[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const isDefect = data.target_value === 1;
          const dateObj =
            data.timestamp instanceof Timestamp
              ? data.timestamp.toDate()
              : new Date();

          return {
            id: doc.id,
            timestamp: dateObj.toLocaleTimeString("ko-KR"),
            rawTimestamp: dateObj,
            sensorId: data.sensor_id || "-",
            prediction: isDefect ? "defect" : "normal",
            probability: isDefect ? 0.95 : 0.1,
            modelVersion: "1.0.2",
            status: "UNACK", // 기본값은 미확인
          };
        });

        setEvents(prevEvents => {
          // 데이터가 실제로 변경되었을 때만 모든 상태 업데이트를 진행
          if (JSON.stringify(prevEvents) === JSON.stringify(dataList)) {
            return prevEvents;
          }

          // 기존 통계 계산
          calculateStats(dataList);

          // StreamingTab 로직 추가
          let n_count = 0;
          let d_count = 0;

          const sortedForChart = [...dataList].sort(
            (a, b) => a.rawTimestamp.getTime() - b.rawTimestamp.getTime()
          );

          const newChartData = sortedForChart.map((item) => {
            if (item.prediction === "normal") n_count++;
            else d_count++;

            return {
              time: item.timestamp,
              정상: n_count,
              불량: d_count,
            };
          });

          setNormalCount(n_count);
          setDefectCount(d_count);
          setChartData(newChartData);
          
          return dataList;
        });
      },
      (error) => {
        console.error("Firebase Error:", error);
        setIsLive(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 통계 계산 함수
  const calculateStats = (data: SensorEvent[]) => {
    if (data.length === 0) return;

    const total = data.filter((d) => d.prediction === "defect").length;
    const now = new Date();
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const recent = data.filter(
      (d) => d.prediction === "defect" && d.rawTimestamp > fiveMinsAgo
    ).length;

    setTotalDefectCount(total);
    setDefectCount5min(recent);
    setLastUpdate(new Date().toLocaleTimeString("ko-KR"));
  };

  // 이벤트 ACK 처리
  const handleAckEvent = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, status: "ACK" } : event
      )
    );
    toast.success("확인 완료", {
      description: "이상 알림이 확인 처리되었습니다.",
      duration: 2000,
    });
  };

  const displayDefectCount =
    kpiPeriod === "session"
      ? totalDefectCount
      : kpiPeriod === "daily"
      ? Math.floor(totalDefectCount * 1.5)
      : Math.floor(totalDefectCount * 3.2);

  // StreamingTab에서 가져온 통계 계산
  const totalStreamingCount = normalCount + defectCount;
  const normalPercentage =
    totalStreamingCount > 0
      ? ((normalCount / totalStreamingCount) * 100).toFixed(1)
      : 0;
  const defectPercentage =
    totalStreamingCount > 0
      ? ((defectCount / totalStreamingCount) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-orange-900">최근 5분간 불량 발생</h3>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl mb-1 text-orange-900">{defectCount5min}</div>
          <div className="text-xs text-orange-700">롤링 윈도우 갱신 중</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-red-900">전체 누적 불량 건수</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl mb-1 text-red-900">{displayDefectCount}</div>
          <div className="text-xs text-red-700">
            <Select
              value={kpiPeriod}
              onValueChange={(v: any) => setKpiPeriod(v)}
            >
              <SelectTrigger className="w-32 h-6 text-xs bg-red-100/50 border-red-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="session">세션 기준</SelectItem>
                <SelectItem value="daily">일일 기준</SelectItem>
                <SelectItem value="total">전체 기준</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm text-blue-900">최근 업데이트</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl mb-1 text-blue-900">
            {lastUpdate || "--:--:--"}
          </div>
          <div className="text-xs text-blue-700">Last update</div>
        </Card>
      </div>

      {/* 실시간 데이터 스트리밍 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>실시간 이벤트 스트림</h3>
          <Badge variant="outline" className="gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                isLive ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            {isLive ? "실시간 갱신 중" : "연결 대기 중"}
          </Badge>
        </div>

        <div
          ref={streamContainerRef}
          className="h-96 overflow-y-auto space-y-2 bg-slate-50 p-4 rounded-lg"
        >
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border-l-4 animate-in slide-in-from-top-2 transition-all ${
                event.prediction === "normal"
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {event.prediction === "normal" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={
                          event.prediction === "normal"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          event.prediction === "normal"
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }
                      >
                        {event.prediction === "normal" ? "정상" : "불량"}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {event.sensorId}
                      </span>
                      <span className="text-sm text-gray-500">
                        • {event.timestamp}
                      </span>

                      <span className="text-xs text-gray-500">
                        AI 확신도: {(event.probability * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        v{event.modelVersion}
                      </span>

                      {event.prediction === "defect" && (
                        <Badge
                          variant={
                            event.status === "ACK" ? "outline" : "secondary"
                          }
                          className="text-xs"
                        >
                          {event.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {event.status === "UNACK" && event.prediction === "defect" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAckEvent(event.id)}
                    className="h-7 text-xs ml-2"
                  >
                    확인
                  </Button>
                )}
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <AlertCircle className="w-12 h-12 mb-3 text-gray-400" />
              <p className="text-sm">
                Firebase에서 실시간 데이터를 수신 대기 중입니다...
              </p>
              <p className="text-xs text-gray-400 mt-1">
                파이썬 센서 시뮬레이터를 실행해주세요.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Status Cards from StreamingTab */}
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

      {/* Real-time Quality Trend Chart from StreamingTab */}
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
              isAnimationActive={false}
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
