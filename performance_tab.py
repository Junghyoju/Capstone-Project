import streamlit as st
import pandas as pd
import plotly.graph_objects as go
import numpy as np

def show_performance_tab():
    

    # 1. Key Performance Metrics
    st.subheader("주요 성능 지표")
    col1, col2, col3, col4, col5 = st.columns(5)
    
    # Dummy data for metrics
    accuracy = 92.5
    precision = 88.2
    recall = 90.1
    f1_score = 89.1
    specificity = 94.3

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
        # Dummy data for Confusion Matrix
        tn = 850 # 예측: 정상, 실제: 정상 (True Negative)
        fp = 50  # 예측: 불량, 실제: 정상 (False Positive)
        fn = 70  # 예측: 정상, 실제: 불량 (False Negative)
        tp = 930 # 예측: 불량, 실제: 불량 (True Positive)

        st.write("#### 혼동 행렬 (Confusion Matrix)")
        
        # Custom HTML for confusion matrix to control styling and remove indices
        st.markdown(f"""
        <style>
            .confusion-matrix-table {{
                width: 100%;
                border-collapse: collapse;
                font-size: 1.2em; /* Larger font size */
                text-align: center;
                margin-top: 10px;
            }}
            .confusion-matrix-table th, .confusion-matrix-table td {{
                border: 1px solid #ddd;
                padding: 15px; /* More padding for larger cells */
            }}
            .confusion-matrix-table th {{
                background-color: #f2f2f2;
            }}
            .confusion-matrix-table .header-label {{
                font-weight: bold;
                background-color: #e0e0e0;
            }}
        </style>
        <table class="confusion-matrix-table">
            <tr>
                <th></th>
                <th colspan="2">예측</th>
            </tr>
            <tr>
                <th class="header-label"></th>
                <th>정상</th>
                <th>불량</th>
            </tr>
            <tr>
                <th rowspan="2" class="header-label">실제</th>
                <th>정상</th>
                <td>{tn}</td>
                <td>{fp}</td>
            </tr>
            <tr>
                <th>불량</th>
                <td>{fn}</td>
                <td>{tp}</td>
            </tr>
        </table>
        """, unsafe_allow_html=True)


    with col_radar:
        st.write("#### 성능 지표 레이더")
        categories = ['정확도', '정밀도', '재현율', 'F1-Score', '특이도']
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
    # Dummy data for performance trend
    dates = pd.date_range(start="2024-01-01", periods=30, freq="D")
    performance_values = np.random.rand(30) * 20 + 70 # Values between 70 and 90
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