import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogComponent } from './dialog.component';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('DialogComponent', () => {
  let component: DialogComponent;
  let fixture: ComponentFixture<DialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogComponent, CommonModule], // Importing the DialogComponent and CommonModule
    }).compileComponents();

    fixture = TestBed.createComponent(DialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the DialogComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should open the modal when openModal is called', () => {
    component.openModal();
    expect(component.show).toBeTrue();
  });

  it('should close the modal when closeModal is called', () => {
    component.show = true; // Ensuring the modal is open
    component.closeModal();
    expect(component.show).toBeFalse();
  });

  it('should emit onSubmit when the form is submitted', () => {
    spyOn(component.onSubmit, 'emit'); // Spying on the emit method
    const form = fixture.debugElement.query(By.css('form')); // Accessing the form element
    form.triggerEventHandler('submit', { preventDefault: () => { } }); // Triggering form submission
    expect(component.onSubmit.emit).toHaveBeenCalled();
  });

  it('should emit onClose when the close button is clicked', () => {
    spyOn(component.onClose, 'emit');
    const closeButton = fixture.debugElement.query(By.css('button[text*="×"]')); // Find the close button
    closeButton.triggerEventHandler('click', null); // Triggering the click event
    expect(component.onClose.emit).toHaveBeenCalled();
  });
});
