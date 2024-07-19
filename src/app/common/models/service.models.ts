export interface Service {
  id: string;
  providerId: string;
  email: string;
  nombreEmpresa: string;
  description: string;
  telefono: string;
  category: string;
  sobreNosotros: string;
  price: number;
  servicio: string;
  dirreccion: string;

  ciudad:string;

  imageUrl: string;
  horarios: any[];
  instagram?: string;
  whatsapp?: string;
  facebook?: string;
  website?: string;

}
