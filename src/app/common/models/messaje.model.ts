import { Timestamp } from "@angular/fire/firestore";

export interface Message {
  id?: string;
  senderId: string;
  messageText: string;
  timestamp: Timestamp;
}
