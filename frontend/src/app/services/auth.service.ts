import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, we might want to decode the token to check expiry
      // For now, we'll just assume if token exists, we might be logged in
      // and let the profile call verify validity
      this.getProfile().subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setSession(response);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setSession(response);
        }
      })
    );
  }

  private setSession(authResult: any): void {
    localStorage.setItem('token', authResult.token);
    this.currentUserSubject.next(authResult.user);
    this.isLoggedInSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, user, { headers: this.getHeaders() }).pipe(
      tap((updatedUser: any) => {
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCurrentUserId(): string {
    return this.currentUserSubject.value ? this.currentUserSubject.value._id || this.currentUserSubject.value.id : '';
  }
  
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }
}
