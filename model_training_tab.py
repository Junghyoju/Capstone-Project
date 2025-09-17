import streamlit as st
import numpy as np
import plotly.graph_objects as go
from datetime import datetime, timedelta

def show_model_training_tab():
    st.header("모델 학습")

    # 1. 현재 Recall, F1-Score, AUC, 정밀도
    st.subheader("주요 성능 지표")
    col1_metrics, col2_metrics, col3_metrics, col4_metrics = st.columns(4)
    col1_metrics.metric("Recall", f"{np.random.uniform(85, 99):.2f}%")
    col2_metrics.metric("F1-Score", f"{np.random.uniform(80, 98):.2f}%")
    col3_metrics.metric("AUC", f"{np.random.uniform(75, 95):.2f}%")
    col4_metrics.metric("정밀도", f"{np.random.uniform(88, 99):.2f}%")

    st.markdown("---")

    # 2. 모델 학습 진행 상황
    st.subheader("모델 학습 진행 상황")
    is_training = st.checkbox("학습 진행 중", value=True) # Placeholder for training status

    if is_training:
        st.info("학습 중...")
        current_epoch = np.random.randint(1, 101)
        total_epochs = 100
        st.write(f"**Epoch:** {current_epoch} / {total_epochs}")

        # Placeholder for elapsed time
        elapsed_seconds = np.random.randint(3600, 7200) # 1 to 2 hours
        hours, remainder = divmod(elapsed_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        st.write(f"**경과 시간:** {int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}")
    else:
        st.success("학습 완료!")
        st.write("**Epoch:** 100 / 100")
        st.write("**경과 시간:** 01:35:22") # Example fixed time

    st.markdown("---")

    # 3. 성능 지표 추이 (그래프) 및 손실 함수 추이 (막대그래프)
    st.subheader("학습 추이")
    col_graphs1, col_graphs2 = st.columns(2)

    with col_graphs1:
        st.write("##### 성능 지표 추이")
        epochs = np.arange(1, current_epoch + 1 if is_training else 101)
        recall_data = np.random.uniform(0.7, 0.95, len(epochs))
        f1_data = np.random.uniform(0.65, 0.9, len(epochs))
        auc_data = np.random.uniform(0.7, 0.9, len(epochs))

        fig_perf = go.Figure()
        fig_perf.add_trace(go.Scatter(x=epochs, y=recall_data, mode='lines', name="Recall", line=dict(color='blue')))
        fig_perf.add_trace(go.Scatter(x=epochs, y=f1_data, mode='lines', name="F1-Score", line=dict(color='green')))
        fig_perf.add_trace(go.Scatter(x=epochs, y=auc_data, mode='lines', name="AUC", line=dict(color='red')))
        fig_perf.update_layout(title='성능 지표 추이', xaxis_title='Epoch', yaxis_title='Score')
        st.plotly_chart(fig_perf, use_container_width=True)

    with col_graphs2:
        st.write("##### 손실 함수 추이")
        loss_data = np.random.uniform(0.1, 0.5, len(epochs))
        fig_loss = go.Figure()
        fig_loss.add_trace(go.Bar(x=epochs, y=loss_data, name='Loss', marker_color='purple'))
        fig_loss.update_layout(title='손실 함수 추이', xaxis_title='Epoch', yaxis_title='Loss')
        st.plotly_chart(fig_loss, use_container_width=True)

    st.markdown("---")

    # 4. 모델 설정
    st.subheader("모델 설정")
    st.write(f"**아키텍처:** ResNet50")
    st.write(f"**입력 크기:** 224x224")
    st.write(f"**학습률:** 0.001")
    st.write(f"**옵티마이저:** Adam")
