import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudBackupComponent } from './cloud-backup.component';

describe('CloudBackupComponent', () => {
  let component: CloudBackupComponent;
  let fixture: ComponentFixture<CloudBackupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudBackupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudBackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
