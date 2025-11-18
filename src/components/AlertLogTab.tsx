import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Calendar,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// 파이어베이스 관련 import
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

interface AlertLog {
  id: string;
  timestamp: string;
  timestampMs: number;
  sensorId: string;
  probability: number;
  status: "ACK" | "UNACK";
  actionTaken?: string;
}

interface SensorRanking {
  rank: number;
  sensorId: string;
  detectionCount: number;
  avgProbability: number;
  lastDetection: string;
}

export function AlertLogTab() {
  const [logs, setLogs] = useState<AlertLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AlertLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rankingPeriod, setRankingPeriod] = useState<"24h" | "1week">("24h");
  const [sensorRankings, setSensorRankings] = useState<SensorRanking[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  // 🔥 Firebase 실시간 리스너 추가
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      where("target_value", "==", 1), // 불량 데이터만 필터링
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertData: AlertLog[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const dateObj = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
        
        // 기존 로그에서 상태(ACK/UNACK)가 있는지 확인, 없으면 UNACK
        const existingLog = logs.find(log => log.id === doc.id);

        return {
          id: doc.id,
          timestamp: dateObj.toLocaleString("ko-KR"),
          timestampMs: dateObj.getTime(),
          sensorId: data.sensor_id,
          // target_value가 1일 때 sensor_value는 90~110 범위이므로, 이를 0~1 확률로 변환
          probability: Math.min(1, (data.sensor_value - 70) / 40), 
          status: existingLog ? existingLog.status : "UNACK",
          actionTaken: existingLog ? existingLog.actionTaken : undefined,
        };
      });
      setLogs(alertData);
    }, (error) => {
      console.error("Firebase Error in AlertLogTab:", error);
    });

    return () => unsubscribe();
  }, []); // logs를 dependency에서 제거하여 무한 루프 방지

  // 센서 랭킹 계산
  const calculateRankings = (logData: AlertLog[], period: "24h" | "1week") => {
    const now = Date.now();
    const periodMs =
      period === "24h" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

    const periodLogs = logData.filter(
      (log) => now - log.timestampMs < periodMs
    );

    const sensorMap = new Map<
      string,
      { count: number; probabilities: number[]; lastTime: number }
    >();

    periodLogs.forEach((log) => {
      if (!sensorMap.has(log.sensorId)) {
        sensorMap.set(log.sensorId, {
          count: 0,
          probabilities: [],
          lastTime: 0,
        });
      }
      const sensor = sensorMap.get(log.sensorId)!;
      sensor.count++;
      sensor.probabilities.push(log.probability);
      sensor.lastTime = Math.max(sensor.lastTime, log.timestampMs);
    });

    const rankings: SensorRanking[] = Array.from(sensorMap.entries())
      .map(([sensorId, data]) => ({
        rank: 0,
        sensorId,
        detectionCount: data.count,
        avgProbability:
          data.probabilities.reduce((a, b) => a + b, 0) /
          data.probabilities.length,
        lastDetection: new Date(data.lastTime).toLocaleString("ko-KR"),
      }))
      .sort((a, b) => b.detectionCount - a.detectionCount)
      .map((item, index) => ({ ...item, rank: index + 1 }))
      .slice(0, 10);

    setSensorRankings(rankings);
  };

  // 랭킹 기간 변경 시
  useEffect(() => {
    calculateRankings(logs, rankingPeriod);
  }, [rankingPeriod, logs]);

  // 필터링 및 검색
  useEffect(() => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.sensorId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    if (selectedSensor) {
      filtered = filtered.filter((log) => log.sensorId === selectedSensor);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, statusFilter, selectedSensor, logs]);

  const handleAck = (logId: string, action: string) => {
    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId ? { ...log, status: "ACK", actionTaken: action } : log
      )
    );
  };

  const handleSensorClick = (sensorId: string) => {
    setSelectedSensor(sensorId === selectedSensor ? null : sensorId);
  };

  return (
    <div className="space-y-6">
      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-sm text-blue-900 mb-1">전체 이벤트</div>
          <div className="text-2xl text-blue-900">{logs.length}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-sm text-green-900 mb-1">확인 완료</div>
          <div className="text-2xl text-green-900">
            {logs.filter((l) => l.status === "ACK").length}
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="text-sm text-red-900 mb-1">미확인</div>
          <div className="text-2xl text-red-900">
            {logs.filter((l) => l.status === "UNACK").length}
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="text-sm text-purple-900 mb-1">평균 이상 확률</div>
          <div className="text-2xl text-purple-900">
            {logs.length > 0
              ? (
                  (logs.reduce((sum, l) => sum + l.probability, 0) /
                    logs.length) *
                  100
                ).toFixed(1)
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* 빈발 센서 랭킹 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3>상위 이상 빈발 센서 랭킹</h3>
          </div>
          <Select
            value={rankingPeriod}
            onValueChange={(v: any) => setRankingPeriod(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">최근 24시간</SelectItem>
              <SelectItem value="1week">최근 1주일</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sensorRankings.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-3 text-left text-sm w-20">순위</th>
                  <th className="p-3 text-left text-sm w-32">센서 ID</th>
                  <th className="p-3 text-left text-sm w-28">감지 건수</th>
                  <th className="p-3 text-left text-sm">평균 이상 확률</th>
                  <th className="p-3 text-left text-sm">최근 발생 시각</th>
                  <th className="p-3 text-left text-sm w-24">액션</th>
                </tr>
              </thead>
              <tbody>
                {sensorRankings.map((ranking) => (
                  <tr
                    key={ranking.sensorId}
                    className={`cursor-pointer transition-colors border-b hover:bg-gray-50 ${
                      selectedSensor === ranking.sensorId ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleSensorClick(ranking.sensorId)}
                  >
                    <td className="p-3">
                      <Badge
                        variant={ranking.rank <= 3 ? "destructive" : "outline"}
                        className="text-xs"
                      >
                        #{ranking.rank}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs">{ranking.sensorId}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs">
                          {ranking.detectionCount}건
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{
                              width: `${ranking.avgProbability * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs">
                          {(ranking.avgProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-600">
                      {ranking.lastDetection}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleSensorClick(ranking.sensorId);
                        }}
                      >
                        {selectedSensor === ranking.sensorId
                          ? "필터 해제"
                          : "이력 보기"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Firebase에서 데이터를 불러오는 중...</p>
          </div>
        )}
      </Card>

      {/* 필터 및 검색 */}
      <Card className="p-6">
        <h3 className="mb-4">이상 이벤트 기록 테이블</h3>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="센서 ID 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="상태 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="UNACK">미확인</SelectItem>
              <SelectItem value="ACK">확인 완료</SelectItem>
            </SelectContent>
          </Select>

          {selectedSensor && (
            <Button
              variant="outline"
              onClick={() => setSelectedSensor(null)}
              className="gap-2"
            >
              {selectedSensor} 필터 해제
            </Button>
          )}

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            내보내기
          </Button>
        </div>

        {/* 이력 테이블 */}
        {filteredLogs.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm w-40">발생 시간</th>
                    <th className="p-3 text-left text-sm w-32">센서 ID</th>
                    <th className="p-3 text-left text-sm w-32">이상 확률</th>
                    <th className="p-3 text-left text-sm w-24">상태</th>
                    <th className="p-3 text-left text-sm">조치 내역</th>
                    <th className="p-3 text-left text-sm w-32">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className={`border-b hover:bg-gray-50 ${
                        log.status === "UNACK" ? "bg-red-50" : ""
                      }`}
                    >
                      <td className="p-3 text-xs">{log.timestamp}</td>
                      <td className="p-3 text-xs">{log.sensorId}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[60px]">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${log.probability * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-red-700">
                            {(log.probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            log.status === "ACK" ? "default" : "destructive"
                          }
                          className="text-xs"
                        >
                          {log.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-gray-600">
                        {log.actionTaken || "-"}
                      </td>
                      <td className="p-3">
                        {log.status === "UNACK" && (
                          <Select
                            onValueChange={(value: string) =>
                              handleAck(log.id, value)
                            }
                          >
                            <SelectTrigger className="h-7 text-xs w-full">
                              <SelectValue placeholder="조치" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="센서 점검 완료">
                                센서 점검 완료
                              </SelectItem>
                              <SelectItem value="부품 교체">
                                부품 교체
                              </SelectItem>
                              <SelectItem value="정상 범위 확인">
                                정상 범위 확인
                              </SelectItem>
                              <SelectItem value="재시작 조치">
                                재시작 조치
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">
              {logs.length === 0
                ? "Firebase에서 데이터를 불러오는 중..."
                : "검색 결과가 없습니다."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
