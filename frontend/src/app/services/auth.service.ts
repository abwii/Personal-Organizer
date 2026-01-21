import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Temporary: using hardcoded user_id until authentication is implemented
  private currentUserIdSubject = new BehaviorSubject<string>('507f1f77bcf86cd799439011');
  public currentUserId$ = this.currentUserIdSubject.asObservable();

  constructor() {}

  getCurrentUserId(): string {
    return this.currentUserIdSubject.value;
  }

  setCurrentUserId(userId: string): void {
    this.currentUserIdSubject.next(userId);
  }

  // TODO: Implement when authentication is ready
  // login(email: string, password: string): Observable<any> { }
  // logout(): void { }
  // isAuthenticated(): boolean { }
}
