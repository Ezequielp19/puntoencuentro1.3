export interface Auction {
  id: string;
  city: string;
  currentWinningPrice: number;
  winningUserId: string;
  createdAt: string;
  endTime: string;
  isActive: boolean;
  isPaid?: boolean;
  isFinished: boolean;  // New field to indicate if the auction is finished
  winningUserName: string;
  serviceId: string;
}
