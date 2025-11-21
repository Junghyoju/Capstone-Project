import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DashboardSidebar } from "./DashboardSidebar";
import { ChartTab } from "./ChartTab";
import { RealtimeMonitoringTab } from "./RealtimeMonitoringTab";
import { AlertLogTab } from "./AlertLogTab";
import { SensorSummaryTab } from "./SensorSummaryTab";

import { Home, Menu, X, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";

// 파이어베이스 관련 import
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

interface DashboardProps {
  onNavigateToLanding: () => void;
}

export function Dashboard({ onNavigateToLanding }: DashboardProps) {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const initialTimestamp = useRef(new Date());

  // 1️⃣ 추가: 토스트 알림 호출 빈도를 제한하기 위한 useRef
  const lastToastTime = useRef(0);
  const TOAST_INTERVAL = 500; // 0.5초 (ms 단위)

  // 🔥 실시간 불량 알림 기능 (쿼리 단순화)
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      where("timestamp", ">", initialTimestamp.current)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            // 데이터 안에서 불량(target_value === 1)인지 확인
            if (data.target_value === 1) {
              // 2️⃣ 추가: 쓰로틀링 로직으로 짧은 시간 내 중복 호출 방지
              const now = Date.now();
              if (now - lastToastTime.current < TOAST_INTERVAL) {
                return; // 0.5초 이내에 호출된 것이면 상태 업데이트를 유발하는 toast를 호출하지 않고 종료
              }
              lastToastTime.current = now; // 마지막 호출 시간 업데이트
              // ----------------------------------------------------

              // 🚨 오류 수정: sensor_data.M_1 값 접근
              const sensorDataM1 = data.sensor_data?.M_1;
              const displayValue =
                typeof sensorDataM1 === "number"
                  ? sensorDataM1.toFixed(2)
                  : "N/A";

              const sensorId = data.sensor_id || "알 수 없는 센서";

              // 💡 팝업 스타일 최종 수정 (강력한 붉은색 강조)
              toast(`🚨 ${sensorId}에서 불량 감지!`, {
                description: `센서 값 (M_1): ${displayValue} - ${new Date(
                  (data.timestamp as Timestamp).seconds * 1000
                ).toLocaleString()}`,
                duration: 10000, // 10초간 표시
                icon: <AlertTriangle className="w-5 h-5 text-red-700" />, // 아이콘 색상 강화

                // 🟢 커스텀 스타일 적용 (전체적으로 붉은색 강조)
                classNames: {
                  title: "text-red-900 font-bold",
                  description: "text-red-900 font-semibold", // ⬅️ 상세 설명 텍스트를 진한 붉은색 및 굵게 설정
                  toast: "bg-red-100 border-red-700 shadow-lg", // ⬅️ 배경과 테두리 색상 강화 (테두리 짙게, 그림자 추가)
                },
              });
            }
          }
        });
      },
      (error) => {
        // Firestore 쿼리 에러 핸들링
        console.error("Firestore 알림 리스너 에러:", error);
        toast.warning("알림 서비스 연결 실패", {
          description:
            "Firestore 인덱스가 필요할 수 있습니다. 개발자 콘솔(F12)을 확인하세요.",
        });
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <DashboardSidebar onDataUpload={setUploadedData} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
            <h1 className="text-2xl">ZeroQ Factory Dashboard</h1>
          </div>
          <Button
            variant="outline"
            onClick={onNavigateToLanding}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="monitoring" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4 w-fit">
              <TabsTrigger value="monitoring">실시간 모니터링</TabsTrigger>
              <TabsTrigger value="alerts">이상 알림 로그</TabsTrigger>
              <TabsTrigger value="summary">기간별 센서 상태</TabsTrigger>
              <TabsTrigger value="charts">차트 분석</TabsTrigger>
              <TabsTrigger value="system">시스템 상태</TabsTrigger>
            </TabsList>

            <TabsContent
              value="monitoring"
              className="flex-1 overflow-auto px-6 pb-6"
            >
              <RealtimeMonitoringTab />
            </TabsContent>

            <TabsContent
              value="alerts"
              className="flex-1 overflow-auto px-6 pb-6"
            >
              <AlertLogTab />
            </TabsContent>

            <TabsContent
              value="summary"
              className="flex-1 overflow-auto px-6 pb-6"
            >
              <SensorSummaryTab />
            </TabsContent>

            <TabsContent
              value="system"
              className="flex-1 overflow-auto px-6 pb-6"
            >
  
            </TabsContent>

            <TabsContent
              value="charts"
              className="flex-1 overflow-auto px-6 pb-6"
            >
              <ChartTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
