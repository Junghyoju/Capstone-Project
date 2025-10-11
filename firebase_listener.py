# firebase_listener.py
from firebase_config import db

def listen_to_firestore(callback):
    col_query = db.collection("sensor_data").order_by("timestamp", direction="DESCENDING").limit(50)

    def on_snapshot(col_snapshot, changes, read_time):
        logs = []
        for doc in col_snapshot:
            logs.append(doc.to_dict())
        callback(logs)

    col_query.on_snapshot(on_snapshot)
