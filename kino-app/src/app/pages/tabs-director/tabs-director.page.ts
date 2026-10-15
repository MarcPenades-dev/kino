import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filmOutline, searchOutline, personOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs-director',
  templateUrl: './tabs-director.page.html',
  styleUrls: ['./tabs-director.page.scss'],
  standalone: true,
  imports: [
    IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet,
    RouterLink, RouterLinkActive
  ]
})
export class TabsDirectorPage {
  constructor() {
    addIcons({ filmOutline, searchOutline, personOutline, calendarOutline });
  }
}
