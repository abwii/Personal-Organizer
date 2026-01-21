import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {
    name: '',
    email: ''
  };
  message = '';
  error = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.user = data;
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    this.authService.updateProfile(this.user).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.message = 'Profile updated successfully';
        this.error = '';
        setTimeout(() => this.message = '', 3000);
      },
      error: (err) => {
        this.error = err.error.message || 'Update failed';
        this.message = '';
      }
    });
  }
}
