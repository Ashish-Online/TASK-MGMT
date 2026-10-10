import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register', standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4"><span class="text-white text-xl">◆</span></div>
          <h1 class="text-2xl font-semibold text-slate-900">Create workspace</h1>
          <p class="text-slate-500 text-sm mt-1">Set up your organization</p>
        </div>
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form [formGroup]="form" (ngSubmit)="submit()">
            @for (f of fields; track f.name) {
              <div class="mb-4">
                <label class="block text-sm font-medium text-slate-700 mb-1.5">{{f.label}}</label>
                <input [formControlName]="f.name" [type]="f.type" [placeholder]="f.placeholder"
                  class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
              </div>
            }
            @if (error()) { <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{{error()}}</div> }
            @if (success()) { <div class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">Organization created! <a routerLink="/login" class="font-medium underline">Sign in now</a></div> }
            <button type="submit" [disabled]="loading()" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors">Create workspace</button>
          </form>
        </div>
        <p class="text-center text-sm text-slate-500 mt-6">Already have an account? <a routerLink="/login" class="text-indigo-600 hover:underline font-medium">Sign in</a></p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  form: FormGroup; loading = signal(false); error = signal<string|null>(null); success = signal(false);
  fields = [
    { name:'organizationName', label:'Organization name', type:'text', placeholder:'Acme Inc.' },
    { name:'adminName', label:'Your name', type:'text', placeholder:'John Smith' },
    { name:'email', label:'Email', type:'email', placeholder:'you@company.com' },
    { name:'password', label:'Password', type:'password', placeholder:'••••••••' },
  ];
  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({ organizationName:['',Validators.required], adminName:['',Validators.required], email:['', [Validators.required,Validators.email]], password:['', [Validators.required,Validators.minLength(6)]] });
  }
  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true); this.error.set(null);
    this.auth.register(this.form.value).subscribe({
      next: () => { this.success.set(true); this.loading.set(false); },
      error: (e: Error) => { this.error.set(e.message); this.loading.set(false); },
    });
  }
}
