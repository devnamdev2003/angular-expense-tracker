import { Injectable } from '@angular/core';
import { GlobalLoaderComponent } from './global-loader.component';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {



  private globalLoaderComponent!: GlobalLoaderComponent;

  register(component: GlobalLoaderComponent) {
    this.globalLoaderComponent = component;
  }

  show() {
    this.globalLoaderComponent?.show();
  }

  hide() {
    this.globalLoaderComponent?.hide();
  }
}