import { IonContent, IonAvatar, IonButton, AlertController, LoadingController, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonButtons, IonHeader, IonToolbar, IonMenuButton, IonTitle, IonIcon, IonCardSubtitle, IonList } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../common/services/firestore.service';
import { Service } from 'src/app/common/models/service.models';
import { AuthService } from 'src/app/common/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { IoniconsModule } from 'src/app/common/modules/ionicons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-mi-servicio',
  templateUrl: './mi-servicio.component.html',
  styleUrls: ['./mi-servicio.component.scss'],
  standalone: true,
  imports: [IoniconsModule, IonContent,IonCard,IonCardHeader,IonCardContent,IonCardTitle,IonGrid,IonRow,IonCol
    ,IonAvatar,IonItem,IonLabel,IonButtons,IonButton,
    IonHeader,IonToolbar,IonMenuButton,IonTitle,IonIcon,IonCardSubtitle,IonList, ReactiveFormsModule, FormsModule, CommonModule]
})
export class MiServicioComponent implements OnInit {
  service: Service | null = null;
  serviceId: string | null = null;
  horarios: any[] = [];
  sortedHorarios: any[] = [];
  selectedFile: File | null = null;
  alertShown = false; // Bandera para controlar la visualización de la alerta

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private alertController: AlertController,
    private loadingController: LoadingController // Agregado para el loading spinner
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.loadServiceByProviderId(user.id);
        this.loadHorarios(user.id);
      }
    });
  }

  async loadServiceByProviderId(providerId: string) {
    this.firestoreService.getServiceByProviderId(providerId).subscribe((service) => {
        this.service = service;
        this.serviceId = service.id; // Aseguramos que el ID del servicio esté disponible
    }, (error) => {
      console.error('Error loading service:', error);
    });
  }



  loadHorarios(userId: string) {
    this.firestoreService.getHorariosByUserId(userId).subscribe((querySnapshot) => {
      this.horarios = querySnapshot.docs.map(doc => doc.data());
      this.sortedHorarios = this.sortHorarios(this.horarios);
      // console.log('Horarios cargados:', this.horarios);
    });
  }

  formatHorario(horario: any): string {
    const daysOrder = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    const daysOfWeek = Object.keys(horario.selectedDays)
      .filter((key) => horario.selectedDays[key])
      .sort((a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b));
    const daysString = daysOfWeek.join(', ');
    return `${daysString} ${horario.startTime} - ${horario.endTime}`;
  }

  sortHorarios(horarios: any[]): any[] {
    const daysOrder = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];
    return horarios.sort(
      (a, b) =>
        daysOrder.indexOf(Object.keys(a.selectedDays).find((key) => a.selectedDays[key])) -
        daysOrder.indexOf(Object.keys(b.selectedDays).find((key) => b.selectedDays[key]))
    );
  }

  getGoogleMapsUrl(address: string): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  async updateService() {
    if (this.serviceId && this.service) {
      try {
        await this.firestoreService.updateService(this.serviceId, this.service);
        await this.presentAlert('Éxito', 'El servicio se ha actualizado correctamente.');
      } catch (error) {
        console.error('Error updating service:', error);
      }
    } else {
      console.error('Service ID or service data is missing');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    // console.log('Imagen seleccionada:', this.selectedFile);
  }

  async uploadServiceImage() {
    if (this.selectedFile && this.service) {
      const loading = await this.loadingController.create({
        message: 'Cargando imagen...',
      });
      await loading.present();

      const filePath = `service_images/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          if (this.serviceId) {
            await this.firestoreService.updateServiceProfileImage(this.serviceId, downloadURL);
            this.service!.imageUrl = downloadURL; // Actualizamos la URL de la imagen en el servicio
            await loading.dismiss();
            await this.presentAlert('Éxito', 'La imagen del servicio se ha actualizado correctamente.');
            // console.log('Imagen de perfil del servicio actualizada:', downloadURL);
          }
        })
      ).subscribe();
    } else {
      console.error('No se ha seleccionado ninguna imagen o no se ha cargado el servicio');
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
