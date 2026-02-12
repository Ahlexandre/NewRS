import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export default class FirestoreWriteService {
  constructor(db) {
    this.db = db;
  }

  async createMessage(content, user) {
    const sanitizedContent = content.trim();
    if (!sanitizedContent) {
      throw new Error("Le message ne peut pas etre vide.");
    }

    const sentAt = serverTimestamp();

    return addDoc(collection(this.db, "messages"), {
      content: sanitizedContent,
      uid: user.uid,
      email: user.email,
      createdAt: sentAt,
      timestamp: sentAt
    });
  }
}
