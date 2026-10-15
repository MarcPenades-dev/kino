import { Component } from '@angular/core';
import {
  IonTabs, IonTabBar, IonTabButton,
  IonIcon, IonLabel, IonRouterOutlet
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filmOutline, heartOutline, personOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs-actor',
  templateUrl: './tabs-actor.page.html',
  styleUrls: ['./tabs-actor.page.scss'],
  standalone: true,
  imports: [
    IonTabs, IonTabBar, IonTabButton,
    IonIcon, IonLabel, IonRouterOutlet
  ]
})
export class TabsActorPage {
  constructor() {
    addIcons({ filmOutline, heartOutline, personOutline, calendarOutline });
  }
}
