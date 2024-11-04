import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/common/services/auth.service';
import { User } from 'src/app/common/models/users.models';
import {
  IonItem,
  IonButton,
  IonLabel,
  IonContent,
  IonMenuButton,
  IonIcon,
  IonList,
  IonToolbar,
  IonTitle,
  IonHeader,
  IonButtons,
  IonSpinner,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './service-ver-detalle.component.html',
  styleUrls: ['./service-ver-detalle.component.scss'],
  standalone: true,
  imports: [IonSpinner, IonButtons, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonContent, IonMenuButton, IonIcon, IonList, CommonModule, FormsModule, ReactiveFormsModule, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedUsers: User[] = [];
  userCount: number = 0;
  pageSize: number = 4; // Número de usuarios por página
  currentPage: number = 1;
  totalPages: number = 1;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getAllUsers().subscribe(users => {
      this.users = users;
      this.userCount = users.length;
      this.totalPages = Math.ceil(this.userCount / this.pageSize);
      this.updateDisplayedUsers();
    });
  }

  updateDisplayedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUsers = this.users.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedUsers();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedUsers();
    }
  }

// Método para eliminar un usuario
deleteUser(userId: string): void {
  if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    this.authService.deleteUser(userId).then(() => {
      alert('Usuario eliminado exitosamente.');
      this.users = this.users.filter(u => u.id !== userId);
      this.userCount--;
      this.totalPages = Math.ceil(this.userCount / this.pageSize);
      this.updateDisplayedUsers();
    }).catch(error => {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario.');
    });
  }
}

// Método para banear o desbanear un usuario
banUser(userId: string, ban: boolean): void {
  const action = ban ? 'banear' : 'desbanear';
  if (confirm(`¿Estás seguro de que quieres ${action} a este usuario?`)) {
    this.authService.banUser(userId, ban).then(() => {
      alert(`Usuario ${action} exitosamente.`);
      const user = this.users.find(u => u.id === userId);
      if (user) user.baneado = ban;
      this.updateDisplayedUsers();
    }).catch(error => {
      console.error(`Error al ${action} al usuario:`, error);
      alert(`Error al ${action} al usuario.`);
    });
  }
}
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
