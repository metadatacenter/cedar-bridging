import {TranslateService} from '@ngx-translate/core';
import {CedarBase} from './cedar-base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from "keycloak-angular";
import {Component, ChangeDetectionStrategy} from "@angular/core";
import {UiService} from "../../../../services/ui.service";

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export abstract class CedarPageComponent extends CedarBase {

  protected keycloakUserProfile: any;

  protected constructor(
    translateService: TranslateService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService
  ) {
    super(translateService, router, route, keycloak, uiService);
  }

  ngOnInit() {
    this.keycloak.loadUserProfile().then(data => {
      this.keycloakUserProfile = data;
    }).catch(error => console.log(error));
  }
}
