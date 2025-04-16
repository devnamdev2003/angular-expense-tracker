import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  setSidebarOpen(isOpen: boolean) {
    this.sidebarOpenSubject.next(isOpen);
  }

  getSidebarOpen(): boolean {
    return this.sidebarOpenSubject.value;
  }
}
