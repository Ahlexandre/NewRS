import {
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

function toMillis(value) {
  if (!value || typeof value.toDate !== "function") {
    return 0;
  }
  return value.toDate().getTime();
}

export default class FirestoreReadService {
  constructor(db) {
    this.db = db;
  }

  subscribeToMessages(onData, onError) {
    const messagesRef = collection(this.db, "messages");

    return onSnapshot(
      messagesRef,
      snapshot => {
        const messages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => {
            const aTime = toMillis(a.createdAt) || toMillis(a.timestamp);
            const bTime = toMillis(b.createdAt) || toMillis(b.timestamp);
            return bTime - aTime;
          });

        onData(messages);
      },
      onError
    );
  }
}
