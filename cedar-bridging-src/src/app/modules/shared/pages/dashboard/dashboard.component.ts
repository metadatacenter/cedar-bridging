import {CedarPageComponent} from '../../components/base/cedar-page-component.component';
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {ActivatedRoute, Router} from '@angular/router';
import {KeycloakService} from "keycloak-angular";
import {UiService} from "../../../../services/ui.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class DashboardComponent extends CedarPageComponent implements OnInit {

  constructor(
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService
  ) {
    super(translateService, notify, router, route, keycloak, uiService);
  }

  override ngOnInit() {
    super.ngOnInit();
  }
}
