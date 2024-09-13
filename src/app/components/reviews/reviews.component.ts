import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreService } from '../../common/services/firestore.service';
import { Reviews } from '../../common/models/reviews.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertController,IonSpinner,IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonItem, IonLabel, IonItemDivider, IonButton, IonSelect, IonSelectOption, IonTextarea, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../common/services/auth.service';
import { User } from 'src/app/common/models/users.models';
import { Service } from 'src/app/common/models/service.models';
import { IoniconsModule } from 'src/app/common/modules/ionicons.module';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonItemDivider,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonIcon,
    IoniconsModule,
    IonSpinner
  ],
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
})
export class ReviewsComponent implements OnInit {
  reviews: Reviews[] = [];
  paginatedReviews: Reviews[] = [];
  showForm = false;
  reviewForm: FormGroup;
  ratings = [1, 2, 3, 4, 5];
  currentPage = 1;
  reviewsPerPage = 3;
  totalPages = 0;
  currentUser: User | null = null;
  averageRating: number = 0;
  isLoading = false;

  @Input() servicioId: string = '';
  servicioNombreEmpresa: string = '';

  constructor(
    private fb: FormBuilder,
    private firestoreService: FirestoreService,
    private authService: AuthService,
    private alertController: AlertController // Add this line
  ) {
    this.reviewForm = this.fb.group({
      calificacion: [0, Validators.required],
      comentario: ['', Validators.required],
    });
  }


  ngOnInit() {
    this.fetchReviews();
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.fetchServiceName();
  }

  fetchReviews() {
    this.firestoreService.getCollectionChanges<Reviews>('reviews')
      .subscribe(data => {
        this.reviews = data.filter(review => review.servicio_id === this.servicioId);
        this.totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
        this.updatePaginatedReviews();
        this.calculateAverageRating();
      });
  }

  fetchServiceName() {
    this.firestoreService.getDocumentById<Service>('services', this.servicioId).subscribe(service => {
      if (service) {
        this.servicioNombreEmpresa = service.nombreEmpresa;
      }
    });
  }

  updatePaginatedReviews() {
    const start = (this.currentPage - 1) * this.reviewsPerPage;
    const end = start + this.reviewsPerPage;
    this.paginatedReviews = this.reviews.slice(start, end);
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  async onSubmit() {
    if (this.reviewForm.valid && this.currentUser) {
      this.isLoading = true; // Start the spinner
      const { calificacion, comentario } = this.reviewForm.value;
      const review: Reviews = {
        id: '',
        servicio_id: this.servicioId,
        nombreEmpresa: this.servicioNombreEmpresa,
        nombreCliente: this.currentUser.nombre.toUpperCase(),
        cliente_id: this.currentUser.id,
        calificacion,
        comentario,
      };

      try {
        await this.firestoreService.createReview(review);
        this.fetchReviews();
        this.reviewForm.reset({ calificacion: 0, comentario: '' });
        this.showForm = false;
        this.isLoading = false; // Stop the spinner
        await this.showAlert('Éxito', '¡Gracias por agregar tu reseña!');
      } catch (error) {
        this.isLoading = false; // Stop the spinner in case of error
        console.error('Error al crear la reseña:', error);
      }
    } else {
      console.error('Formulario inválido o usuario no autenticado');
    }
  }


  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedReviews();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedReviews();
    }
  }

  createRange(num: number) {
    return new Array(num);
  }

  selectRating(rating: number) {
    this.reviewForm.get('calificacion').setValue(rating);
  }

  calculateAverageRating() {
    const totalReviews = this.reviews.length;
    if (totalReviews > 0) {
      const sumRatings = this.reviews.reduce((sum, review) => sum + review.calificacion, 0);
      this.averageRating = sumRatings / totalReviews;
    } else {
      this.averageRating = 0;
    }
  }

  round(value: number) {
    return Math.round(value);
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
