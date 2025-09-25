import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseWiseComponent } from './expense-wise.component';

describe('ExpenseWiseComponent', () => {
  let component: ExpenseWiseComponent;
  let fixture: ComponentFixture<ExpenseWiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseWiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseWiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
