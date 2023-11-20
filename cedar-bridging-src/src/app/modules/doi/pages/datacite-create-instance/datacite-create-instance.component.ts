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
import {SharedErrorService} from "../../../../services/shared-error.service";

@Component({
  selector: 'datacite-create-instance',
  templateUrl: './datacite-create-instance.component.html',
  styleUrls: ['./datacite-create-instance.component.scss']
})
export class DataciteCreateInstanceComponent extends CedarPageComponent implements OnInit {

  public sourceArtifactId: string | null = null;
  public ceeConfig: object = {};
  public template: object | null = null;
  public operation: string = 'Create'
  public draftDoi: object | null = null;
  public existingDataCiteMetadata: object | null = null;
  public showError:boolean = false;

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService,
    private http: HttpClient,
    private sharedErrorService: SharedErrorService
  ) {
    super(localSettings, translateService, notify, router, route, keycloak, uiService);
    this.sharedErrorService.showErrorChange.subscribe((showError:boolean) =>{
      this.showError = showError;
    });
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
      "terminologyIntegratedSearchUrl": globalAppConfig.terminologyProxyUrl,
    }

    const req = this.getDataCiteStartResponse();
    req.subscribe((response: HttpResponse<DataCiteCreateDOIStartResponse>) => {
      this.template = response.body?.dataCiteTemplate ?? null;
      this.draftDoi = response.body?.draftDoi ?? null;
      this.existingDataCiteMetadata = response.body?.existingDataCiteMetadata ?? null;
    });

  }

}


