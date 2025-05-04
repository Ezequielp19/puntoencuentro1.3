import { Component } from "@angular/core";
import {
  IonApp,
  IonRouterOutlet,
  IonList,
  IonHeader,
} from "@ionic/angular/standalone";
import { MenuController, Platform } from "@ionic/angular";
import { ReviewsComponent } from "./components/reviews/reviews.component";
import { CitaComponent } from "./components/cita/cita.component";
import { ProfileComponent } from "./views/profile/profile.component";
import { RouterModule } from "@angular/router";
import { HistorialCitasComponent } from "./components/historial-citas/historial-citas.component";
import { HistorialResenasComponent } from "./components/historial-resenas/historial-resenas.component";
import { CrearCategoriaComponent } from "./components/crear-categoria/crear-categoria.component";
import { CountdownModule } from "ngx-countdown";

import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from "@capacitor/push-notifications";
// import {Platform} from '@ionic/angular'

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  standalone: true,
  imports: [
    RouterModule,
    IonHeader,
    IonList,
    IonApp,
    IonRouterOutlet,
    ReviewsComponent,
    CitaComponent,
    ProfileComponent,
    HistorialCitasComponent,
    HistorialResenasComponent,
    CrearCategoriaComponent,
    CountdownModule,
  ],
})
export class AppComponent {
  constructor(private platform: Platform) {
    if (this.platform.is("capacitor")) this.initPush();
  }

  initPush() {
    console.log("Initializing HomePage");

    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      } else {
      }
    });

    PushNotifications.addListener("registration", (token: Token) => {
      // alert('Push registration success, token: ' + token.value);
    });

    PushNotifications.addListener("registrationError", (error: any) => {
      // alert('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        // alert('Push received: ' + JSON.stringify(notification));
      }
    );

    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification: ActionPerformed) => {
        // alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }
}
