import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonList, IonHeader } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { CitaComponent } from './components/cita/cita.component';
import { ProfileComponent } from './views/profile/profile.component';
import { RouterModule } from '@angular/router';
import { HistorialCitasComponent } from './components/historial-citas/historial-citas.component';
import { HistorialResenasComponent } from './components/historial-resenas/historial-resenas.component';
import { CrearCategoriaComponent } from './components/crear-categoria/crear-categoria.component';
import { CountdownModule } from 'ngx-countdown';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [RouterModule,IonHeader, IonList, IonApp, IonRouterOutlet, ReviewsComponent, CitaComponent, ProfileComponent,
    HistorialCitasComponent, HistorialResenasComponent, CrearCategoriaComponent,CountdownModule
  ],
})
export class AppComponent {
  constructor() {}
}
// 777
