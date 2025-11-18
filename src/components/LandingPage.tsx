import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowRight, AlertTriangle, Zap, Cpu, TrendingUp, DollarSign, Target, Clock } from 'lucide-react';

interface LandingPageProps {
  onNavigateToDashboard: () => void;
}

export function LandingPage({ onNavigateToDashboard }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <h1 className="text-6xl mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ZeroQ Factory
            </h1>
            <p className="text-2xl text-gray-700 mb-4">스마트팩토리 불량 탐지 시스템</p>
            <p className="text-xl text-gray-600">불량 데이터 불균형 해결 + 실시간 검증 + 경량화 모델</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* 현장의 문제점 */}
        <section className="mb-20">
          <h2 className="text-4xl text-center mb-4 text-gray-900">현장의 문제점</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">기존 스마트팩토리가 직면한 핵심 과제들</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-xl text-center mb-4 text-gray-900">불량 데이터 부족</h3>
              <p className="text-gray-600 text-center">
                정상 데이터 대비 불량 데이터 비율이 극도로 낮아 AI 모델 학습에 어려움
              </p>
            </Card>

            <Card className="p-8 bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Clock className="w-16 h-16 text-yellow-500" />
              </div>
              <h3 className="text-xl text-center mb-4 text-gray-900">실시간 모니터링 한계</h3>
              <p className="text-gray-600 text-center">
                느린 반응 속도로 인한 불량품 처리 비용 증가
              </p>
            </Card>

            <Card className="p-8 bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Cpu className="w-16 h-16 text-purple-500" />
              </div>
              <h3 className="text-xl text-center mb-4 text-gray-900">무거운 AI 모델</h3>
              <p className="text-gray-600 text-center">
                높은 연산 비용과 에너지 소모로 현장 적용 경제성 부족
              </p>
            </Card>
          </div>
        </section>

        {/* ZeroQ의 혁신적 솔루션 */}
        <section className="mb-20">
          <h2 className="text-4xl text-center mb-4 text-gray-900">ZeroQ의 혁신적 솔루션</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">3가지 핵심 기술로 완벽한 불량 탐지 시스템 구현</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Target className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-2xl text-center mb-4 text-blue-900">불균형 데이터 처리</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• SMOTE 알고리즘 적용</li>
                <li>• 클래스 가중치 최적화</li>
                <li>• 데이터 증강 기법</li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Zap className="w-16 h-16 text-cyan-600" />
              </div>
              <h3 className="text-2xl text-center mb-4 text-cyan-900">실시간 IoT 탐지</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 실시간 센서 데이터 분석</li>
                <li>• 즉시 불량 알림 시스템</li>
                <li>• 예측 기반 품질 관리</li>
              </ul>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Cpu className="w-16 h-16 text-purple-600" />
              </div>
              <h3 className="text-2xl text-center mb-4 text-purple-900">경량화 AI 모델</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• ONNX 모델 변환</li>
                <li>• 엣지 디바이스 최적화</li>
                <li>• 90% 연산 비용 절감</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* 성과 및 기대효과 */}
        <section className="mb-20">
          <h2 className="text-4xl text-center mb-4 text-gray-900">성과 및 기대효과</h2>
          <p className="text-center text-gray-600 mb-12 text-lg">실제 데이터로 검증된 놀라운 개선 효과</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <TrendingUp className="w-12 h-12 text-green-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 text-green-600">67.5%</div>
                <div className="text-sm text-gray-700 mb-2">불량률 감소</div>
                <div className="text-xs text-gray-600">8.5% → 2.8%로 대폭 개선</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <DollarSign className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 text-blue-600">₩2.85M</div>
                <div className="text-sm text-gray-700 mb-2">연간 비용 절감</div>
                <div className="text-xs text-gray-600">인건비 + 품질비용 절약</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Target className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 text-purple-600">285%</div>
                <div className="text-sm text-gray-700 mb-2">투자 수익률</div>
                <div className="text-xs text-gray-600">18개월 내 투자 회수 완료</div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                <Zap className="w-12 h-12 text-cyan-600" />
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 text-cyan-600">94.7%</div>
                <div className="text-sm text-gray-700 mb-2">검사 정확도</div>
                <div className="text-xs text-gray-600">높은 신뢰성 확보</div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2 text-yellow-600">73.3%</div>
              <div className="text-sm text-gray-700">검사 시간 단축</div>
            </Card>

            <Card className="p-6 bg-white border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2 text-pink-600">85.7%</div>
              <div className="text-sm text-gray-700">고객 불만 감소</div>
            </Card>

            <Card className="p-6 bg-white border-gray-200 hover:shadow-lg transition-shadow text-center">
              <div className="text-3xl mb-2 text-indigo-600">23.8%</div>
              <div className="text-sm text-gray-700">생산 효율 향상</div>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="p-12 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <h2 className="text-4xl mb-6 text-gray-900">ZeroQ와 함께 스마트팩토리의 미래를 경험하세요</h2>
            <p className="text-xl text-gray-600 mb-8">
              지금 바로 실시간 대시보드로 스마트팩토리의 미래를 확인하실 수 있습니다.
            </p>
            <Button 
              onClick={onNavigateToDashboard}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-6 text-lg"
            >
              대시보드 바로가기
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}
