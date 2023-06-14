import {CedarPageComponent} from '../../components/base/cedar-page-component.component';
import {Component, OnInit} from '@angular/core';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from "keycloak-angular";
import {UiService} from "../../../../services/ui.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends CedarPageComponent implements OnInit {

  constructor(
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

  override ngOnInit() {
    super.ngOnInit();
  }
}
