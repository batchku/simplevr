import { Component, OnDestroy, OnInit } from "@angular/core"
import { Router } from "@angular/router"
import { AssetInteractor } from "core/asset/assetInteractor"
import { UserInteractor } from "core/user/userInteractor"
import eventBus from "ui/common/event-bus"

@Component({
  selector: "unauth-user-tab",
  styleUrls: ["./unauth-user-tab.scss"],
  templateUrl: "./unauth-user-tab.html"
})
export class UnauthUserTab implements OnInit, OnDestroy {
  private user: any = null

  constructor(
    private router: Router,
    private assetInteractor: AssetInteractor,
    private userInteractor: UserInteractor,
  ) {}

  ngOnInit() {
    this.user = {
      email: "",
      password: ""
    }
  }

  ngOnDestroy() {
    // this._authStateSubscription.unsubscribe();
  }

  private _onError(message) {
    const errorHeader: string = "Sign in error"
    const errorBody: string =
      message || "It looks like the email and password don't match."

    eventBus.onModalMessage(errorHeader, errorBody)
  }

  public onLogin() {
    if (!this.user.email || !this.user.password) {
      const errorHeader: string = "Email Password Error"
      const errorBody: string =
        "Make sure to fill out both email and password fields!"

      eventBus.onModalMessage(errorHeader, errorBody)
      return
    }

    this.userInteractor.login(this.user.email, this.user.password);
  }

  public onLoginWithGoogle() {
    this.userInteractor.loginWithGoogle();
  }

  public onOpenClick() {
    if (!this.userInteractor.isLoggedIn()) {
      eventBus.onModalMessage(
        "Error",
        "You must be logged in to download as .zip"
      )
      return
    }

    eventBus.onOpenFileLoader("zip")
    this.router.navigate([
      "/editor",
      { outlets: { view: "flat", modal: null } }
    ])

    return
  }
}
