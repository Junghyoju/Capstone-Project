// stream_firestore.js

const admin = require("firebase-admin");
const fs = require("fs");

// 1. 🔑 Admin Key 파일 경로 설정 (이전과 동일)
const serviceAccount = require("./admin_key.json");
// 2. 📁 JSON 데이터 파일 경로 설정
const DATA_FILE = "./firebase_secom_1_to_9_dummies_clean.json";

// Firestore 컬렉션 이름
const COLLECTION_NAME = "factory_log";

// 문서 삽입 간 지연 시간 (밀리초 단위)
const DELAY_MS = 1000; // 1초 지연

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ISO 문자열 시간을 Firestore Timestamp 객체로 변환하는 함수
function convertTimestamp(isoString) {
  if (!isoString) return admin.firestore.Timestamp.now();
  try {
    const date = new Date(isoString);
    return admin.firestore.Timestamp.fromDate(date);
  } catch (e) {
    return admin.firestore.Timestamp.now();
  }
}

// 비동기 지연 함수 (await delay(1000)처럼 사용)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function streamDataToFirestore() {
  // 3. JSON 파일 로드
  let data;
  try {
    const jsonString = fs.readFileSync(DATA_FILE, "utf8");
    data = JSON.parse(jsonString);
  } catch (error) {
    console.error(
      `❌ 오류: 데이터를 로드할 수 없습니다. 파일 경로: ${DATA_FILE}`
    );
    return;
  }

  const totalDocs = data.length;
  console.log(
    `\n총 ${totalDocs}개의 데이터를 1초 간격으로 순차 스트리밍합니다.`
  );
  console.log(`컬렉션: ${COLLECTION_NAME}`);

  // 데이터가 시간 순서대로 삽입되도록 정렬
  data.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let docsStreamed = 0;

  for (const docData of data) {
    // 4. 데이터 삽입 실행
    try {
      const processedData = {
        ...docData,
        // Timestamp는 현재 시간으로 업데이트하여 실시간 효과를 극대화합니다.
        // (업로드 스크립트 실행 시점의 시간으로 Timestamp를 갱신)
        timestamp: admin.firestore.Timestamp.now(),
      };

      // Firestore에 문서 추가 (자동 ID 사용)
      await db.collection(COLLECTION_NAME).add(processedData);

      docsStreamed++;
      console.log(
        `✅ [${docsStreamed}/${totalDocs}] 문서 스트리밍 성공. 센서 ID: ${docData.sensor_id}`
      );
    } catch (error) {
      console.error(`❌ 문서 삽입 중 오류 발생:`, error);
    }

    // 5. 1초 대기
    await delay(DELAY_MS);
  }

  console.log(
    `\n🎉 순차 스트리밍 완료! 총 ${docsStreamed}개의 문서가 ${COLLECTION_NAME}에 추가되었습니다.`
  );
}

streamDataToFirestore().catch(console.error);
