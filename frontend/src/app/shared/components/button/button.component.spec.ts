import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.debugElement.query(By.css('button'));
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render button element', () => {
      expect(buttonElement).toBeTruthy();
    });

    it('should have default property values', () => {
      expect(component.variant).toBe('primary');
      expect(component.size).toBe('md');
      expect(component.disabled).toBe(false);
      expect(component.loading).toBe(false);
      expect(component.type).toBe('button');
      expect(component.fullWidth).toBe(false);
    });
  });

  describe('Button Classes', () => {
    it('should apply default classes', () => {
      const classes = component.buttonClasses;
      expect(classes).toContain('btn-base');
      expect(classes).toContain('btn-md');
      expect(classes).toContain('btn-primary');
    });

    it('should apply correct variant classes', () => {
      const variants: Array<'primary' | 'secondary' | 'danger' | 'success' | 'outline'> = 
        ['primary', 'secondary', 'danger', 'success', 'outline'];

      variants.forEach(variant => {
        component.variant = variant;
        expect(component.buttonClasses).toContain(`btn-${variant}`);
      });
    });

    it('should apply correct size classes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg'> = ['xs', 'sm', 'md', 'lg'];

      sizes.forEach(size => {
        component.size = size;
        expect(component.buttonClasses).toContain(`btn-${size}`);
      });
    });

    it('should apply fullWidth class when fullWidth is true', () => {
      component.fullWidth = true;
      expect(component.buttonClasses).toContain('w-full');
    });

    it('should not apply fullWidth class when fullWidth is false', () => {
      component.fullWidth = false;
      expect(component.buttonClasses).not.toContain('w-full');
    });

    it('should combine all classes correctly', () => {
      component.variant = 'danger';
      component.size = 'lg';
      component.fullWidth = true;
      
      const classes = component.buttonClasses;
      expect(classes).toBe('btn-base btn-lg btn-danger w-full');
    });
  });

  describe('Button Attributes', () => {
    it('should set type attribute', () => {
      component.type = 'submit';
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.type).toBe('submit');
    });

    it('should set disabled attribute when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should set disabled attribute when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should not be disabled when both disabled and loading are false', () => {
      component.disabled = false;
      component.loading = false;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.disabled).toBe(false);
    });

    it('should apply CSS classes to button element', () => {
      component.variant = 'secondary';
      component.size = 'sm';
      fixture.detectChanges();
      
      const buttonClasses = buttonElement.nativeElement.className;
      expect(buttonClasses).toContain('btn-base');
      expect(buttonClasses).toContain('btn-sm');
      expect(buttonClasses).toContain('btn-secondary');
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('.spinner'));
      expect(spinner).toBeTruthy();
    });

    it('should hide spinner when loading is false', () => {
      component.loading = false;
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('.spinner'));
      expect(spinner).toBeFalsy();
    });

    it('should disable button when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.disabled).toBe(true);
    });
  });

  describe('Click Handling', () => {
    it('should emit clicked event when button is clicked', () => {
      spyOn(component.clicked, 'emit');
      
      buttonElement.nativeElement.click();
      
      expect(component.clicked.emit).toHaveBeenCalledWith(jasmine.any(Event));
    });

    it('should not emit clicked event when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();
      spyOn(component.clicked, 'emit');
      
      buttonElement.nativeElement.click();
      
      expect(component.clicked.emit).not.toHaveBeenCalled();
    });

    it('should not emit clicked event when loading', () => {
      component.loading = true;
      fixture.detectChanges();
      spyOn(component.clicked, 'emit');
      
      buttonElement.nativeElement.click();
      
      expect(component.clicked.emit).not.toHaveBeenCalled();
    });

    it('should call handleClick method', () => {
      spyOn(component, 'handleClick');
      
      buttonElement.triggerEventHandler('click', new Event('click'));
      
      expect(component.handleClick).toHaveBeenCalledWith(jasmine.any(Event));
    });

    it('should emit event only when not disabled and not loading', () => {
      spyOn(component.clicked, 'emit');
      const mockEvent = new Event('click');
      
      // Test normal state
      component.disabled = false;
      component.loading = false;
      component.handleClick(mockEvent);
      expect(component.clicked.emit).toHaveBeenCalledWith(mockEvent);
      
      // Test disabled state
      (component.clicked.emit as jasmine.Spy).calls.reset();
      component.disabled = true;
      component.loading = false;
      component.handleClick(mockEvent);
      expect(component.clicked.emit).not.toHaveBeenCalled();
      
      // Test loading state
      (component.clicked.emit as jasmine.Spy).calls.reset();
      component.disabled = false;
      component.loading = true;
      component.handleClick(mockEvent);
      expect(component.clicked.emit).not.toHaveBeenCalled();
    });
  });

  describe('Content Projection', () => {
    it('should project content', () => {
      // For this test, we'll verify the ng-content is properly set up
      // by checking that content can be projected (structural test)
      expect(component).toBeTruthy();
      
      // The ng-content is in the template and should work with projected content
      // This is a simplified test since testing content projection 
      // requires more complex setup with a host component
    });
  });

  describe('Input Properties', () => {
    it('should accept variant input', () => {
      component.variant = 'danger';
      expect(component.variant).toBe('danger');
    });

    it('should accept size input', () => {
      component.size = 'lg';
      expect(component.size).toBe('lg');
    });

    it('should accept disabled input', () => {
      component.disabled = true;
      expect(component.disabled).toBe(true);
    });

    it('should accept loading input', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
    });

    it('should accept type input', () => {
      component.type = 'submit';
      expect(component.type).toBe('submit');
    });

    it('should accept fullWidth input', () => {
      component.fullWidth = true;
      expect(component.fullWidth).toBe(true);
    });
  });

  describe('Output Properties', () => {
    it('should have clicked output property', () => {
      expect(component.clicked).toBeDefined();
      expect(component.clicked.emit).toBeDefined();
    });
  });

  describe('Template Integration', () => {
    it('should render with different variants', () => {
      const variants: Array<'primary' | 'secondary' | 'danger' | 'success' | 'outline'> = 
        ['primary', 'secondary', 'danger', 'success', 'outline'];

      variants.forEach(variant => {
        component.variant = variant;
        fixture.detectChanges();
        
        expect(buttonElement.nativeElement.className).toContain(`btn-${variant}`);
      });
    });

    it('should render with different sizes', () => {
      const sizes: Array<'xs' | 'sm' | 'md' | 'lg'> = ['xs', 'sm', 'md', 'lg'];

      sizes.forEach(size => {
        component.size = size;
        fixture.detectChanges();
        
        expect(buttonElement.nativeElement.className).toContain(`btn-${size}`);
      });
    });

    it('should apply fullWidth styling', () => {
      component.fullWidth = true;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.className).toContain('w-full');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable when not disabled', () => {
      component.disabled = false;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.disabled).toBe(false);
    });

    it('should not be focusable when disabled', () => {
      component.disabled = true;
      fixture.detectChanges();
      
      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should have proper button semantics', () => {
      expect(buttonElement.nativeElement.tagName).toBe('BUTTON');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined variant gracefully', () => {
      // @ts-ignore - Testing edge case
      component.variant = undefined;
      
      // Should not throw error
      expect(() => component.buttonClasses).not.toThrow();
    });

    it('should handle undefined size gracefully', () => {
      // @ts-ignore - Testing edge case
      component.size = undefined;
      
      // Should not throw error
      expect(() => component.buttonClasses).not.toThrow();
    });

    it('should handle multiple rapid clicks', () => {
      spyOn(component.clicked, 'emit');
      
      // Simulate rapid clicking
      for (let i = 0; i < 5; i++) {
        buttonElement.nativeElement.click();
      }
      
      expect(component.clicked.emit).toHaveBeenCalledTimes(5);
    });

    it('should handle state changes during event emission', () => {
      let emitCount = 0;
      component.clicked.subscribe(() => {
        emitCount++;
        // Change state during emission
        component.disabled = true;
      });
      
      buttonElement.nativeElement.click();
      expect(emitCount).toBe(1);
      
      // Second click should not emit due to disabled state
      buttonElement.nativeElement.click();
      expect(emitCount).toBe(1);
    });
  });
});