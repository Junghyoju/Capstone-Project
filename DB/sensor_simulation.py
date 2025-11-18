import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time
import random
import datetime

cred = credentials.Certificate("firebase_key.json") 
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()

print("🏭 [가상 공장] 센서 가동 시작 (1~300번 순차 전송)...")

# 센서 번호 카운터 (1번부터 시작)
sensor_number = 1

try:
    while True:
        current_time = datetime.datetime.now()
        
        # 불량 확률 5%
        is_defect = 1 if random.random() < 0.05 else 0
        
        sensor_val = random.uniform(70, 80)
        if is_defect:
            sensor_val += random.uniform(20, 30)

        # 센서 ID를 1~300번 순서대로 생성 (예: SENSOR_001)
        sensor_id = f"SENSOR_{sensor_number:03d}"

        data = {
            "sensor_id": sensor_id,
            "sensor_value": sensor_val,
            "target_value": is_defect,
            "timestamp": current_time
        }

        # 파이어베이스 전송
        db.collection("factory_log").add(data)

        status_text = "🚨불량" if is_defect else "✅정상"
        print(f"전송완료 | {sensor_id} | 값: {data['sensor_value']:.2f} | {status_text}")

        # 다음 센서로 이동
        sensor_number += 1
        
        # 300번 넘어가면 다시 1번으로 리셋
        if sensor_number > 300:
            sensor_number = 1

        # 전송 속도 (너무 빠르면 보기 힘드니까 0.2초로 설정)
        time.sleep(2)

except KeyboardInterrupt:
    print("\n🛑 공장 가동 중지.")