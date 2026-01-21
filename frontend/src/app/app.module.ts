import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GoalsComponent } from './components/goals/goals.component';
import { GoalFormComponent } from './components/goals/goal-form.component';
import { HabitsComponent } from './components/habits/habits.component';
import { HabitFormComponent } from './components/habits/habit-form.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GoalsComponent,
    GoalFormComponent,
    HabitsComponent,
    HabitFormComponent
  ],
  imports: [
    BrowserModule, // BrowserModule includes CommonModule
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
