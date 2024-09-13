export interface Auction {
  id: string;
  city: string;
  currentWinningPrice: number;
  winningUserId: string;
  duration: number;
  createdAt: Date;
  endTime: Date;
  timeRemaining: number;
  isActive: boolean;
  isWinningUser?: boolean;
  isPaid?: boolean;
  lastUpdatedAt: Date;
  isFinished: boolean;  // New field to indicate if the auction is finished
  winningUserName: string;
}
