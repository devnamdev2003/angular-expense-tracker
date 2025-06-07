import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseDetailsModalComponent } from './expense-details-modal.component';

describe('ExpenseDetailsModalComponent', () => {
  let component: ExpenseDetailsModalComponent;
  let fixture: ComponentFixture<ExpenseDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
