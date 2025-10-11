from datetime import datetime
import random
import time
from firebase_config import db

# 테스트용: 3번만 반복하고 종료
while True:  # 원하는 횟수로 조정 가능
    for i in range(1, 51):  # sensor1 ~ sensor50
        sensor_doc = db.collection("test_data").document(f"sensor{i}")
        
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        data = {
            "sensor_value": random.randint(50, 150),  # 임시 센서 값
            "timestamp": timestamp,
            "target_value": random.choice([0, 1])           # 불량 여부
        }
        
        sensor_doc.collection("records").document(timestamp).set(data)
    
    print(f"✅ 센서 데이터 저장 완료 ({timestamp})")
    time.sleep(2)  # 2초마다 기록 (테스트니까 짧게)
