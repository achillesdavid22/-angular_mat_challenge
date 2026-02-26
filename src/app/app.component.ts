import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  regForm!: FormGroup;
  currentStep = 1;
  isDarkMode = false;
  showPassword = false;
  showConfirm = false;
  isSuccess = false;
  ticketCode = '';

  snackbarMsg = '';
  showSnackbar = false;
  isSnackSuccess = false;

  availableTopics = [
    { icon: 'code', label: 'Web Dev' }, { icon: 'smart_toy', label: 'AI / ML' },
    { icon: 'phone_android', label: 'Mobile' }, { icon: 'cloud', label: 'Cloud & DevOps' },
    { icon: 'security', label: 'Cybersecurity' }, { icon: 'design_services', label: 'UX Design' },
    { icon: 'currency_bitcoin', label: 'Web3' }, { icon: 'trending_up', label: 'Startup' }
  ];
  selectedTopics: string[] = [];

  constructor(private fb: FormBuilder, private renderer: Renderer2) {}

  ngOnInit() {
    this.regForm = this.fb.group({
      step1: this.fb.group({
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        dob: ['', [Validators.required, this.dobValidator]],
        gender: [''],
        country: ['ph', Validators.required],
        city: ['', Validators.required],
        org: ['']
      }),
      step2: this.fb.group({
        ticket: ['standard'],
        tshirt: [''],
        diet: [''],
        bio: [''],
        workshop: [false],
        networking: [false],
        newsletter: [true]
      }),
      step3: this.fb.group({
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.pattern(/^[a-zA-Z][a-zA-Z0-9]{7,}$/)]],
        confirm: ['', Validators.required],
        terms: [false, Validators.requiredTrue],
        ageConfirm: [false, Validators.requiredTrue]
      }, { validators: this.passwordMatchValidator })
    });
  }

  // --- Custom Validators ---
  dobValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const year = new Date(control.value).getFullYear();
    return year <= 2006 ? null : { invalidYear: true };
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirm')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  // --- UI Interactions ---
  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  toggleTopic(topic: string) {
    const index = this.selectedTopics.indexOf(topic);
    if (index > -1) {
      this.selectedTopics.splice(index, 1);
    } else {
      if (this.selectedTopics.length >= 4) {
        this.triggerSnackbar('You can select up to 4 topics', false);
        return;
      }
      this.selectedTopics.push(topic);
    }
  }

  // --- Navigation & Submission ---
  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  nextStep(step: number) {
    const group = this.regForm.get(`step${step}`);
    if (group?.invalid) {
      group.markAllAsTouched();
      this.triggerSnackbar('Please fix the errors before continuing', false);
      return;
    }
    this.currentStep = step + 1;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  prevStep(step: number) {
    this.currentStep = step - 1;
  }

  submitForm() {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      this.triggerSnackbar('Please fill out all required fields and agreements correctly', false);
      return;
    }

    // Generate Code
    this.ticketCode = 'TSPH-2025-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    this.isSuccess = true;
    this.triggerSnackbar('Registration complete! Check your email for your ticket 🎉', true);
  }

  resetApp() {
    this.regForm.reset({ step2: { ticket: 'standard', newsletter: true }, step1: { country: 'ph' } });
    this.selectedTopics = [];
    this.currentStep = 1;
    this.isSuccess = false;
  }

  // --- Helpers ---
  triggerSnackbar(msg: string, success: boolean) {
    this.snackbarMsg = msg;
    this.isSnackSuccess = success;
    this.showSnackbar = true;
    setTimeout(() => this.showSnackbar = false, 3500);
  }

  get isPassValidLen() { return (this.regForm.get('step3.password')?.value || '').length >= 8; }
  get isPassValidLetter() { return /^[a-zA-Z]/.test(this.regForm.get('step3.password')?.value || ''); }
  get isPassValidAlnum() { return /^[a-zA-Z0-9]+$/.test(this.regForm.get('step3.password')?.value || ''); }
  get isPassValidNum() { return /[0-9]/.test(this.regForm.get('step3.password')?.value || ''); }
}
