import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonCard,IonCardHeader,IonCardContent,IonCardTitle,IonHeader, IonItem,IonMenuButton, IonIcon,IonButton, IonToolbar, IonContent, IonLabel, IonRow, IonGrid, IonCol, IonTitle, IonCheckbox, IonText, IonSelect, IonSelectOption, IonInput, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import {User} from '../../common/models/users.models'
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
    IonMenuButton, IonIcon,
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
    IonCard,IonCardHeader,IonCardContent,IonCardTitle,
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


  constructor(private firestore: AngularFirestore,private authService: AuthService,
  private route: ActivatedRoute,   private router: Router,
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

  saveSchedule() {
    const schedule = {
      userId:this.userId,
      selectedDays: this.selectedDays,
      startTime: this.startTime,
      endTime: this.endTime,
      breakTimes: `${this.breakStart}-${this.breakEnd}`,
    };

    console.log(schedule);
    if (!schedule.startTime || !schedule.endTime) {
      console.error('Hora de inicio o fin no puede estar vacía');
      return;
    }

    this.firestore.collection('horarios').add(schedule)
      .then(() => {
        // console.log('Horario guardado con éxito');
      })
      .catch(error => {
        console.error('Error al guardar el horario: ', error);
      });
  }

   loadHorarios() {
    if (this.userId) {
      this.firestore.collection('horarios', ref => ref.where('userId', '==', this.userId))
        .valueChanges({ idField: 'id' })
        .subscribe((horarios: any[]) => {
          this.horarios = horarios;
          console.log('Horarios cargados:', this.horarios);
        });
    }
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

