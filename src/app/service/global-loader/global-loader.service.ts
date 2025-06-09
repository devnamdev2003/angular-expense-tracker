import { Injectable } from '@angular/core';
import { GlobalLoaderComponent } from '../../shared/global-loader/global-loader.component';

@Injectable({
  providedIn: 'root'
})
export class GlobalLoaderService {

  private globalLoaderComponent!: GlobalLoaderComponent;

  register(component: GlobalLoaderComponent) {
    this.globalLoaderComponent = component;
  }
  
  show(text: string = "Loading...") {
    this.globalLoaderComponent?.show(text);
  }

  hide() {
    this.globalLoaderComponent?.hide();
  }
}