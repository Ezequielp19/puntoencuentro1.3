export interface Auction {
  id: string;
  city: string;
  initialPrice: number;  // Nuevo campo: Monto inicial de la subasta
  currentWinningPrice: number;  // Nuevo campo: Monto actual del ganador
  winningUserId: string;  // Nuevo campo: ID del usuario que está ganando la subasta
  duration: number;  // Duración en horas
  startTime: Date;  // Fecha y hora de inicio de la subasta
}
