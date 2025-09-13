import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallAppPopupComponentComponent } from './install-app-popup-component.component';

describe('InstallAppPopupComponentComponent', () => {
  let component: InstallAppPopupComponentComponent;
  let fixture: ComponentFixture<InstallAppPopupComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallAppPopupComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallAppPopupComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
