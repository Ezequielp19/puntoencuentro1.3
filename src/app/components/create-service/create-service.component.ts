import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../common/services/firestore.service';
import { AuthService } from '../../common/services/auth.service';
import { CategoryI } from '../../common/models/categoria.model';
import { User } from 'src/app/common/models/users.models';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class CreateServiceComponent implements OnInit {

  createServiceForm: FormGroup;
  categories: CategoryI[] = [];
  selectedFile: File | null = null;
  imagenUsuario: File | null = null;
  currentUser: User | null = null;
  alertShown = false; // Bandera para controlar la visualización de la alerta

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    private router: Router,
    private alertController: AlertController
  ) {
    this.createServiceForm = this.fb.group({
      nombreEmpresa: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
      telefono: ['', Validators.required],
      category: ['', Validators.required],
      sobreNosotros: [''],
      price: ['', [Validators.min(0)]],
      servicio: ['', Validators.required],
      dirreccion: ['', Validators.required],
      imagenUrl: [''],
      ciudad: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (this.currentUser && this.currentUser.id) {
        this.checkIfServiceExists(this.currentUser.id);
      }
    });
  }

  loadCategories() {
    this.firestoreService.getCollectionChanges<CategoryI>('Categorías').subscribe(data => {
      if (data) {
        this.categories = data;
      }
    });
  }

  async checkIfServiceExists(providerId: string) {
    if (this.alertShown) return; // Evitar duplicidad de alertas
    const service = await this.firestoreService.getServiceByProviderId(providerId);
    if (service) {
      // Si ya existe un servicio para este proveedor, mostrar alerta y redirigir
      this.alertShown = true;
      await this.presentAlert('Aviso', 'Ya tienes un servicio creado. Redirigiendo a "Mi Servicio".');
      this.router.navigate(['/perfil/miServicio']);
    }
  }

  onFileSelected(event: any) {
    this.imagenUsuario = event.target.files[0];
  }

  async onSubmit() {
    if (this.createServiceForm.valid) {
      if (this.currentUser && this.currentUser.id) {
        if (this.imagenUsuario) {
          const filePath = `images/${Date.now()}_${this.imagenUsuario.name}`;
          const fileRef = this.storage.ref(filePath);
          const uploadTask = this.storage.upload(filePath, this.imagenUsuario);

          uploadTask.snapshotChanges().pipe(
            finalize(async () => {
              const downloadURL = await fileRef.getDownloadURL().toPromise();
              const serviceData = {
                ...this.createServiceForm.value,
                providerId: this.currentUser.id,
                imageUrl: downloadURL
              };
              try {
                await this.firestoreService.createService(serviceData);
                await this.presentAlert('Éxito', 'El servicio se ha creado correctamente.');
                this.router.navigate(['/perfil/miServicio']);
              } catch (error) {
                console.error('Error al crear el servicio:', error);
              }
            })
          ).subscribe();
        } else {
          const serviceData = {
            ...this.createServiceForm.value,
            providerId: this.currentUser.id,
            imageUrl: ''
          };
          try {
            await this.firestoreService.createService(serviceData);
            await this.presentAlert('Éxito', 'El servicio se ha creado correctamente.');
            this.router.navigate(['/perfil/miServicio']);
          } catch (error) {
            console.error('Error al crear el servicio:', error);
          }
        }
      } else {
        console.error('No se pudo obtener el ID del usuario');
      }
    } else {
      console.error('Formulario inválido');
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
