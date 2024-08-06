import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonHeader, IonItem, IonMenuButton, IonIcon, IonButton, IonToolbar, IonContent, IonLabel, IonRow, IonGrid, IonCol, IonTitle, IonCheckbox, IonText, IonSelect, IonSelectOption, IonInput, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { User } from '../../common/models/users.models';
import { AuthService } from 'src/app/common/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-schedule-config',
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonMenuButton,
    IonIcon,
    IonItem,
    IonButton,
    IonToolbar,
    IonContent,
    IonLabel,
    IonRow,
    IonGrid,
    IonCol,
    IonTitle,
    IonCheckbox,
    IonText,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
  ]
})
export class ScheduleConfigComponent {
  days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  selectedDays: { [key: string]: boolean } = {};
  startTime: string = '';
  endTime: string = '';
  breakStart: string = '';
  breakEnd: string = '';
  breakTimes: string = '';

  timeSlots: string[] = [];

  userId: string | null = null;
  horarios: any[] = [];

  serviceId: any;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {
    this.initializeTimeSlots();
  }

  ngOnInit() {
    this.authService.getCurrentUser().subscribe((user: User | null) => {
      if (user) {
        this.userId = user.id;
        this.loadHorarios();
      }
    });
  }

  initializeTimeSlots() {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ['00', '30']) {
        times.push(`${this.padNumber(hour)}:${minute}`);
      }
    }
    this.timeSlots = times;
  }

  padNumber(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  async saveSchedule() {
    if (this.horarios.length >= 2) {
      await this.presentAlert('Límite de horarios alcanzado', 'No se pueden agregar más de dos horarios.');
      return;
    }

    const schedule = {
      userId: this.userId,
      selectedDays: this.selectedDays,
      startTime: this.startTime,
      endTime: this.endTime,
      breakTimes: `${this.breakStart}-${this.breakEnd}`,
    };

    if (!schedule.startTime || !schedule.endTime) {
      await this.presentAlert('Error', 'Hora de inicio o fin no puede estar vacía');
      return;
    }

    this.firestore.collection('horarios').add(schedule)
      .then(async () => {
        await this.presentAlert('Horario guardado', 'El horario ha sido guardado con éxito.');
        this.loadHorarios();  // Reload schedules after saving
      })
      .catch(async error => {
        console.error('Error al guardar el horario: ', error);
        await this.presentAlert('Error', 'Hubo un error al guardar el horario.');
      });
  }

  loadHorarios() {
    if (this.userId) {
      this.firestore.collection('horarios', ref => ref.where('userId', '==', this.userId))
        .valueChanges({ idField: 'id' })
        .subscribe((horarios: any[]) => {
          this.horarios = horarios;
        });
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
