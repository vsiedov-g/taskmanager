import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../../../../core/services/auth.service';
import { By } from '@angular/platform-browser';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signUp']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignUpComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
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
      expect(component.signUpForm.get('username')?.value).toBe('');
      expect(component.signUpForm.get('password')?.value).toBe('');
      expect(component.signUpForm.get('confirmPassword')?.value).toBe('');
    });

    it('should initialize form as invalid', () => {
      expect(component.signUpForm.invalid).toBe(true);
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
      const usernameControl = component.signUpForm.get('username');
      expect(usernameControl?.hasError('required')).toBe(true);
      
      usernameControl?.setValue('test');
      expect(usernameControl?.hasError('required')).toBe(false);
    });

    it('should require username to be at least 3 characters', () => {
      const usernameControl = component.signUpForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBe(true);
      
      usernameControl?.setValue('abc');
      expect(usernameControl?.hasError('minlength')).toBe(false);
    });

    it('should require password', () => {
      const passwordControl = component.signUpForm.get('password');
      expect(passwordControl?.hasError('required')).toBe(true);
      
      passwordControl?.setValue('password123');
      expect(passwordControl?.hasError('required')).toBe(false);
    });

    it('should require password to be at least 6 characters', () => {
      const passwordControl = component.signUpForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBe(true);
      
      passwordControl?.setValue('123456');
      expect(passwordControl?.hasError('minlength')).toBe(false);
    });

    it('should require confirm password', () => {
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('required')).toBe(true);
      
      confirmPasswordControl?.setValue('password123');
      expect(confirmPasswordControl?.hasError('required')).toBe(false);
    });

    it('should validate password match', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
      
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBe(true);
    });

    it('should pass validation when passwords match', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should be valid when all fields are properly filled', () => {
      component.signUpForm.patchValue({
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      expect(component.signUpForm.valid).toBe(true);
    });

    it('should clear password mismatch error when passwords match', () => {
      // First set mismatching passwords
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
      
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBe(true);
      
      // Then make them match
      component.signUpForm.patchValue({
        confirmPassword: 'password123'
      });
      
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      component.signUpForm.patchValue({
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
    });

    it('should call authService.signUp on valid form submission', () => {
      authService.signUp.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(authService.signUp).toHaveBeenCalledWith({
        name: 'testuser',
        password: 'password123'
      });
    });

    it('should navigate to task-board on successful sign up', () => {
      authService.signUp.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(router.navigate).toHaveBeenCalledWith(['/task-board']);
    });

    it('should set isSubmitting to true during submission', () => {
      authService.signUp.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(component.isSubmitting).toBe(true);
    });

    it('should clear errorMessage on submission', () => {
      component.errorMessage = 'Previous error';
      authService.signUp.and.returnValue(of({ token: 'test-token', user: { id: '1', name: 'Test User', email: 'test@test.com' } }));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('');
    });

    it('should not submit if form is invalid', () => {
      component.signUpForm.patchValue({
        username: '',
        password: '',
        confirmPassword: ''
      });
      
      component.onSubmit();
      
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('should not submit if already submitting', () => {
      component.isSubmitting = true;
      
      component.onSubmit();
      
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it('should handle sign up error', () => {
      const error = { error: { message: 'Username already exists' } };
      authService.signUp.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Username already exists');
      expect(component.isSubmitting).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should use default error message when no specific error message', () => {
      const error = {};
      authService.signUp.and.returnValue(throwError(() => error));
      
      component.onSubmit();
      
      expect(component.errorMessage).toBe('Sign up failed. Please try again.');
      expect(component.isSubmitting).toBe(false);
    });
  });

  describe('Field Error Handling', () => {
    it('should return required error for empty username', () => {
      const usernameControl = component.signUpForm.get('username');
      usernameControl?.markAsDirty();
      
      const error = component.getFieldError('username');
      
      expect(error).toBe('Username is required');
    });

    it('should return minlength error for short username', () => {
      const usernameControl = component.signUpForm.get('username');
      usernameControl?.setValue('ab');
      usernameControl?.markAsDirty();
      
      const error = component.getFieldError('username');
      
      expect(error).toBe('Username must be at least 3 characters');
    });

    it('should return required error for empty password', () => {
      const passwordControl = component.signUpForm.get('password');
      passwordControl?.markAsDirty();
      
      const error = component.getFieldError('password');
      
      expect(error).toBe('Password is required');
    });

    it('should return minlength error for short password', () => {
      const passwordControl = component.signUpForm.get('password');
      passwordControl?.setValue('12345');
      passwordControl?.markAsDirty();
      
      const error = component.getFieldError('password');
      
      expect(error).toBe('Password must be at least 6 characters');
    });

    it('should return required error for empty confirm password', () => {
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      confirmPasswordControl?.markAsDirty();
      
      const error = component.getFieldError('confirmPassword');
      
      expect(error).toBe('Confirm password is required');
    });

    it('should return password mismatch error', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      confirmPasswordControl?.markAsDirty();
      
      const error = component.getFieldError('confirmPassword');
      
      expect(error).toBe('Passwords do not match');
    });

    it('should return null for valid field', () => {
      const usernameControl = component.signUpForm.get('username');
      usernameControl?.setValue('validuser');
      usernameControl?.markAsDirty();
      
      const error = component.getFieldError('username');
      
      expect(error).toBeNull();
    });

    it('should return null for untouched invalid field', () => {
      const usernameControl = component.signUpForm.get('username');
      // Field is invalid but not touched/dirty
      
      const error = component.getFieldError('username');
      
      expect(error).toBeNull();
    });
  });

  describe('Password Match Validator', () => {
    it('should set passwordMismatch error when passwords do not match', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
      
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBe(true);
    });

    it('should clear passwordMismatch error when passwords match', () => {
      // First create a mismatch
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
      
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBe(true);
      
      // Then fix the mismatch
      component.signUpForm.patchValue({
        confirmPassword: 'password123'
      });
      
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should not affect other errors when clearing passwordMismatch', () => {
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      
      // Set required error first
      confirmPasswordControl?.setErrors({ required: true, passwordMismatch: true });
      
      // Update form to trigger validator
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      // Should clear passwordMismatch but keep required error
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
      expect(confirmPasswordControl?.hasError('required')).toBe(true);
    });
  });

  describe('Template Integration', () => {
    it('should render sign up title', () => {
      const titleElement = fixture.debugElement.query(By.css('h2'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('Create your account');
    });

    it('should render all three input fields', () => {
      const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      const confirmPasswordInput = fixture.debugElement.query(By.css('input[formControlName="confirmPassword"]'));
      
      expect(usernameInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(confirmPasswordInput).toBeTruthy();
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.signUpForm.patchValue({
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should show loading state when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();
      
      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent).toContain('Creating account...');
    });

    it('should display error message when present', () => {
      component.errorMessage = 'Sign up failed';
      fixture.detectChanges();
      
      const errorElement = fixture.debugElement.query(By.css('.text-red-700'));
      expect(errorElement.nativeElement.textContent.trim()).toBe('Sign up failed');
    });

    it('should show field error messages', () => {
      const usernameControl = component.signUpForm.get('username');
      usernameControl?.markAsDirty();
      usernameControl?.updateValueAndValidity();
      fixture.detectChanges();
      
      const errorElement = fixture.debugElement.query(By.css('.text-red-600'));
      expect(errorElement.nativeElement.textContent.trim()).toBe('Username is required');
    });

    it('should apply error styles to invalid fields', () => {
      const usernameControl = component.signUpForm.get('username');
      usernameControl?.markAsDirty();
      fixture.detectChanges();
      
      const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
      expect(usernameInput.nativeElement.classList).toContain('border-red-300');
    });

    it('should contain link to sign in page', () => {
      const signInLink = fixture.debugElement.query(By.css('a[routerLink="/auth/sign-in"]'));
      expect(signInLink).toBeTruthy();
      expect(signInLink.nativeElement.textContent.trim()).toBe('sign in to your account');
    });
  });

  describe('Form Interaction', () => {
    it('should call onSubmit when form is submitted', () => {
      spyOn(component, 'onSubmit');
      component.signUpForm.patchValue({
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123'
      });
      
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      
      expect(component.onSubmit).toHaveBeenCalled();
    });

    it('should update form values when user types', () => {
      const usernameInput = fixture.debugElement.query(By.css('input[formControlName="username"]'));
      const passwordInput = fixture.debugElement.query(By.css('input[formControlName="password"]'));
      const confirmPasswordInput = fixture.debugElement.query(By.css('input[formControlName="confirmPassword"]'));
      
      usernameInput.nativeElement.value = 'newuser';
      usernameInput.nativeElement.dispatchEvent(new Event('input'));
      
      passwordInput.nativeElement.value = 'newpassword';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      
      confirmPasswordInput.nativeElement.value = 'newpassword';
      confirmPasswordInput.nativeElement.dispatchEvent(new Event('input'));
      
      expect(component.signUpForm.get('username')?.value).toBe('newuser');
      expect(component.signUpForm.get('password')?.value).toBe('newpassword');
      expect(component.signUpForm.get('confirmPassword')?.value).toBe('newpassword');
    });

    it('should trigger password match validation on confirm password change', () => {
      component.signUpForm.patchValue({
        password: 'password123',
        confirmPassword: 'differentpassword'
      });
      
      const confirmPasswordControl = component.signUpForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBe(true);
      
      confirmPasswordControl?.setValue('password123');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeFalsy();
    });
  });
});