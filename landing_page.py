import streamlit as st

def landing_page():
    st.set_page_config(page_title="ZeroQ Factory", layout="wide")

    # ===== CSS 스타일 =====
    st.markdown("""
    <style>
    /* 전체 배경 */
    [data-testid="stAppViewContainer"] {
        background: linear-gradient(180deg, #f5faff 0%, #ffffff 100%);
        color: #000000;
        font-family: "Noto Sans KR", sans-serif;
    }
    /* 중앙 텍스트 */
    .main-title {
        text-align: center; font-size: 38px; font-weight: 800;
        margin-top: 2rem; margin-bottom: 1rem;
    }
    .sub-title {
        text-align: center; font-size: 18px; color: #555;
        margin-top: 0.5rem; margin-bottom: 1.5rem;
    }
    .highlight-box {
        background: white; padding: 12px 30px; border-radius: 8px;
        display: inline-block; font-weight: 600; color: #2f4de0;
        font-size: 18px; box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
        margin-top: 2rem; margin-bottom: 2rem;
    }
    /* 버튼 스타일 */
    .stButton>button {
        background: #2f4de0; color: white; border-radius: 8px;
        padding: 0.6rem 1.2rem; font-weight: 600; border: none; width: 100%;
    }
    .stButton>button:hover { background: #1f37a5; }
    /* 섹션 제목 */
    .section-title { text-align: center; font-size: 26px; font-weight: 700;
                      margin-top: 6rem; margin-bottom: 2rem; }
    /* 카드 박스 */
    .card { background: #fff5f5; border-radius: 12px; padding: 1.5rem;
            text-align: center; box-shadow: 0px 2px 8px rgba(0,0,0,0.05); }
    .card h4 { color: #e63946; margin-bottom: 0.5rem; }
    .card p { color: #444; font-size: 15px; }
    /* 솔루션 카드 */
    .solution-card { border-radius: 12px; padding: 1.5rem; text-align: left;
                      box-shadow: 0px 2px 8px rgba(0,0,0,0.05); font-size: 15px; }
    .solution-card h4 { font-size: 18px; font-weight: 700; margin-bottom: 0.8rem; }
    .zeroq-color { color: #5A2D9B; font-weight: bold; }
    </style>
    """, unsafe_allow_html=True)

    # ===== Hero Section =====
    st.markdown('<p style="text-align:center; color:#2f4de0; font-weight:600;">Smart Factory Solution</p>', unsafe_allow_html=True)
    st.markdown('<h1 class="main-title"><span class="zeroq-color">ZeroQ</span> Factory</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-title">스마트팩토리 불량 탐지 시스템</p>', unsafe_allow_html=True)
    st.markdown('<div style="text-align:center;"><span class="highlight-box">불량 데이터 불균형 해결 + 실시간 검증 + 경량화 모델</span></div>', unsafe_allow_html=True)

    # ===== 버튼 바로 아래로 이동 =====
    col_left, col_btn, col_right = st.columns([1.5, 0.3, 1.5])
    with col_btn:
        if st.button("대시보드 체험하기"):
            st.session_state.page = "dashboard"
    st.markdown("<br><br><br>", unsafe_allow_html=True)

    # ===== 문제점 Section =====
    st.markdown('<h2 class="section-title">현장의 문제점</h2>', unsafe_allow_html=True)
    st.markdown('<p style="text-align:center; color:#666;">기존 스마트팩토리가 직면한 핵심 과제들</p>', unsafe_allow_html=True)
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown('<div class="card"><h4>불량 데이터 부족</h4><p>정상 데이터 대비 불량 데이터 비율이 극도로 낮아 AI 모델 학습에 어려움</p></div>', unsafe_allow_html=True)
    with c2:
        st.markdown('<div class="card"><h4>실시간 모니터링 한계</h4><p>느린 반응 속도로 인한 불량품 추리 비용 증가</p></div>', unsafe_allow_html=True)
    with c3:
        st.markdown('<div class="card"><h4>무거운 AI 모델</h4><p>높은 연산 비용과 에너지 소모로 현장 적용 경제성 부족</p></div>', unsafe_allow_html=True)

    # ===== 솔루션 Section =====
    st.markdown("<br><br><br><br>", unsafe_allow_html=True)
    st.markdown('<h2 class="section-title"><span class="zeroq-color">ZeroQ</span>의 혁신적 솔루션</h2>', unsafe_allow_html=True)
    st.markdown('<p style="text-align:center; color:#666;">3가지 핵심 기술로 완벽한 불량 탐지 시스템 구현</p>', unsafe_allow_html=True)
    s1, s2, s3 = st.columns(3)
    with s1:
        st.markdown('<div class="solution-card" style="background:#f0fff4;"><h4>불균형 데이터 처리</h4><ul><li>SMOTE 알고리즘 적용</li><li>클래스 가중치 최적화</li><li>데이터 증강 기법</li></ul></div>', unsafe_allow_html=True)
    with s2:
        st.markdown('<div class="solution-card" style="background:#f0f8ff;"><h4>실시간 IoT 탐지</h4><ul><li>실시간 센서 데이터 분석</li><li>즉시 불량 알림 시스템</li><li>예측 기반 품질 관리</li></ul></div>', unsafe_allow_html=True)
    with s3:
        st.markdown('<div class="solution-card" style="background:#faf5ff;"><h4>경량화 AI 모델</h4><ul><li>ONNX 모델 변환</li><li>엣지 디바이스 최적화</li><li>90% 연산 비용 절감</li></ul></div>', unsafe_allow_html=True)

    # ===== 성과 및 기대효과 Section (맨 아래) =====
    st.markdown("<br><br><br><br><br>", unsafe_allow_html=True)
    st.markdown('<h2 class="section-title">성과 및 기대효과</h2>', unsafe_allow_html=True)
    st.markdown('<p style="text-align:center; color:#555; font-size:16px;">실제 데이터로 검증된 놀라운 개선 효과</p>', unsafe_allow_html=True)

    # 주요 3가지 KPI 카드
    kpi1, kpi2, kpi3 = st.columns(3, gap="large")
    with kpi1:
        st.markdown("""
        <div style="background:#eaf7ea; border-radius:12px; padding:2rem; text-align:center;">
            <div style="font-size:32px; font-weight:700; color:#2f8f2f;">67.5%</div>
            <div style="font-size:16px; color:#2f8f2f; margin-bottom:4px;">불량률 감소</div>
            <div style="font-size:14px; color:#4c4c4c;">8.5% → 2.8%로 대폭 개선</div>
        </div>
        """, unsafe_allow_html=True)
    with kpi2:
        st.markdown("""
        <div style="background:#e5f0ff; border-radius:12px; padding:2rem; text-align:center;">
            <div style="font-size:32px; font-weight:700; color:#2f4de0;">₩2.85M</div>
            <div style="font-size:16px; color:#2f4de0; margin-bottom:4px;">연간 비용 절감</div>
            <div style="font-size:14px; color:#4c4c4c;">인건비 + 품질비용 절약</div>
        </div>
        """, unsafe_allow_html=True)
    with kpi3:
        st.markdown("""
        <div style="background:#f5ebff; border-radius:12px; padding:2rem; text-align:center;">
            <div style="font-size:32px; font-weight:700; color:#8f2fd6;">285%</div>
            <div style="font-size:16px; color:#8f2fd6; margin-bottom:4px;">투자 수익률</div>
            <div style="font-size:14px; color:#4c4c4c;">18개월 내 투자 회수 완료</div>
        </div>
        """, unsafe_allow_html=True)

    # ===== 하단 KPI 깔끔한 박스 =====
    st.markdown("<br><br>", unsafe_allow_html=True)
    st.markdown("""
    <div style="
        background-color: #f5f5f5;
        border-radius: 12px;
        padding: 20px 0;
        display: flex;
        justify-content: space-around;
    ">
        <div style="text-align:center; width:20%;">
            <div style="font-size:18px; font-weight:700; color:#000;">94.7%</div>
            <div style="font-size:14px; color:#555;">검사 정확도</div>
        </div>
        <div style="text-align:center; width:20%;">
            <div style="font-size:18px; font-weight:700; color:#000;">73.3%</div>
            <div style="font-size:14px; color:#555;">검사 시간 단축</div>
        </div>
        <div style="text-align:center; width:20%;">
            <div style="font-size:18px; font-weight:700; color:#000;">85.7%</div>
            <div style="font-size:14px; color:#555;">고객 불만 감소</div>
        </div>
        <div style="text-align:center; width:20%;">
            <div style="font-size:18px; font-weight:700; color:#000;">23.8%</div>
            <div style="font-size:14px; color:#555;">생산 효율 향상</div>
        </div>
    </div>
    """, unsafe_allow_html=True)



    # ===== 제일 아래 안내 문구 =====
    st.markdown("<br><br><br>", unsafe_allow_html=True)
    st.markdown('<h2 style="text-align:center; color:#2f4de0; font-weight:800; font-size:28px;">ZeroQ와 함께 스마트팩토리의 미래를 경험하세요.</h2>', unsafe_allow_html=True)
    st.markdown('<p style="text-align:center; color:#666; font-size:18px; margin-top:1rem;">지금 바로 실시간 대시보드로 스마트팩토리의 미래를 확인하실 수 있습니다</p>', unsafe_allow_html=True)
    st.markdown("<br>", unsafe_allow_html=True) # Add some space

    col_left_bottom, col_btn_bottom, col_right_bottom = st.columns([1.5, 0.3, 1.5])
    with col_btn_bottom:
        if st.button("대시보드 바로가기", key="dashboard_bottom_button"):
            st.session_state.page = "dashboard"


if __name__ == "__main____":
    landing_page()
