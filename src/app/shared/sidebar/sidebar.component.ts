import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SectionService } from '../../service/section/section.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  activePath: string = '';

  constructor(private sectionService: SectionService) {
    this.sectionService.currentSection$.subscribe(section => {
      this.activePath = section;
    });
  }

  navigateAndClose(section: string, event: Event) {
    event.preventDefault();
    this.sectionService.setSection(section);
  }
}
