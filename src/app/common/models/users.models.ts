export interface User {
  id: string;
  nombre: string;
  correo: string;
  tipo_usuario?: 'cliente' | 'proveedor' | 'admin'
  fecha_registro: Date;
  imagen?: string;
}
