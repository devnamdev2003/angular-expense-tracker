// section.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private sectionSource = new BehaviorSubject<string>('home'); // default section
  currentSection$ = this.sectionSource.asObservable(); // public observable

  setSection(section: string) {
    this.sectionSource.next(section);
  }
}
