import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service to manage and broadcast the current active section of the application.
 *
 * Features:
 * - Maintains the currently selected section using a {@link BehaviorSubject}.
 * - Provides an observable {@link currentSection$} to subscribe to section changes.
 * - Allows updating the current section with {@link setSection}.
 */
@Injectable({
  providedIn: 'root'
})
export class SectionService {

  /**
   * Internal BehaviorSubject holding the current section.
   * Initialized with 'home'.
   */
  private sectionSource = new BehaviorSubject<string>('home');

  /**
   * Observable stream of the current section.
   * Components can subscribe to reactively track section changes.
   */
  currentSection$ = this.sectionSource.asObservable();

  /**
   * Updates the current active section.
   *
   * @param section The new section identifier to set.
   */
  setSection(section: string): void {
    this.sectionSource.next(section);
  }
}
