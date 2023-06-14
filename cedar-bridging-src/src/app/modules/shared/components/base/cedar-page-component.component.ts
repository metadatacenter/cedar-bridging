import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {CedarBase} from './cedar-base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {KeycloakService} from "keycloak-angular";
import {Component} from "@angular/core";
import {UiService} from "../../../../services/ui.service";

@Component({
  template: ''
})
export abstract class CedarPageComponent extends CedarBase {

  protected keycloakUserProfile: any;

  protected constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService
  ) {
    super(localSettings, translateService, notify, router, route, keycloak, uiService);
  }

  ngOnInit() {
    this.keycloak.loadUserProfile().then(data => {
      this.keycloakUserProfile = data;
    }).catch(error => console.log(error));
    clearTimeout(this.uiService.healthCheckTimeout);
    clearTimeout(this.uiService.redisQueueCountTimeout);
  }


  private preDataIsLoaded() {
  }
}
