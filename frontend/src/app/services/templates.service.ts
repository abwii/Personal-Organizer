import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoalTemplate {
  _id?: string;
  name: string;
  description?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  steps: Array<{
    title: string;
    description?: string;
    order: number;
  }>;
  estimatedDuration: number;
  isSystem: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplatesResponse {
  success: boolean;
  count?: number;
  data: GoalTemplate[];
}

export interface TemplateResponse {
  success: boolean;
  data: GoalTemplate;
}

export interface CreateGoalFromTemplateRequest {
  user_id: string;
  title?: string;
  startDate?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

export interface CreateGoalFromTemplateResponse {
  success: boolean;
  data: {
    goal: any;
    steps: any[];
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
  private apiUrl = 'http://localhost:3000/api/templates';

  constructor(private http: HttpClient) {}

  getTemplates(userId?: string): Observable<TemplatesResponse> {
    let url = this.apiUrl;
    if (userId) {
      url += `?user_id=${userId}`;
    }
    return this.http.get<TemplatesResponse>(url);
  }

  getTemplateById(id: string, userId?: string): Observable<TemplateResponse> {
    let url = `${this.apiUrl}/${id}`;
    if (userId) {
      url += `?user_id=${userId}`;
    }
    return this.http.get<TemplateResponse>(url);
  }

  createGoalFromTemplate(templateId: string, request: CreateGoalFromTemplateRequest): Observable<CreateGoalFromTemplateResponse> {
    return this.http.post<CreateGoalFromTemplateResponse>(`${this.apiUrl}/${templateId}/goals`, request);
  }
}
