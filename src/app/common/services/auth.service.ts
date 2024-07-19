import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../models/users.models';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.userSubject = new BehaviorSubject<User | null>(null);
    this.user$ = this.userSubject.asObservable();

    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection<User>('usuarios').doc(user.uid).valueChanges();
        } else {
          return new Observable<User | null>(observer => observer.next(null));
        }
      })
    ).subscribe(userData => this.userSubject.next(userData));
  }

    // Método para obtener todos los usuarios
  getAllUsers(): Observable<User[]> {
    return this.firestore.collection<User>('usuarios').valueChanges();
  }

  async login(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
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

  async loginWithGoogle(): Promise<firebase.auth.UserCredential> {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.signInWithPopup(provider);
    await this.updateUserData(credential.user);
    await this.updateUserLocation(credential.user);
    return credential;
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
        navigator.geolocation.getCurrentPosition(async (position) => {
          const userRef = this.firestore.collection('usuarios').doc(user.uid);
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          };
          try {
            await userRef.update({ location });
          } catch (error) {
            console.error('Error updating user location:', error);
          }
        }, (error) => {
          console.error('Error obtaining location:', error);
        });
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
          fecha_registro: firebase.firestore.FieldValue.serverTimestamp() as any
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

  async register(email: string, password: string, nombre: string, tipo_usuario: string): Promise<void> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;
      if (uid) {
        await this.firestore.collection('usuarios').doc(uid).set({
          id: uid,
          nombre: nombre,
          correo: email,
          tipo_usuario: tipo_usuario,
          fecha_registro: firebase.firestore.FieldValue.serverTimestamp()
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
