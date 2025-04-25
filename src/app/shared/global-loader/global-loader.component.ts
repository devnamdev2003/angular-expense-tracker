import { Component } from '@angular/core';
import {GlobalLoaderService } from './global-loader.service'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-global-loader',
  imports: [CommonModule],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.css'
})
export class GlobalLoaderComponent {
  isVisible = false;

  constructor(private globalLoaderService: GlobalLoaderService) {
    this.globalLoaderService.register(this);
  }

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }
}


// constructor(private loader: LoaderService) {}

// loadSomething() {
//   this.loader.show();
//   setTimeout(() => {
//     this.loader.hide();
//   }, 3000);
// }
