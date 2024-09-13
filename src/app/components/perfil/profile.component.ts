import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/common/services/auth.service';
import { FirestoreService } from '../../common/services/firestore.service';
import { User } from 'src/app/common/models/users.models';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonCard, IonCardHeader, IonCardContent, IonCardSubtitle, IonCardTitle,  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonImg, IonHeader, IonToolbar, IonBackButton, IonButtons, IonGrid,IonRow,IonCol,IonAvatar, IonMenuButton} from '@ionic/angular/standalone';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonHeader,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonImg,
    IonMenuButton,
    IonGrid,IonRow,IonCol,IonAvatar,
    IonCardHeader,IonCardContent,
    IonCardSubtitle,IonCardTitle,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  selectedFile: File | null = null;

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService,
    private storage: AngularFireStorage,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.user = {
          ...user,
          fecha_registro: new Date(user.fecha_registro) // Aseguramos que fecha_registro es un Date
        };
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    // console.log('Imagen seleccionada:', this.selectedFile);
  }

  uploadProfileImage() {
    if (this.selectedFile && this.user) {
      const filePath = `profile_images/${Date.now()}_${this.selectedFile.name}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, this.selectedFile);

      uploadTask.snapshotChanges().pipe(
        finalize(async () => {
          const downloadURL = await fileRef.getDownloadURL().toPromise();
          await this.firestoreService.updateUserProfileImage(this.user?.id, downloadURL);
          this.user!.imagen = downloadURL; // Actualizamos la URL de la imagen en el usuario
          // console.log('Imagen de perfil actualizada:', downloadURL);
        })
      ).subscribe();
    } else {
      console.error('No se ha seleccionado ninguna imagen o no se ha cargado el usuario');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
