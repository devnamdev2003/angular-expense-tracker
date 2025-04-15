import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DialogComponent } from './shared/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, DialogComponent, CommonModule],
      schemas: [NO_ERRORS_SCHEMA], // to avoid errors on missing dependencies (e.g., RouterOutlet)
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should open the dialog when clicking on the Restore Backup button', () => {
    const restoreButton = fixture.debugElement.query(By.css('button'));
    spyOn(component.restoreDialog, 'openModal'); // Spy on openModal method

    restoreButton.triggerEventHandler('click', null); // Simulate button click
    expect(component.restoreDialog.openModal).toHaveBeenCalled(); // Ensure openModal was called
  });

  it('should call validateAndRestore when the form is submitted', () => {
    spyOn(component, 'validateAndRestore'); // Spy on validateAndRestore method

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', { preventDefault: () => { } }); // Trigger submit event

    expect(component.validateAndRestore).toHaveBeenCalled(); // Ensure validateAndRestore was called
  });

  it('should log correct email and password when form is submitted', () => {
    spyOn(console, 'log'); // Spy on console.log to check if the function logs the correct values

    // Set input values
    const emailInput = fixture.debugElement.query(By.css('#restoreEmail')).nativeElement;
    const passwordInput = fixture.debugElement.query(By.css('#restorePassword')).nativeElement;
    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', { preventDefault: () => { } });

    expect(console.log).toHaveBeenCalledWith('Restore with', 'test@example.com', 'password123');
  });
});
