import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/users.models';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { AngularFireMessaging } from '@angular/fire/compat/messaging';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  private currentToken: string | null = null;
  public notificationMessage = new BehaviorSubject<any>(null);

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private afMessaging: AngularFireMessaging
  ) {
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();

    this.afAuth
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        this.afAuth.authState
          .pipe(
            switchMap((user) => {
              if (user) {
                return this.firestore
                  .collection<User>('usuarios')
                  .doc(user.uid)
                  .valueChanges();
              } else {
                return new Observable<User | null>((observer) =>
                  observer.next(null)
                );
              }
            })
          )
          .subscribe((userData) => {
            this.userSubject.next(userData);
            if (userData) {
              localStorage.setItem('currentUser', JSON.stringify(userData));

              this.requestPermission(userData.id); // Request notification permission for this user


            } else {
              localStorage.removeItem('currentUser');
            }
          });
      });
  }





// ----------------

// Request permission for push notifications
  async requestPermission(userId: string) {
    try {
      const token = await this.afMessaging.requestToken.toPromise();
      if (token) {
        console.log('Notification permission granted! Token:', token);
        this.currentToken = token;
        await this.saveTokenToFirestore(userId, token);
      }
    } catch (error) {
      console.error('Unable to get permission to notify:', error);
    }
  }

  // Save the token to Firestore
  private async saveTokenToFirestore(userId: string, token: string) {
    const userRef = this.firestore.collection('usuarios').doc(userId);
    try {
      await userRef.update({
        notificationTokens: firebase.firestore.FieldValue.arrayUnion(token),
      });
    } catch (error) {
      console.error('Error saving notification token:', error);
    }
  }

  // Listen to incoming notifications
  listenToNotifications() {
    this.afMessaging.messages.subscribe((message) => {
      console.log('Notification received:', message);
      this.notificationMessage.next(message);
    });
  }


  // ----------------













  // Método para verificar si el usuario está baneado
  private async isUserBanned(userId: string): Promise<boolean> {
    const userDoc = await this.firestore
      .collection('usuarios')
      .doc(userId)
      .get()
      .toPromise();
    const userData = userDoc.data() as User | undefined;
    return userData?.baneado ?? false;
  }

  // Método para obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.firestore.collection<User>('usuarios').valueChanges();
  }

  // Método para eliminar un usuario
  deleteUser(userId: string): Promise<void> {
    return this.firestore.collection('usuarios').doc(userId).delete();
  }

  // Método para banear o desbanear un usuario
  banUser(userId: string, ban: boolean): Promise<void> {
    return this.firestore
      .collection('usuarios')
      .doc(userId)
      .update({ baneado: ban });
  }

  // Método para listar usuarios baneados
  getBannedUsers(): Observable<User[]> {
    return this.firestore
      .collection<User>('usuarios', (ref) => ref.where('baneado', '==', true))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as User; // Asegura que data sea del tipo User
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  async login(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );

      if (await this.isUserBanned(credential.user!.uid)) {
        throw new Error('Usuario baneado. No puede iniciar sesión.');
      }

      await this.updateUserLocation(credential.user);
      return credential;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  //   async loginWithGoogle(): Promise<firebase.auth.UserCredential> {
  //     const provider = new firebase.auth.GoogleAuthProvider();
  //     const credential = await this.afAuth.signInWithPopup(provider);

  //  if (await this.isUserBanned(credential.user!.uid)) {
  //       throw new Error('Usuario baneado. No puede iniciar sesión.');
  //     }

  //     await this.updateUserData(credential.user);
  //     await this.updateUserLocation(credential.user);
  //     return credential;
  //   }

  async signInWithGoogle() {
    try {
      console.log('Inicializando GoogleAuth...');
      // Asegúrate de que el clientId esté en el archivo google-services.json y concuerde con el de Firebase
      await GoogleAuth.initialize({
        clientId:
          '1053356946867-csuhba1oi576o54fh554t9qv0jgtt0c0.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });
      console.log('GoogleAuth inicializado correctamente.');

      console.log('Intentando iniciar sesión con Google...');
      const googleUser = await GoogleAuth.signIn();
      console.log('Respuesta de Google sign-in:', googleUser);

      // Verifica si se obtuvo un usuario y la autenticación
      if (!googleUser || !googleUser.authentication) {
        throw new Error(
          'No se obtuvo la autenticación completa del usuario de Google.'
        );
      }

      // Usar idToken o accessToken según lo que devuelva GoogleAuth
      const token =
        googleUser.authentication.idToken ||
        googleUser.authentication.accessToken;
      if (!token) {
        throw new Error(
          'No se obtuvo un token de autenticación válido de Google.'
        );
      }

      console.log('Creando credencial de Firebase con el token de Google...');
      const credential = firebase.auth.GoogleAuthProvider.credential(token);

      console.log('Iniciando sesión en Firebase con la credencial...');
      const userCredential = await this.afAuth.signInWithCredential(credential);
      console.log('Respuesta de Firebase sign-in:', userCredential);

      console.log('Actualizando los datos del usuario en Firestore...');
      await this.updateUserData(userCredential.user);

      console.log(
        'Usuario inició sesión correctamente con Google:',
        userCredential
      );
      return userCredential;
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      throw error;
    }
  }

  async loginWithFacebook(): Promise<firebase.auth.UserCredential> {
    try {
      const provider = new firebase.auth.FacebookAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);
      await this.updateUserData(credential.user);
      await this.updateUserLocation(credential.user);
      return credential;
    } catch (error) {
      console.error('Error during Facebook login:', error);
      throw error;
    }
  }

  private async updateUserLocation(user: firebase.User | null): Promise<void> {
    if (user) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userRef = this.firestore.collection('usuarios').doc(user.uid);
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            };
            try {
              await userRef.update({ location });
            } catch (error) {
              console.error('Error updating user location:', error);
            }
          },
          (error) => {
            console.error('Error obtaining location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    }
  }

  private async updateUserData(user: firebase.User | null): Promise<void> {
    if (user) {
      const userRef = this.firestore.collection('usuarios').doc(user.uid);
      const userDoc = await userRef.get().toPromise();

      if (!userDoc.exists) {
        const data: User = {
          id: user.uid,
          nombre: user.displayName || 'Sin Nombre',
          correo: user.email || 'Sin Correo',
          fecha_registro:
            firebase.firestore.FieldValue.serverTimestamp() as any,
        };
        try {
          // console.log('Setting new user data:', data);
          await userRef.set(data);
        } catch (error) {
          console.error('Error setting new user data:', error);
        }
      }
    }
  }

  async register(
    email: string,
    password: string,
    nombre: string,
    tipo_usuario: string
  ): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      const uid = userCredential.user?.uid;
      if (uid) {
        await this.firestore.collection('usuarios').doc(uid).set({
          id: uid,
          nombre: nombre,
          correo: email,
          tipo_usuario: tipo_usuario,
          fecha_registro: firebase.firestore.FieldValue.serverTimestamp(),
        });
        await this.updateUserLocation(userCredential.user);
      }
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.user$;
  }
}
