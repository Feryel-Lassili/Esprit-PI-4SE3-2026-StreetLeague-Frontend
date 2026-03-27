import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  user: any = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    photoUrl: ''
  };

  selectedFile!: File;
  imagePreview: any;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadUser();
  }

  // Charger les données utilisateur pour pré-remplir le formulaire
  loadUser() {
    this.http.get('http://localhost:8089/SpringSecurity/user/me')
      .subscribe((res: any) => {
        this.user = res;

        // Prévisualiser l'image si photoUrl existe
        if (this.user.photoUrl) {
          this.imagePreview = this.user.photoUrl;
        }
      });
  }

  // Gestion du choix de fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.imagePreview = reader.result;
    reader.readAsDataURL(file);
  }

  // Mettre à jour le profil
  updateProfile() {
    const formData = new FormData();
    formData.append('user', JSON.stringify(this.user));

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.http.put('http://localhost:8089/SpringSecurity/user/update', formData)
      .subscribe({
        next: () => alert('✅ Profile updated'),
        error: () => alert('❌ Error updating profile')
      });
  }
}