import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpDashboard } from './help-dashboard';

describe('HelpDashboard', () => {
  let component: HelpDashboard;
  let fixture: ComponentFixture<HelpDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpDashboard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HelpDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
