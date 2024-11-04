export interface User {
  id: string;
  nombre: string;
  correo: string;
  tipo_usuario?: 'cliente' | 'proveedor' | 'admin'
  fecha_registro: Date;
  imagen?: string;
    baneado?: boolean; // Propiedad opcional para indicar si el usuario está baneado

}
