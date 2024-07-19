import {
  IonButtons,
  IonBackButton,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonSelectOption,
  IonSelect,
  IonButton,
  IonAvatar,
  IonRadio,
  IonRouterOutlet,
  IonCardSubtitle,
  IonDatetime,
  IonIcon,
  IonLabel,
  IonItem,
  IonList,
  IonSpinner,
  IonCardTitle,
  AlertController,
} from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../common/services/firestore.service';
import { Citas } from '../../common/models/cita.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../common/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/common/models/users.models';
import { Service } from 'src/app/common/models/service.models';

@Component({
  selector: 'app-cita',
  standalone: true,
  imports: [
    IonButtons,
    IonBackButton,
    IonHeader,
    IonRadio,
    IonToolbar,
    IonContent,
    IonGrid,
    IonRow,
    IonIcon,
    IonLabel,
    IonCol,
    IonCard,
    IonCardTitle,
    IonCardHeader,
    IonCardContent,
    IonSelectOption,
    IonSelect,
    IonButton,
    IonRouterOutlet,
    IonTitle,
    IonAvatar,
    IonCardSubtitle,
    IonDatetime,
    IonItem,
    IonList,
    IonSpinner,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './cita.component.html',
  styleUrls: ['./cita.component.scss'],
})
export class CitaComponent implements OnInit {
  selectedDate: string = '';
  selectedSlot: string = '';
  availableSlots: string[] = [];
  serviceSchedule: any = {};
  existingAppointments: Citas[] = [];
  serviceId: string | null = null;
  currentUser: User | null = null;
  nombreEmpresa: string = '';
  service: Service | null = null;
  horarios: any[] = [];
  sortedHorarios: any[] = [];
  isLoading: boolean = false;
  today: string = new Date().toISOString().split('T')[0];
  locale: string = 'es-ES';

  constructor(
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');
      if (this.serviceId) {
        this.fetchServiceSchedule();
        this.fetchServiceName();
      }
    });

    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
    });
  }

  async fetchServiceSchedule() {
    try {
      if (!this.serviceId) {
        console.error('Service ID is not available.');
        return;
      }

      this.firestoreService.getDocumentById<Service>('services', this.serviceId).subscribe((serviceDoc) => {
        if (!serviceDoc) {
          console.error('No se encontró el servicio.');
          return;
        }

        const userId = serviceDoc.providerId;
        if (!userId) {
          console.error('No se encontró el userId para el servicio.');
          return;
        }

        this.firestoreService.getHorariosByUserId(userId).subscribe((horariosSnapshot) => {
          if (horariosSnapshot.empty) {
            console.error('No se encontró el horario para el usuario.');
            return;
          }

          this.serviceSchedule = horariosSnapshot.docs[0].data();
          this.horarios = horariosSnapshot.docs.map(doc => doc.data());
          this.sortedHorarios = this.sortHorarios(this.horarios);
          this.initializeCalendar();
        });
      }, (error) => {
        console.error('Error al obtener el servicio:', error);
      });
    } catch (error) {
      console.error('Error al obtener el horario del servicio:', error);
    }
  }

  async fetchServiceName() {
    try {
      if (!this.serviceId) {
        console.error('Service ID is not available.');
        return;
      }

      const service = await this.firestoreService.getDocumentById<Service>('services', this.serviceId).toPromise();
      if (service) {
        this.nombreEmpresa = service.nombreEmpresa;
      } else {
        console.error('No se encontró el servicio.');
      }
    } catch (error) {
      console.error('Error al obtener el nombre del servicio:', error);
    }
  }

  initializeCalendar() {
    const datePicker = document.querySelector('ion-datetime');
    if (datePicker) {
      datePicker.addEventListener('ionRender', () => {
        const days = Array.from(
          datePicker.shadowRoot.querySelectorAll('.calendar-day')
        );
        days.forEach((day) => {
          const date = day.getAttribute('data-day');
          if (date && !this.isDayAvailable(new Date(date))) {
            day.classList.add('unavailable-day');
          }
        });
      });
    }
  }

  isDayAvailable(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset today's time to midnight
    const dayName = date
      .toLocaleDateString(this.locale, { weekday: 'long' })
      .toLowerCase();
    const selectedDays: { [key: string]: boolean } = Object.keys(
      this.serviceSchedule.selectedDays
    ).reduce((acc: { [key: string]: boolean }, key: string) => {
      acc[key.toLowerCase()] = this.serviceSchedule.selectedDays[key];
      return acc;
    }, {});

    return (date >= today) && selectedDays[dayName];
  }

  async fetchExistingAppointments() {
    try {
      const appointments = await this.firestoreService.getAppointmentsByDate(
        this.selectedDate.split('T')[0]
      );
      this.existingAppointments = appointments;
    } catch (error) {
      console.error('Error fetching existing appointments:', error);
    }
  }

  fetchAvailableSlots() {
    const selectedDateObj = new Date(this.selectedDate);
    if (!this.isDayAvailable(selectedDateObj)) {
      this.availableSlots = [];
      return;
    }

    const startTime = this.convertToMinutes(this.serviceSchedule.startTime);
    const endTime = this.convertToMinutes(this.serviceSchedule.endTime);
    const [breakStart, breakEnd] = this.convertToTimeRange(
      this.serviceSchedule.breakTimes
    );

    this.availableSlots = [];
    for (let time = startTime; time < endTime; time += 30) {
      if (time >= breakStart && time < breakEnd) continue;
      const slot = this.convertToTimeString(time);
      if (!this.isSlotBooked(slot)) {
        this.availableSlots.push(slot);
      }
    }
  }

  isSlotBooked(slot: string): boolean {
    const slotDateStr = `${this.selectedDate.split('T')[0]}T${slot}:00`;
    return this.existingAppointments.some(
      (appointment) => appointment.fecha_cita === slotDateStr
    );
  }

  convertToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  convertToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${this.padNumber(hours)}:${this.padNumber(mins)}`;
  }

  convertToTimeRange(timeRange: string): [number, number] {
    const [start, end] = timeRange.split('-').map((time) =>
      this.convertToMinutes(time)
    );
    return [start, end];
  }

  padNumber(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  formatHorario(horario: any): string {
    const start = horario.startTime;
    const end = horario.endTime;
    const days = Object.keys(horario.selectedDays)
      .filter(day => horario.selectedDays[day])
      .sort((a, b) => this.getDayIndex(a) - this.getDayIndex(b)); // Ordenar los días de la semana

    return `${days.join(', ')}: ${start} - ${end}`;
  }

  getDayIndex(day: string): number {
    const daysOrder = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    return daysOrder.indexOf(day.toLowerCase());
  }

  sortHorarios(horarios: any[]): any[] {
    return horarios.sort((a, b) => {
      const aTime = this.convertToMinutes(a.startTime);
      const bTime = this.convertToMinutes(b.startTime);
      return aTime - bTime;
    });
  }

  async confirmAppointment() {
    if (!this.selectedDate || !this.selectedSlot) {
      this.showAlert('Error', 'Por favor seleccione una fecha y una hora.');
      return;
    }

    this.isLoading = true;

    if (this.currentUser && this.serviceId) {
      const date = this.selectedDate.split('T')[0];

      try {
        const appointment: Citas = {
          id: this.firestoreService.createIdDoc(),
          usuario_id: this.currentUser.id,
          fecha_cita: `${date}T${this.selectedSlot}:00`,
          servicio_id: this.serviceId,
          estado: 'pendiente',
          nombre: this.currentUser.nombre,
          nombreEmpresa: this.nombreEmpresa,
        };

        await this.firestoreService.createAppointment(appointment);
        this.showAlert('Éxito', 'Cita confirmada con éxito');
        this.resetSelection();
        this.isLoading = false;
        this.router.navigate([`/serviceDetail/${this.serviceId}`]); // Asegúrate de actualizar la ruta a la página anterior
      } catch (error) {
        this.isLoading = false;
        this.showAlert('Error', 'Error al confirmar la cita: ' + error);
        console.error('Error al confirmar la cita:', error);
      }
    } else {
      this.showAlert('Error', 'Usuario o servicio no disponible.');
      console.error('Usuario o servicio no disponible.');
    }
  }

  resetSelection() {
    this.selectedDate = '';
    this.selectedSlot = '';
    this.availableSlots = [];
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async onDateSelected(event: any) {
    this.selectedDate = event.detail.value;
    await this.fetchExistingAppointments();
    this.fetchAvailableSlots();
    this.openHorariosModal(); // Abre el modal después de seleccionar la fecha
  }

  async openHorariosModal() {
    if (this.availableSlots.length === 0) {
      const alert = await this.alertController.create({
        header: 'Horarios Disponibles',
        message: 'No hay ningún horario disponible',
        buttons: ['OK']
      });

      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Horarios Disponibles',
        inputs: this.availableSlots.map((slot) => ({
          type: 'radio',
          label: slot,
          value: slot,
        })),
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Aceptar',
            handler: (selectedSlot) => {
              if (selectedSlot) {
                this.selectedSlot = selectedSlot;
                this.confirmAppointment();
              }
            },
          },
        ],
      });

      await alert.present();
    }
  }

}
