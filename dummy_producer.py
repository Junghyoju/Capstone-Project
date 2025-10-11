import random, datetime, time
from firebase_config import db

def insert_dummy_data():
    db.collection("sensor_data").document().set({
        "timestamp": datetime.datetime.now().isoformat(),
        "temperature": random.uniform(20, 30),
        "humidity": random.uniform(40, 60),
        "defect_rate": random.uniform(0, 5)
    })

if __name__ == "__main__":
    while True:
        insert_dummy_data()
        print("더미 데이터 삽입 완료")
        time.sleep(5)
