import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // Importar FormsModule

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, LoadingController } from '@ionic/angular'

@Component({
  selector: 'app-recovery-email',
  templateUrl: './recovery-email.component.html',
  styleUrls: ['./recovery-email.component.scss'],
  standalone:true,
   imports: [

    IonicModule,
FormsModule

  ]
})
export class RecoveryEmailComponent  implements OnInit {


  ngOnInit() {}


  identifier: string = '';

  constructor(
    private firestore: AngularFirestore,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async recoverEmail() {
    const loading = await this.loadingController.create();
    await loading.present();

    try {
      const querySnapshot = await this.firestore.collection('usuarios', ref => ref.where('nombre', '==', this.identifier)).get().toPromise();
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0].data() as { email: string }; // Asegurarse de que userDoc tenga el tipo correcto
        const alert = await this.alertController.create({
          header: 'Correo Encontrado',
          message: `El correo asociado es: ${userDoc.email}`,
          buttons: ['OK']
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'No encontrado',
          message: 'No se encontró ningún usuario con ese identificador.',
          buttons: ['OK']
        });
        await alert.present();
      }
      await loading.dismiss();
    } catch (error) {
      await loading.dismiss();
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Hubo un problema al intentar recuperar tu correo. Por favor, intenta de nuevo.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }
}
