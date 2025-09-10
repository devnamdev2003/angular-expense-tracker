import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadComponentComponent } from './download-component.component';

describe('DownloadComponentComponent', () => {
  let component: DownloadComponentComponent;
  let fixture: ComponentFixture<DownloadComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
