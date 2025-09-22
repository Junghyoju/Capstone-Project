 if 'page' not in st.session_state:
        st.session_state.page = 'landing'

    col_left, col_btn, col_right = st.columns([1.5, 0.3, 1.5]) # Adjust column ratios for centering a single button
    with col_btn:
        if st.button("대시보드 체험하기"): 
            st.session_state.page = "dashboard"
