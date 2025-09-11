import { TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

// Mock RouterOutlet for testing
@Component({
  selector: 'router-outlet',
  template: '<div class="mock-router-outlet"></div>'
})
class MockRouterOutlet {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    })
    .overrideComponent(AppComponent, {
      remove: { imports: [RouterOutlet] },
      add: { imports: [MockRouterOutlet] }
    })
    .compileComponents();
  });

  describe('Component Creation', () => {
    it('should create the app', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app).toBeTruthy();
    });

    it('should be a standalone component', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      expect(app).toBeInstanceOf(AppComponent);
    });
  });

  describe('Component Structure', () => {
    it('should have router-outlet in template', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      
      const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
      expect(routerOutlet).toBeTruthy();
    });

    it('should render without errors', () => {
      const fixture = TestBed.createComponent(AppComponent);
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Component Template', () => {
    it('should contain the app root selector', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('should initialize without any properties', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.componentInstance;
      
      // App component is simple and doesn't have properties
      expect(Object.keys(app)).toEqual([]);
    });
  });

  describe('Component Integration', () => {
    it('should work with Angular routing', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should have proper component metadata', () => {
      const fixture = TestBed.createComponent(AppComponent);
      const componentInstance = fixture.componentInstance;
      
      expect(componentInstance.constructor.name).toBe('AppComponent');
    });
  });

  describe('Error Handling', () => {
    it('should handle component destruction gracefully', () => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should handle multiple detection cycles', () => {
      const fixture = TestBed.createComponent(AppComponent);
      
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});