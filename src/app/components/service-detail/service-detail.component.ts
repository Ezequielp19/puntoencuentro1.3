import {
  IonItem,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFabButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonCardContent,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonSelectOption,
  IonSelect,
  IonCardSubtitle,
  IonAvatar,
  IonIcon, IonFab } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FirestoreService } from '../../common/services/firestore.service';
import { Service } from 'src/app/common/models/service.models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReviewsComponent } from '../reviews/reviews.component';
import { AuthService } from 'src/app/common/services/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Message } from 'src/app/common/models/messaje.model';


@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss'],
  standalone: true,
  imports: [IonFab,
    IonIcon,
    IonAvatar,
    IonCardSubtitle,
    IonSpinner,
    IonButtons,
    IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonInput,
    IonLabel,
    IonContent,
      IonFabButton,

    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonList,
    IonCardContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonButton,
    ReviewsComponent,
    IonFab
  ],
})
export class ServiceDetailComponent implements OnInit {
  service: Service | null = null;
  serviceId: string | null = null;
  horarios: any[] = [];
  sortedHorarios: any[] = [];


 userId: string | null = null;

messages: any[] = [];  // Para almacenar mensajes de chat
  newMessageText: string = '';  // Para el mensaje nuevo de entrada
  isChatOpen: boolean = false;  // Estado de visibilidad del chat


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private firestore: AngularFirestore
  ) {}


  isAdmin: boolean = false;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id');
      if (this.serviceId) {
        this.loadService(this.serviceId);

                 this.setupChat(this.serviceId);

      }
    });

     this.authService.getCurrentUser().subscribe(user => {
      this.isAdmin = user.tipo_usuario === 'admin';
    });
  }

  async loadService(serviceId: string) {
    this.firestoreService.getDocumentById<Service>('services', serviceId).subscribe((service) => {
      this.service = service;
      if (this.service) {
        this.loadHorarios(this.service.providerId);
      }
    }, (error) => {
      console.error('Error loading service:', error);
    });
  }

  loadHorarios(providerId: string) {
    this.firestore.collection('horarios', ref => ref.where('userId', '==', providerId))
      .valueChanges({ idField: 'id' })
      .subscribe((horarios: any[]) => {
        this.horarios = horarios;
        this.sortedHorarios = this.sortHorarios(horarios);
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

  navigateToCita() {
    this.router.navigate(['/cita', this.serviceId]);
  }

  goToProfile() {
    this.router.navigate(['/perfil']);
  }




    setupChat(chatId: string) {
    // Suscribirse a los mensajes de chat en tiempo real
    this.firestoreService.getChatMessages(chatId).subscribe((messages) => {
      this.messages = messages;
    });
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  sendMessage() {
    if (this.newMessageText.trim()) {
      const newMessage = {
        senderId: this.userId,
        messageText: this.newMessageText,
        timestamp: new Date(),
      };
      this.messages.push(newMessage);  // Agregar el mensaje localmente
      this.newMessageText = '';  // Limpiar el input después de enviar
    }
  }



}
