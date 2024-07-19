import { IonicModule } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../common/services/auth.service';
import { AlertController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ResetPasswordComponent  implements OnInit {

 email: string = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

 ngOnInit(): void {
    console.log('ResetPasswordComponent initialized');
  }

  async resetPassword() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      await this.authService.resetPassword(this.email);
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Correo enviado',
        message: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al intentar restablecer tu contraseña. Por favor, intenta de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
