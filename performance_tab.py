import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import numpy as np

def show_performance_tab():
    # 1. Key Performance Metrics
    st.subheader("주요 성능 지표")
    col1, col2, col3, col4, col5 = st.columns(5)
    
    # Dummy data for metrics
    # (실제 값 계산 로직)
    tn, fp, fn, tp = 850, 50, 70, 930
    total = tn + fp + fn + tp
    accuracy = (tp + tn) / total * 100
    precision = tp / (tp + fp) * 100 if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) * 100 if (tp + fn) > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    specificity = tn / (tn + fp) * 100 if (tn + fp) > 0 else 0

    with col1:
        st.metric("정확도", f"{accuracy:.1f}%")
    with col2:
        st.metric("정밀도", f"{precision:.1f}%")
    with col3:
        st.metric("재현율", f"{recall:.1f}%")
    with col4:
        st.metric("F1-Score", f"{f1_score:.1f}%")
    with col5:
        st.metric("특이도", f"{specificity:.1f}%")

    st.markdown("---")

    # 2. Confusion Matrix and Radar Chart
    col_cm, col_radar = st.columns(2)

    with col_cm:
        st.write("#### 혼동 행렬 (Confusion Matrix)")
        
        # Plotly Heatmap for a better UI
        conf_matrix_data = np.array([[tn, fp], [fn, tp]])
        labels = ['정상', '불량']

        fig_cm = go.Figure(data=go.Heatmap(
            z=conf_matrix_data,
            x=labels,
            y=labels,
            hoverongaps=False,
            colorscale='Blues',
            reversescale=False,
            text=conf_matrix_data,
            texttemplate="%{text}",
            # [수정된 부분] 히트맵 내부의 폰트 크기 키움
            textfont={"size":20} 
        ))

        fig_cm.update_layout(
            title_text=' ', # No title inside the plot
            xaxis_title='예측 (Predicted)',
            yaxis_title='실제 (Actual)',
            yaxis=dict(autorange='reversed'), # Puts '정상' (TN) at the top-left
            height=400
        )
        
        st.plotly_chart(fig_cm, use_container_width=True)


    with col_radar:
        st.write("#### 성능 지표 레이더")
        categories = ['정확도', '정밀도', '재현율', 'F1-Score', '특이도']
        # Use calculated values for the radar chart
        values = [accuracy, precision, recall, f1_score, specificity]

        fig = go.Figure()

        fig.add_trace(go.Scatterpolar(
            r=values,
            theta=categories,
            fill='toself',
            name='성능 지표'
        ))

        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, 100]
                )),
            showlegend=False,
            height=400 # Adjust height for better fit
        )
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("---")

    # 3. Performance Trend
    st.subheader("성능 변화 추이")
    dates = pd.date_range(start="2024-01-01", periods=30, freq="D")
    performance_values = np.random.rand(30) * 20 + 70
    performance_df = pd.DataFrame({
        "날짜": dates,
        "정확도": performance_values
    })
    performance_df = performance_df.set_index("날짜")
    st.line_chart(performance_df)

    st.markdown("---")

    # 4. Class-wise Performance Analysis
    st.subheader("클래스별 성능 분석")
    class_performance_data = {
        "클래스": ["표면 결함", "치수 불량", "색상 이상", "형태 불량"],
        "정밀도 (%)": [85.0, 90.5, 88.0, 92.0],
        "재현율 (%)": [87.0, 89.0, 86.5, 91.0],
        "F1-Score (%)": [86.0, 89.7, 87.2, 91.5],
        "샘플 수": [120, 95, 70, 110]
    }
    class_performance_df = pd.DataFrame(class_performance_data)
    st.dataframe(class_performance_df, use_container_width=True)