import { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, ChevronDown, ChevronUp, FileText, Database } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Badge } from './ui/badge';

interface DashboardSidebarProps {
  onDataUpload: (data: any[]) => void;
}

export function DashboardSidebar({ onDataUpload }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      try {
        let data: any[] = [];
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parsing
          const lines = text.split('\n');
          const headers = lines[0].split(',');
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index]?.trim();
              return obj;
            }, {} as any);
          });
        }

        setUploadedFiles(prev => [...prev, file.name]);
        setTotalRecords(prev => prev + data.length);
        setProcessedRecords(prev => prev + data.length);
        onDataUpload(data);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="w-80 bg-slate-900 text-white p-6 flex flex-col gap-6 overflow-y-auto h-screen">
      {/* File Upload Section */}
      <Card className="p-4 bg-slate-800 border-slate-700 flex-shrink-0">
                                                <h3 className="mb-4 flex items-center gap-2 text-white text-base">
                                                  <Upload className="w-5 h-5" />
                                                  데이터 업로드
                                                </h3>        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          파일 선택 (CSV, JSON)
        </Button>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-400">업로드된 파일:</p>
            {uploadedFiles.map((filename, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="truncate">{filename}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Data Processing Status - Collapsible */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="bg-slate-800 border-slate-700 flex-shrink-0">
          <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-white" />
              <h3 className="text-white text-base">현재 데이터 처리 현황</h3>
            </div>
            {isOpen ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">총 레코드</span>
                <Badge variant="secondary">{totalRecords.toLocaleString()}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">처리 완료</span>
                <Badge className="bg-green-600">{processedRecords.toLocaleString()}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">처리율</span>
                <Badge className="bg-blue-600">
                  {totalRecords > 0 ? ((processedRecords / totalRecords) * 100).toFixed(1) : 0}%
                </Badge>
              </div>

              <div className="pt-2 border-t border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">정상 데이터</span>
                  <span className="text-sm text-green-400">85.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">불량 데이터</span>
                  <span className="text-sm text-red-400">14.8%</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Quick Stats */}
      <Card className="p-4 bg-slate-800 border-slate-700 flex-shrink-0">
        <h3 className="mb-4 text-white text-base">실시간 통계</h3>
        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-1">금일 검사 건수</div>
            <div className="text-2xl">1,247</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">금일 불량 건수</div>
            <div className="text-2xl text-red-400">35</div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">불량률</div>
            <div className="text-2xl text-yellow-400">2.8%</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
