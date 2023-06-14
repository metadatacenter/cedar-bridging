import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {HttpClient} from '@angular/common/http';
import {UiService} from '../../../../services/ui.service';
import {KeycloakService} from "keycloak-angular";

@Component({
  selector: 'datacite-create-instance',
  templateUrl: './datacite-create-instance.component.html',
  styleUrls: ['./datacite-create-instance.component.scss']
})
export class DataciteCreateInstanceComponent extends CedarPageComponent implements OnInit {

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService,
    private http: HttpClient
  ) {
    super(localSettings, translateService, notify, router, route, keycloak, uiService);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

}


