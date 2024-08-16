

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


  // Nuevos campos para el sistema de publicidad
  monthlyFeePaid?: boolean;    // Indica si el canon mensual ha sido pagado
  monthlyFeeAmount?: number;   // Monto del canon mensual
  bidAmount?: number;          // Monto adicional ofrecido en la subasta
  paymentDate?: any;     // Fecha del último pago


}
