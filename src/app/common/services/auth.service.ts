import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/users.models';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { FirebaseError } from 'firebase/app';
import { Capacitor } from '@capacitor/core';

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
          this.requestPermission(userData.id);
        } else {
          localStorage.removeItem('currentUser');
        }
      });
  }

  // ------------------ NOTIFICACIONES ------------------

  async requestPermission(userId: string) {
    try {
      const token = await this.afMessaging.requestToken.toPromise();
      if (token) {
        this.currentToken = token;
        await this.saveTokenToFirestore(userId, token);
      }
    } catch (error) {
      console.error('Unable to get permission to notify:', error);
    }
  }

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

  listenToNotifications() {
    this.afMessaging.messages.subscribe((message) => {
      this.notificationMessage.next(message);
    });
  }

  // ------------------ USUARIOS ------------------

  private async isUserBanned(userId: string): Promise<boolean> {
    const userDoc = await this.firestore
      .collection('usuarios')
      .doc(userId)
      .get()
      .toPromise();
    const userData = userDoc.data() as User | undefined;
    return userData?.baneado ?? false;
  }

  getAllUsers(): Observable<User[]> {
    return this.firestore.collection<User>('usuarios').valueChanges();
  }

  deleteUser(userId: string): Promise<void> {
    return this.firestore.collection('usuarios').doc(userId).delete();
  }

  banUser(userId: string, ban: boolean): Promise<void> {
    return this.firestore
      .collection('usuarios')
      .doc(userId)
      .update({ baneado: ban });
  }

  getBannedUsers(): Observable<User[]> {
    return this.firestore
      .collection<User>('usuarios', (ref) => ref.where('baneado', '==', true))
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as User;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  // ------------------ LOGIN/REGISTRO ------------------

  async login(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    try {
      await this.afAuth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

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

  // ------------------ ACTUALIZACIONES ------------------

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
          await userRef.set(data);
        } catch (error) {
          console.error('Error setting new user data:', error);
        }
      }
    }
  }

  async signInWithGoogle() {
  try {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {

      console.log('Web detected: Using Firebase signInWithPopup.');

      const provider = new firebase.auth.GoogleAuthProvider();
      const credential = await this.afAuth.signInWithPopup(provider);

      if (await this.isUserBanned(credential.user!.uid)) {
        throw new Error('Usuario baneado. No puede iniciar sesión.');
      }

      await this.updateUserData(credential.user);
      await this.updateUserLocation(credential.user);
      return credential;
    } else {
      // MÓVIL NATIVO (Ionic + Capacitor app instalada)
      console.log('Native device detected: Using Capacitor GoogleAuth.');

      await GoogleAuth.initialize({
        clientId: '670473542620-omae1mc9s9nh17l3it99v58iduqqsrjq.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
      });

      const googleUser = await GoogleAuth.signIn();

      if (!googleUser || !googleUser.authentication) {
        throw new Error('No se pudo obtener autenticación de Google.');
      }

      const token = googleUser.authentication.idToken || googleUser.authentication.accessToken;
      if (!token) {
        throw new Error('No se obtuvo un token válido de Google.');
      }

      const credential = firebase.auth.GoogleAuthProvider.credential(token);

      const userCredential = await this.afAuth.signInWithCredential(credential);

      if (await this.isUserBanned(userCredential.user!.uid)) {
        throw new Error('Usuario baneado. No puede iniciar sesión.');
      }

      await this.updateUserData(userCredential.user);
      await this.updateUserLocation(userCredential.user);
      return userCredential;
    }
  } catch (error) {
    console.error('Error en signInWithGoogle:', error);
    throw error;
  }
}


}
