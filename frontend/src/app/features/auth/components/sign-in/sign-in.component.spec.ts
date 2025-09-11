import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignInComponent } from './sign-in.component';
import { AuthService } from '../../../../core/services/auth.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignInComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.signInForm.get('username')?.value).toBe('');
      expect(component.signInForm.get('password')?.value).toBe('');
    });

    it('should initialize form as invalid', () => {
      expect(component.signInForm.invalid).toBe(true);
    });

    it('should initialize isSubmitting as false', () => {
      expect(component.isSubmitting).toBe(false);
    });

    it('should initialize errorMessage as empty', () => {
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should require username', () => {
      const usernameControl = component.signInForm.get('username');
      expect(usernameControl?.hasError('required')).toBe(true);
      
      usernameControl?.setValue('test');
      expect(usernameControl?.hasError('required')).toBe(false);
    });

    it('should require username to be at least 3 characters', () => {
      const usernameControl = component.signInForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBe(true);
      
      usernameControl?.setValue('abc');
      expect(usernameControl?.hasError('minlength')).toBe(false);
    });

    it('should require password', () => {
      const passwordControl = component.signInForm.get('password');
      expect(passwordControl?.hasError('required')).toBe(true);
      
      passwordControl?.setValue('password123');
      expect(passwordControl?.hasError('required')).toBe(false);
    });

    it('should require password to be at least 6 characters', () => {
      const passwordControl = component.signInForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);
      
      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should be valid when both fields are properly filled', () => {
      component.signInForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      expect(component.signInForm.valid).toBe(true);
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.signInForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('should call authService.signIn on valid form submission', () => {
      authService.signIn.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(authService.signIn).toHaveBeenCalledWith({
        name: 'testuser',
        password: 'password123'
      });
    });

    it('should navigate to task-board on successful sign in', () => {
      authService.signIn.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/task-board']);
    });

    it('should set isSubmitting to true during submission', () => {
      authService.signIn.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(component.isSubmitting).toBe(true);
    });

    it('should clear errorMessage on submission', () => {
      component.errorMessage = 'Previous error';
      authService.signIn.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('');
    });

    it('should not submit if form is invalid', () => {
      component.signInForm.patchValue({
        username: '',
        password: ''
      });
      
      component.onSubmit();
      
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('should not submit if already submitting', () => {
      component.isSubmitting = true;
      
      component.onSubmit();
      
      expect(authService.signIn).not.toHaveBeenCalled();
    });

    it('should handle sign in error', () => {
      const error = { error: { message: 'Invalid credentials' } };
      authService.signIn.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isSubmitting).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should use default error message when no specific error message', () => {
      const error = {};
      authService.signIn.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Sign in failed. Please try again.');
      expect(component.isSubmitting).toBe(false);
    });
  });

  describe('Field Error Handling', () => {
    it('should return required error for empty username', () => {
      const usernameControl = component.signInForm.get('username');
      usernameControl?.markAsDirty();
      
      const error = component.getFieldError('username');
      
      expect(error).toBe('Username is required');
    });

    it('should return minlength error for short username', () => {
      const usernameControl = component.signInForm.get('username');
      usernameControl?.setValue('ab');
      usernameControl?.markAsDirty();
      
      const error = component.getFieldError('username');
      
      expect(error).toBe('Username must be at least 3 characters');
    });

    it('should return required error for empty password', () => {
      const passwordControl = component.signInForm.get('password');
      passwordControl?.markAsDirty();
      
      const error = component.getFieldError('password');
      
      expect(error).toBe('Password is required');
    });

    it('should return minlength error for short password', () => {
      const passwordControl = component.signInForm.get('password');
      passwordControl?.setValue('12345');
      passwordControl?.markAsDirty();
      
      const error = component.getFieldError('password');
      
      expect(error).toBe('Password must be at least 6 characters');
    });

    it('should return null for valid field', () => {
      const usernameControl = component.signInForm.get('username');
      usernameControl?.setValue('validuser');
      usernameControl?.markAsDirty();
      
      const error = component.getFieldError('username');
      
      expect(error).toBeNull();
    });

    it('should return null for untouched invalid field', () => {
      const usernameControl = component.signInForm.get('username');
      // Field is invalid but not touched/dirty
      
      const error = component.getFieldError('username');
      
      expect(error).toBeNull();
    });
  });

  describe('Template Integration', () => {
    it('should render sign in title', () => {
      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Sign in to your account');
    });

    it('should render username input field', () => {
      const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
      expect(usernameInput).toBeTruthy();
      expect(usernameInput.nativeElement.placeholder).toBe('Enter your username');
    });

    it('should render password input field', () => {
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      expect(passwordInput).toBeTruthy();
      expect(passwordInput.nativeElement.type).toBe('password');
      expect(passwordInput.nativeElement.placeholder).toBe('Enter your password');
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.signInForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should show loading state when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent).toContain('Signing in...');
    });

    it('should display error message when present', () => {
      component.errorMessage = 'Sign in failed';
      fixture.detectChanges();
      
      const errorElement = fixture.debugElement.query(By.css('.text-red-700'));
      expect(errorElement.nativeElement.textContent.trim()).toBe('Sign in failed');
    });

    it('should show field error messages', () => {
      const usernameControl = component.signInForm.get('username');
      usernameControl?.markAsDirty();
      usernameControl?.updateValueAndValidity();
      fixture.detectChanges();
      
      const errorElement = fixture.debugElement.query(By.css('.text-red-600'));
      expect(errorElement.nativeElement.textContent.trim()).toBe('Username is required');
    });

    it('should apply error styles to invalid fields', () => {
      const usernameControl = component.signInForm.get('username');
      usernameControl?.markAsDirty();
      fixture.detectChanges();
      
      const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
      expect(usernameInput.nativeElement.classList).toContain('border-red-300');
    });

    it('should contain link to sign up page', () => {
      const signUpLink = fixture.debugElement.query(By.css('a[routerLink="/auth/sign-up"]'));
      expect(signUpLink).toBeTruthy();
      expect(signUpLink.nativeElement.textContent.trim()).toBe('create a new account');
    });
  });

  describe('Form Interaction', () => {
    it('should call onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');
      component.signInForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });
      
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should update form values when user types', () => {
      const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      
      usernameInput.nativeElement.value = 'newuser';
      usernameInput.nativeElement.dispatchEvent(new Event('input'));
      
      passwordInput.nativeElement.value = 'newpassword';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.signInForm.get('username')?.value).toBe('newuser');
      expect(component.signInForm.get('password')?.value).toBe('newpassword');
    });
  });
});