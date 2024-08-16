import { Component, OnInit } from '@angular/core';
import { MercadoPagoService } from '../../common/services/mercadopago.service';

declare var MercadoPago: any;

@Component({
  selector: 'app-mercado-pago',
  templateUrl: './mercado-pago.component.html',
  styleUrls: ['./mercado-pago.component.scss'],
  standalone: true
})
export class MercadoPagoComponent implements OnInit {
  mercadoPago: any;
  preferenceId: string | undefined;

  constructor(private mercadoPagoService: MercadoPagoService) {}

  ngOnInit(): void {
    // Inicializa la instancia de MercadoPago con tu public key
    this.mercadoPago = new MercadoPago('APP_USR-6d096a81-15ff-483c-ac2c-6ff0b348ac0a', {
      locale: 'es-AR' // Ajusta según tu región
    });

    this.createPreference();
  }

  createPreference(): void {
    const preference = {
      items: [
        {
          title: 'Mi producto',
          quantity: 1,
          unit_price: 2000
        }
      ],
      back_urls: {
        success: 'http://localhost:4200/perfil/homeCliente',
        failure: 'http://localhost:4200/perfil/homeCliente',
        pending: 'http://localhost:4200/perfil/homeCliente'
      },
      auto_return: 'approved',
    };

    this.mercadoPagoService.createPreference(preference).subscribe(
      (response) => {
        this.preferenceId = response.id;

        // Usar el método bricks().create para inicializar el botón de pago
        this.mercadoPago.bricks().create("wallet", "wallet_container", {
          initialization: {
            preferenceId: this.preferenceId,
          },
          customization: {
            texts: {
              valueProp: 'smart_option',
            },
          },
        });
      },
      (error) => {
        console.error('Error al crear la preferencia:', error);
      }
    );
  }
}
