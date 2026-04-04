import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingComponent } from './saving.component';

describe('TestComponent', () => {
  let component: SavingComponent;
  let fixture: ComponentFixture<SavingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
