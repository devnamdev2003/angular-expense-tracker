import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistMusicComponent } from './playlist-music.component';

describe('PlaylistMusicComponent', () => {
  let component: PlaylistMusicComponent;
  let fixture: ComponentFixture<PlaylistMusicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistMusicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaylistMusicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
