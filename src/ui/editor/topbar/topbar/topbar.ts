import { Component, NgZone } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import userInteractor from 'core/user/userInteractor';
import eventBus from 'ui/common/event-bus';

@Component({
  selector: 'topbar',
  styleUrls: ['./topbar.scss'],
  templateUrl: './topbar.html',
})
export class Topbar {

  private isInFlatMode: boolean = true;

  private menuState = {
    about: false,
  };

  private profileIsOpen = false;
  private storyIsOpen = false;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
  }


  ngAfterViewInit() {
    //this.router.events
    this.router.events
    //this.activatedRoute.queryParams
    //  .map(params => params[SHARED_KEY])
    //  .filter(value => !!value)
      .filter(event => event instanceof NavigationEnd)
      //.filter(event => this.router.url.includes("modal"))
      .map(event => this.router.url)
      .subscribe(
        currentUrl => {
          //console.log(currentUrl);
          if (currentUrl.includes('modal:profile')) {
            this.profileIsOpen = true;
            this.storyIsOpen = false;
          } else if (currentUrl.includes('modal:story')) {
            this.profileIsOpen = false;
            this.storyIsOpen = true;
          } else {
            //console.log('something else');
            this.profileIsOpen = false;
            this.storyIsOpen = false;
            this.ngZone.run(() => {
            });  //manually run angular digest cycle
          }
        },
        error => console.log('error', error),
      );
  }

  private onMenuItemClick(key) {
    if (this.menuState[key] === undefined) return;

    this.menuState[key] = !this.menuState[key];
    eventBus.onHotspotVisibility(this.menuState[key]);
  }

  private onOffMenuItemClick($event, key) {
    if (!$event.isOffClick || this.menuState[key] === undefined || !this.menuState[key]) return;

    this.ngZone.run(() => {
      this.menuState[key] = false;
      eventBus.onHotspotVisibility(this.menuState[key]);
    });
  }

  private userIsLoggedIn(): boolean {
    return userInteractor.isLoggedIn();
  }

  private setEditPlaySliderIsVisible(): boolean {
    return false;
  }
}
