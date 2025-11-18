import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DashboardSidebar } from "./DashboardSidebar";
import { StreamingTab } from "./StreamingTab";
import { ChartTab } from "./ChartTab";
import { RealtimeMonitoringTab } from "./RealtimeMonitoringTab";
import { AlertLogTab } from "./AlertLogTab";
import { SensorSummaryTab } from "./SensorSummaryTab";
import { SystemStatusTab } from "./SystemStatusTab";
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

  // 🔥 실시간 불량 알림 기능
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      where("target_value", "==", 1),
      where("timestamp", ">", initialTimestamp.current)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const sensorId = data.sensor_id || "알 수 없는 센서";

          toast.error(`🚨 ${sensorId}에서 불량 감지!`, {
            description: `센서 값: ${data.sensor_value.toFixed(2)} - ${new Date(
              data.timestamp.seconds * 1000
            ).toLocaleString()}`,
            duration: 10000, // 10초간 표시
            icon: <AlertTriangle className="w-5 h-5" />,
          });
        }
      });
    });

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
              <TabsTrigger value="system">시스템 상태</TabsTrigger>
              <TabsTrigger value="streaming">실시간 스트리밍</TabsTrigger>
              <TabsTrigger value="charts">차트 분석</TabsTrigger>
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
              <SystemStatusTab />
            </TabsContent>

            <TabsContent
              value="streaming"
              className="flex-1 overflow-auto px-6 pb-6"
            >
              <StreamingTab uploadedData={uploadedData} />
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
