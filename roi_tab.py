import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go

def show_roi_tab():
    # st.header("ROI 분석") # Removed as per user request for other tabs

    # 1. Top Section: Key ROI Metrics
    st.subheader("주요 ROI 지표")
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("총 절약액", "₩2.8M", help="연간 기준")
        st.write("<small>연간 기준</small>", unsafe_allow_html=True)
    with col2:
        st.metric("불량률 감소", "67.5%")
    with col3:
        st.metric("생산 효율 증가", "23.8%")
    with col4:
        st.metric("투자 수익률", "285.7%")
        st.write("<small>18개월 기준</small>", unsafe_allow_html=True)

    st.markdown("---")

    # 2. Monthly Cost Savings (Bar Chart) and Cost Savings Composition (Pie Chart)
    st.subheader("비용 절감 현황")
    col_bar, col_pie = st.columns(2)

    with col_bar:
        st.write("#### 월별 비용 절약 현황")
        months = pd.date_range(start="2023-01", periods=12, freq="M").strftime("%Y-%m")
        savings = np.random.randint(100, 500, 12) * 1000 # in KRW
        operating_costs = np.random.randint(50, 200, 12) * 1000 # in KRW

        fig_bar = go.Figure(data=[
            go.Bar(name='절약액', x=months, y=savings, marker_color='#4CAF50'),
            go.Bar(name='운영비', x=months, y=operating_costs, marker_color='#FFC107')
        ])
        fig_bar.update_layout(barmode='group', title_text='월별 절약액 및 운영비')
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_pie:
        st.write("#### 비용 절약 구성")
        labels = ['인건비 절약', '품질 비용 절약', '재료비 절약', '기타 절약']
        values = np.random.randint(10, 40, 4) * 100000

        fig_pie = go.Figure(data=[go.Pie(labels=labels, values=values, pull=[0, 0, 0, 0])])
        fig_pie.update_layout(title_text='비용 절약 구성')
        st.plotly_chart(fig_pie, use_container_width=True)

    st.markdown("---")

    # 3. Production Improvement Indicators
    st.subheader("생산 개선 지표")
    col_metric1, col_metric2, col_metric3, col_metric4 = st.columns(4)

    with col_metric1:
        st.write("##### 불량률 감소")
        st.metric("이전", "10.5%")
        st.metric("현재", "3.0%")
    with col_metric2:
        st.write("##### 검사 시간")
        st.metric("이전", "15분")
        st.metric("현재", "5분")
    with col_metric3:
        st.write("##### 재작업률")
        st.metric("이전", "8.0%")
        st.metric("현재", "2.0%")
    with col_metric4:
        st.write("##### 고객 불만")
        st.metric("이전", "25건")
        st.metric("현재", "5건")

    st.markdown("---")

    # 4. ROI Trend (Line Graph) and Investment Recovery Status
    st.subheader("투자 수익률 추이")
    roi_periods = ["초기 투자", "3개월", "6개월", "9개월", "12개월", "18개월", "24개월"]
    roi_values = [-100000000, -80000000, -30000000, 10000000, 50000000, 150000000, 285700000] # Dummy values

    fig_roi_trend = go.Figure(data=go.Scatter(x=roi_periods, y=roi_values, mode='lines+markers', name='수익/비용'))
    fig_roi_trend.update_layout(title='투자 수익률 추이', xaxis_title='기간', yaxis_title='수익/비용 (₩)')
    st.plotly_chart(fig_roi_trend, use_container_width=True)

    st.success("**투자 회수 완료!**")
    st.write("9개월 만에 투자 비용을 회수했으며, 18개월 후 285.7%의 수익률을 달성했습니다.")

    st.markdown("---")

    # 5. Key Performance
    st.subheader("핵심 성과")
    col_kp1, col_kp2, col_kp3 = st.columns(3)

    with col_kp1:
        st.write("#### 비용 절감")
        st.write("인건비: ₩150K 절약")
        st.write("품질 비용: ₩80K 절약")
        st.write("다운타임: 78.2% 감소")
    with col_kp2:
        st.write("#### 품질 향상")
        st.write("불량률: 67.5% 감소")
        st.write("검사 정확도: 94.7% 달성")
        st.write("고객 만족도: 85.7% 향상")
    with col_kp3:
        st.write("#### 생산 효율")
        st.write("생산성: 23.8% 증가")
        st.write("처리 속도: 73.3% 향상")
        st.write("재작업: 74.8% 감소")