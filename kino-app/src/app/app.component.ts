import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import {addIcons} from "ionicons";
import {
  cameraOutline, chatbubbleOutline, chatbubblesOutline,
  checkmarkOutline, chevronBackOutline,
  createOutline, ellipsisHorizontalOutline, filterOutline, happyOutline,
  heart,
  heartHalfOutline, imageOutline, informationCircleOutline,
  locationOutline,
  logOutOutline, micOutline,
  peopleOutline, personAddOutline, personCircleOutline, send, star,
  trashOutline, trophyOutline, videocamOutline
} from "ionicons/icons";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, SideMenuComponent],
})
export class AppComponent {
  constructor() {
    addIcons({'corazon' : heartHalfOutline, createOutline, trashOutline, peopleOutline, locationOutline, logOutOutline,
      trophyOutline, personAddOutline, star, filterOutline, checkmarkOutline, cameraOutline, chatbubbleOutline,
      chevronBackOutline, videocamOutline, micOutline, imageOutline, happyOutline,
      informationCircleOutline, chatbubblesOutline, send, ellipsisHorizontalOutline, personCircleOutline })
  }
}
