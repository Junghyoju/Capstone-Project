import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Server, 
  Database, 
  Wifi, 
  Activity, 
  Cpu, 
  HardDrive,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Download,
  User,
  Shield,
} from 'lucide-react';

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

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

interface SensorConnection {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning';
  lastPing: number; // timestamp (ms)
  latency: number;
  dataRate: string;
}

// 300개 센서 초기화
const initialSensors = Array.from({ length: 300 }, (_, i) => {
  const id = `SENSOR_${(i + 1).toString().padStart(3, '0')}`;
  return {
    id,
    name: `라인 ${String.fromCharCode(65 + Math.floor(i/50))} - 센서 ${i+1}`,
    status: 'offline' as 'online' | 'offline' | 'warning',
    lastPing: 0,
    latency: 0,
    dataRate: '0 KB/s',
  };
});

export function SystemStatusTab() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU 사용률', value: 45, unit: '%', status: 'good' },
    { name: '메모리 사용률', value: 62, unit: '%', status: 'good' },
    { name: '디스크 사용률', value: 38, unit: '%', status: 'good' },
    { name: '네트워크 대역폭', value: 156, unit: 'Mbps', status: 'good' },
  ]);

  const [sensorConnections, setSensorConnections] = useState<SensorConnection[]>(initialSensors);
  const sensorConnectionsRef = useRef(sensorConnections);

  const [uptime, setUptime] = useState({
    days: 15,
    hours: 7,
    minutes: 32,
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString('ko-KR'));

  // Firebase/데이터 흐름 상태
  const [dataFlowMetrics, setDataFlowMetrics] = useState({
    firebaseStatus: 'disconnected',
    latency: 0,
    dataReceiveRate: 0,
    dataMissingRate: 0,
    pipelineErrors: 0,
    lastNormalEvent: 'N/A',
    lastAnomalyEvent: 'N/A',
  });

  // 🔥 파이어베이스 실시간 연동
  useEffect(() => {
    const q = query(
      collection(db, "factory_log"),
      orderBy("timestamp", "desc"),
      limit(50) // 최근 50개 데이터로 상태 업데이트
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = Date.now();
      const newSensorConnections = [...sensorConnectionsRef.current];
      let normalEventTime: Date | null = null;
      let anomalyEventTime: Date | null = null;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const sensorId = data.sensor_id;
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
        
        const sensorIndex = newSensorConnections.findIndex(s => s.id === sensorId);
        if (sensorIndex !== -1) {
          newSensorConnections[sensorIndex] = {
            ...newSensorConnections[sensorIndex],
            status: 'online',
            lastPing: timestamp.getTime(),
            latency: now - timestamp.getTime(),
            dataRate: `${(Math.random() * 2 + 1).toFixed(1)} KB/s` // 임의값
          };
        }

        if (data.target_value === 0 && !normalEventTime) {
          normalEventTime = timestamp;
        }
        if (data.target_value === 1 && !anomalyEventTime) {
          anomalyEventTime = timestamp;
        }
      });

      sensorConnectionsRef.current = newSensorConnections;
      setSensorConnections(newSensorConnections);

      setDataFlowMetrics(prev => ({
        ...prev,
        firebaseStatus: 'connected',
        latency: snapshot.docs.length > 0 ? now - (snapshot.docs[0].data().timestamp.toDate().getTime()) : prev.latency,
        dataReceiveRate: snapshot.size,
        lastNormalEvent: normalEventTime ? `${Math.round((now - normalEventTime.getTime()) / 1000)}초 전` : prev.lastNormalEvent,
        lastAnomalyEvent: anomalyEventTime ? `${Math.round((now - anomalyEventTime.getTime()) / 1000)}초 전` : prev.lastAnomalyEvent,
      }));

    }, (error) => {
      console.error("Firebase Error in SystemStatusTab:", error);
      setDataFlowMetrics(prev => ({ ...prev, firebaseStatus: 'error' }));
    });

    // 센서 상태를 주기적으로 체크하여 offline/warning으로 변경
    const statusCheckInterval = setInterval(() => {
      const now = Date.now();
      const updatedConnections = sensorConnectionsRef.current.map(sensor => {
        if (sensor.status === 'online') {
          const timeDiff = now - sensor.lastPing;
          if (timeDiff > 30000) { // 30초 이상 데이터 없으면 offline
            return { ...sensor, status: 'offline' as 'offline' };
          } else if (timeDiff > 10000) { // 10초 이상 데이터 없으면 warning
            return { ...sensor, status: 'warning' as 'warning' };
          }
        }
        return sensor;
      });
      sensorConnectionsRef.current = updatedConnections;
      setSensorConnections(updatedConnections);
      setLastUpdate(new Date().toLocaleTimeString('ko-KR'));
    }, 5000);


    return () => {
      unsubscribe();
      clearInterval(statusCheckInterval);
    };
  }, []);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'offline': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const onlineCount = sensorConnections.filter(s => s.status === 'online').length;
  const warningCount = sensorConnections.filter(s => s.status === 'warning').length;
  const offlineCount = sensorConnections.filter(s => s.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* 시스템 상태 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-900">온라인 센서</div>
          </div>
          <div className="text-3xl text-green-900">{onlineCount}</div>
          <div className="text-xs text-green-700 mt-1">정상 작동 중</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="text-sm text-yellow-900">경고 센서</div>
          </div>
          <div className="text-3xl text-yellow-900">{warningCount}</div>
          <div className="text-xs text-yellow-700 mt-1">주의 필요</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-red-600" />
            <div className="text-sm text-red-900">오프라인 센서</div>
          </div>
          <div className="text-3xl text-red-900">{offlineCount}</div>
          <div className="text-xs text-red-700 mt-1">연결 끊김</div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <div className="text-sm text-blue-900">시스템 가동시간</div>
          </div>
          <div className="text-xl text-blue-900">
            {uptime.days}일 {uptime.hours}시간
          </div>
          <div className="text-xs text-blue-700 mt-1">{uptime.minutes}분</div>
        </Card>
      </div>

      {/* Firebase/데이터 흐름 상태 */}
      <Card className="p-6">
        <h3 className="mb-4">데이터 통신 및 파이프라인 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-600" />
                <span className="text-sm">Firebase 연결</span>
              </div>
              <Badge variant={dataFlowMetrics.firebaseStatus === 'connected' ? 'default' : 'destructive'}>
                {dataFlowMetrics.firebaseStatus === 'connected' ? '연결됨' : '오류'}
              </Badge>
            </div>
            <div className="text-2xl">{dataFlowMetrics.latency}ms</div>
            <div className="text-xs text-gray-600">Latency</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm">데이터 수신량</span>
            </div>
            <div className="text-2xl">{dataFlowMetrics.dataReceiveRate}</div>
            <div className="text-xs text-gray-600">Events / 5s</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">데이터 누락률</span>
            </div>
            <div className="text-2xl text-yellow-700">{dataFlowMetrics.dataMissingRate}%</div>
            <div className="text-xs text-gray-600">Missing Rate (Simulated)</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm">파이프라인 에러</span>
            </div>
            <div className="text-2xl text-red-700">{dataFlowMetrics.pipelineErrors}</div>
            <div className="text-xs text-gray-600">최근 1시간 (Simulated)</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm">최근 정상 이벤트</span>
            </div>
            <div className="text-lg">{dataFlowMetrics.lastNormalEvent}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-sm">최근 이상 이벤트</span>
            </div>
            <div className="text-lg">{dataFlowMetrics.lastAnomalyEvent}</div>
          </div>
        </div>
      </Card>

      {/* 센서 연결 상태 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>센서 연결 정보 (300개)</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4" />
            최근 업데이트: {lastUpdate}
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">센서 ID</TableHead>
                <TableHead>센서 이름</TableHead>
                <TableHead className="w-[100px]">상태</TableHead>
                <TableHead className="w-[120px]">마지막 핑</TableHead>
                <TableHead className="w-[100px]">지연시간</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sensorConnections.map((sensor) => (
                <TableRow 
                  key={sensor.id}
                  className={sensor.status === 'offline' ? 'bg-red-50/50' : sensor.status === 'warning' ? 'bg-yellow-50/50' : ''}
                >
                  <TableCell className="text-xs">{sensor.id}</TableCell>
                  <TableCell className="text-xs">{sensor.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(sensor.status)}
                      <Badge variant={getStatusColor(sensor.status)} className="text-xs">
                        {sensor.status === 'online' ? '온라인' : sensor.status === 'warning' ? '경고' : '오프라인'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {sensor.lastPing > 0 ? `${Math.round((Date.now() - sensor.lastPing) / 1000)}초 전` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span className={sensor.latency > 100 ? 'text-red-600' : 'text-green-600'}>
                      {sensor.latency > 0 ? `${sensor.latency}ms` : 'N/A'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 이하 다른 카드들은 정적 데이터 유지 */}
    </div>
  );
}