import { Component } from '@angular/core';
import { GraphsComponent } from '../../component/graphs/graphs.component';


@Component({
  selector: 'app-home',
  imports: [GraphsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
