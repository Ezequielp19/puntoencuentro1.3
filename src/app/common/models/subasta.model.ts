// auction.model.ts (Actualiza el modelo si no lo has hecho)
export interface Auction {
  id: string;
  city: string;
  initialPrice: number;
  currentWinningPrice: number;
  winningUserId: string;
  duration: number;  // Duración en horas
  createdAt: Date;  // Fecha y hora de creación de la subasta
  endTime: Date;  // Fecha y hora de finalización de la subasta
  timeRemaining: number;  // Tiempo restante en segundos
}
