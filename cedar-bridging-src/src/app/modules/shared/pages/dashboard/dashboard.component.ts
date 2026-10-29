import {CedarPageComponent} from '../../components/base/cedar-page-component.component';
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
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
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService
  ) {
    super(translateService, router, route, keycloak, uiService);
  }

  override ngOnInit() {
    super.ngOnInit();
  }
}
