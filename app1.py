import streamlit as st
import pandas as pd
import numpy as np
import time
import plotly.express as px
import plotly.graph_objects as go

from monitor_tab import show_monitor_tab
from model_training_tab import show_model_training_tab
from performance_tab import show_performance_tab
from roi_tab import show_roi_tab
from landing_page import landing_page

# 페이지 설정
st.set_page_config(page_title="Smart Factory Defect Detection", layout="wide")

# 세션 상태 초기화
if 'page' not in st.session_state:
    st.session_state.page = 'landing'

if st.session_state.page == 'landing':
    landing_page()
else:
    # =========================
    # 사이드바
    # =========================
    st.sidebar.title("데이터 관리")

    # 파일 업로드
    uploaded_csv = st.sidebar.file_uploader("CSV 파일 업로드", type=["csv"])
    uploaded_zip = st.sidebar.file_uploader("이미지 ZIP 업로드", type=["zip"])
    uploaded_json = st.sidebar.file_uploader("JSON 파일 업로드", type=["json"])

    # 처리 현황 카드
    st.sidebar.subheader("처리 현황")
    total_data = st.sidebar.metric("총 데이터", "1,247,892")
    today_processed = st.sidebar.metric("오늘 처리량", "24,567")
    st.sidebar.progress(96.5 / 100)
    st.sidebar.write("대기열 23개")

    # 시스템 상태
    st.sidebar.subheader("시스템 상태")
    st.sidebar.success("센서 연결")
    st.sidebar.success("카메라 상태")
    st.sidebar.success("모델 서버")
    st.sidebar.success("DB 연결")

    # =========================
    # 메인 화면
    # =========================
    st.title("스마트팩토리 불량 판별 시스템")
    st.write("실시간 제품 품질 모니터링 및 분석")

    # 탭
    tabs = st.tabs(["실시간 모니터링", "모델 학습", "성능 분석", "ROI 분석"])

    with tabs[0]:
        show_monitor_tab()

    with tabs[1]:
        show_model_training_tab()

    with tabs[2]:
        show_performance_tab()

    with tabs[3]:
        show_roi_tab()
