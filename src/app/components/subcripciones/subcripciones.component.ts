import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/common/services/auth.service'; // Asegúrate de que la ruta del servicio sea correcta
import { User } from 'src/app/common/models/users.models'; // Asegúrate de que la ruta del modelo sea correcta

@Component({
  selector: 'app-subcripciones',
  templateUrl: './subcripciones.component.html',
  styleUrls: ['./subcripciones.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SubcripcionesComponent implements OnInit {
  email: string = ''; // Email ingresado por el usuario
  userId: string | null = null; // ID del usuario logueado
  errorMessage: string = ''; // Mensaje de error
  successMessage: string = ''; // Mensaje de éxito

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Obtiene el usuario actual y establece el ID
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.userId = user.id; // ID del usuario logueado
      }
    });
  }

  async suscribe() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }

    try {
      const response = await fetch('http://localhost:3333/create_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email, // Email ingresado por el usuario
          userId: this.userId, // ID del usuario logueado
        }),
      });

      const result = await response.json();

      if (result.error) {
        this.errorMessage = result.error;
        return;
      }

      if (result.init_point) {
        // Redirige al usuario a la URL de Mercado Pago
        window.location.href = result.init_point;
      } else {
        this.successMessage = 'Suscripción creada exitosamente. Revisa tu correo.';
      }
    } catch (error) {
      console.error('Error al crear la suscripción:', error);
      this.errorMessage = 'Ocurrió un error al intentar crear la suscripción.';
    }
  }
}
