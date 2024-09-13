import { AlertController, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirestoreService } from '../../common/services/firestore.service';
import { AuthService } from '../../common/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs'; // Importa firstValueFrom para convertir el Observable en Promesa

@Component({
  selector: 'app-select-user-type',
  templateUrl: './select-user-type.component.html',
  styleUrls: ['./select-user-type.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton
  ]
})
export class SelectUserTypeComponent {

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private router: Router,
    private alertController: AlertController
  ) { }

  async selectUserType(tipoUsuario: 'cliente' | 'proveedor') { // Ajusta el tipo de tipoUsuario
    try {
      const currentUser = await firstValueFrom(this.authService.getCurrentUser()); // Convierte el Observable en Promesa y obtén el usuario actual
      if (currentUser && currentUser.id) {
        await this.firestoreService.updateUser(currentUser.id, { tipo_usuario: tipoUsuario });
        this.router.navigate(['/perfil']); // Redirigir a la página de perfil después de seleccionar el tipo de usuario
        await this.showAlert('Éxito', 'Tipo de usuario actualizado correctamente');
      } else {
        this.showAlert('Error', 'No se pudo obtener el usuario actual');
      }
    } catch (error) {
      this.showAlert('Error', 'Hubo un problema al actualizar el tipo de usuario');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
