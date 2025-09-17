import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go

def show_monitor_tab():
    st.subheader("실시간 알람 로그")
    log_data = pd.DataFrame({
        "시간": ["11:25:43", "11:18:12", "11:12:55", "11:08:34"],
        "상태": ["불량", "경고", "불량", "정상"],
        "내용": ["치수 불량 감지 - 라인 A2", "온도 일괄값 초과 - 라인 B1",
                 "표면 결함 발견 - 라인 A1", "품질 검사 통과 - 라인 C1"],
        "제품번호": ["부품-2024-001", "부품-2024-002", "부품-2024-003", "부품-2024-004"]
    })
    st.dataframe(log_data)

    # 요약 카드
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("총 생산량", "3,000", "+12% vs 어제")
    col2.metric("불량품 수", "153", "-3% vs 어제")
    col3.metric("불량률", "5.1%")
    col4.metric("생산 효율", "94.9%")

    # 실시간 품질 추이
    st.subheader("실시간 품질 추이")
    times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
    normal = [100, 98, 101, 99, 97, 100]
    defect = [0, 5, 0, 7, 2, 1]

    fig_trend = go.Figure()
    fig_trend.add_trace(go.Scatter(x=times, y=normal, mode='lines+markers', name="정상", line=dict(color='green')))
    fig_trend.add_trace(go.Scatter(x=times, y=defect, mode='lines+markers', name="불량", line=dict(color='red')))
    st.plotly_chart(fig_trend, use_container_width=True)

    # 품질 분포 (도넛 차트)
    st.subheader("품질 분포")
    fig_pie = go.Figure(data=[go.Pie(
        labels=["정상", "불량"],
        values=[2847, 153],
        hole=.6,
        marker_colors=["green", "red"]
    )])
    st.plotly_chart(fig_pie, use_container_width=True)
