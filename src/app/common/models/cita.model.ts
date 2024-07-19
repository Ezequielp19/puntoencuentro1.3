
export interface Citas {
  id: string;
  servicio_id: string;
  usuario_id: string;
  fecha_cita: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada';
  nombre: string;
  nombreEmpresa: string;
}
