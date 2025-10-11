import random
import datetime
import time
import firebase_admin
from firebase_admin import credentials, firestore

# firebase_config.py와 중복 실행을 피하기 위해 여기서 직접 초기화
if not firebase_admin._apps:
    cred = credentials.Certificate("smart-factory-dashboard-firebase-adminsdk-fbsvc-34c4a6ad18.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# --- 설정 변경 ---
COLLECTION_NAME = "factory_log"
TOTAL_SENSORS = 300  # 센서 개수를 300으로 설정
# -----------------
print(f"'{COLLECTION_NAME}' 컬렉션에 데이터 저장을 시작합니다. (총 {TOTAL_SENSORS}개 센서)")

# 센서 ID를 1부터 순서대로 생성하기 위한 변수
sensor_index = 1

while True:
    try:
        # ID를 순차적으로 생성 (1, 2, 3, ..., 300, 1, ...)
        sensor_id = f"sensor{sensor_index}"
        
        # 데이터 생성
        data = {
            "sensor_id": sensor_id,
            "timestamp": datetime.datetime.now(),
            "sensor_value": random.uniform(50, 150),
            "target_value": random.choice([0, 1])
        }
        
        # Firestore에 데이터 추가
        db.collection(COLLECTION_NAME).add(data)
        
        print(f"✅ {data['timestamp']} - {data['sensor_id']} 데이터 저장 완료 (값: {data['sensor_value']:.2f}, 상태: {data['target_value']})")
        
        # 다음 센서 ID를 위해 인덱스 증가
        sensor_index += 1
        if sensor_index > TOTAL_SENSORS:
            sensor_index = 1  # 300을 넘어가면 다시 1로 리셋
        
        # 데이터 생성 간격 (0.1초로 줄여 더 빠르게 스트리밍)
        time.sleep(0.1)

    except Exception as e:
        print(f"오류 발생: {e}")
        time.sleep(5)