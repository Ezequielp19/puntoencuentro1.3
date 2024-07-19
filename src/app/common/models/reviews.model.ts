export interface Reviews {
  id :string;
  servicio_id: string;
  cliente_id : string;
  calificacion: number;
  comentario : string;
  nombreEmpresa?: string;
  nombreCliente?: string;
}
