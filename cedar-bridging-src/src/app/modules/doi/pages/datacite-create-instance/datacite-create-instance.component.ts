import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {UiService} from '../../../../services/ui.service';
import {KeycloakService} from "keycloak-angular";
import {Observable} from "rxjs";
import {DataCiteCreateDOIStartResponse} from "../../../shared/model/datacite-create-doi-start-response.model";
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'datacite-create-instance',
  templateUrl: './datacite-create-instance.component.html',
  styleUrls: ['./datacite-create-instance.component.scss']
})
export class DataciteCreateInstanceComponent extends CedarPageComponent implements OnInit {

  public sourceArtifactId: string | null = null;
  public ceeConfig: object = {};
  public template: object | null = null;

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

  getDataCiteStartResponse(): Observable<HttpResponse<DataCiteCreateDOIStartResponse>> {
    const url = globalAppConfig.bridgeUrl + 'datacite/create-doi?source_artifact_id=' +
      encodeURIComponent(this.sourceArtifactId ?? '');
    return this.http.get<DataCiteCreateDOIStartResponse>(
      url, {observe: 'response'});
  }

  override ngOnInit() {
    super.ngOnInit();

    this.sourceArtifactId = this.route.snapshot.paramMap.get('sourceArtifactId');

    this.ceeConfig = {
      "ceeConfig": {
        "showSampleTemplateLinks": false,
        "terminologyProxyUrl": globalAppConfig.terminologyProxyUrl,
        "collapseStaticComponents": false
      },
      "cedarUrl": globalAppConfig.cedarUrl,
      "terminologyUrl": globalAppConfig.terminologyProxyUrl
    }

    const req = this.getDataCiteStartResponse();
    req.subscribe((response: HttpResponse<DataCiteCreateDOIStartResponse>) => {
      this.template = response.body?.dataCiteTemplate ?? null;
    });

  }

}


