import streamlit as st
import pandas as pd
import plotly.express as px
from firebase_config import db
from streamlit_autorefresh import st_autorefresh

def get_unified_log_data(limit=100): # 차트 계산을 위해 데이터 로딩량 증가
    """
    'factory_log' 컬렉션에서 모든 센서의 최신 데이터를 가져옵니다.
    """
    try:
        docs_stream = db.collection("factory_log").order_by("timestamp", direction="DESCENDING").limit(limit).stream()
        data = [doc.to_dict() for doc in docs_stream]
        if data:
            return pd.DataFrame(data)
        else:
            return pd.DataFrame()
    except Exception as e:
        return pd.DataFrame()

def show_monitor_tab():
    # 2초마다 이 탭을 새로고침
    st_autorefresh(interval=2000, limit=None, key="log_refresh")

    st.header("실시간 통합 알람 로그")
    
    # 깜빡임 방지를 위한 빈 컨테이너
    placeholder = st.empty()

    with placeholder.container():
        df_log = get_unified_log_data()

        if not df_log.empty:
            # --- 실시간 로그 표시 ---
            df_display = pd.DataFrame()
            df_display["시간"] = df_log["timestamp"].apply(lambda x: x.strftime("%Y-%m-%d %H:%M:%S"))
            df_display["센서 ID"] = df_log["sensor_id"]
            df_display["센서 값"] = df_log["sensor_value"].round(2)
            df_display["상태"] = df_log["target_value"].apply(lambda x: "🔴 불량" if x == 1 else "🟢 정상")
            st.dataframe(df_display, use_container_width=True, hide_index=True)

            # --- 차트 추가 ---
            st.markdown("---") # 구분선 추가
            st.subheader("실시간 데이터 분석")

            col1, col2 = st.columns(2)

            with col1:
                # 1. 품질 분포 (도넛 차트)
                status_counts = df_log["target_value"].apply(lambda x: "불량" if x == 1 else "정상").value_counts()
                fig_donut = px.pie(
                    values=status_counts.values, 
                    names=status_counts.index, 
                    title="품질 분포",
                    hole=0.4,
                    color=status_counts.index,
                    color_discrete_map={"정상": "green", "불량": "red"}
                )
                st.plotly_chart(fig_donut, use_container_width=True)

            with col2:
                # 2. 센서별 활동 (바 차트)
                sensor_counts = df_log["sensor_id"].value_counts().sort_index()
                fig_bar = px.bar(
                    x=sensor_counts.index, 
                    y=sensor_counts.values,
                    title="센서별 감지 빈도",
                    labels={'x': '센서 ID', 'y': '감지 횟수'}
                )
                st.plotly_chart(fig_bar, use_container_width=True)
        else:
            st.info("데이터 수신 대기 중... `new_producer.py`가 실행 중인지 확인하세요.")