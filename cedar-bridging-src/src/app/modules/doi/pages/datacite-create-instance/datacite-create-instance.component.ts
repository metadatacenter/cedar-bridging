import { resourceSelector } from "../../../../resource-address";
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {UiService} from '../../../../services/ui.service';
import {KeycloakService} from "keycloak-angular";
import {Observable} from "rxjs";
import {DataCiteCreateDOIStartResponse} from "../../../shared/model/datacite-create-doi-start-response.model";
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {SharedErrorService} from "../../../../services/shared-error.service";
import {serverErrorText} from "../../../shared/util/server-error";

@Component({
  selector: 'datacite-create-instance',
  templateUrl: './datacite-create-instance.component.html',
  styleUrls: ['./datacite-create-instance.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class DataciteCreateInstanceComponent extends CedarPageComponent implements OnInit {

  public sourceArtifactId: string | null = null;
  public ceeConfig: object = {};
  public template: object | null = null;
  public draftDoi: object | null = null;
  public doiAlreadyExists = false;
  public existingDoi: string | null = null;
  // Why the form could not be opened, when the reason is anything but a DOI the artifact already has.
  public openError: string | null = null;
  public existingDataCiteMetadata: object | null = null;
  public showError: boolean = false;

  constructor(
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService,
    private http: HttpClient,
    private sharedErrorService: SharedErrorService
  ) {
    super(translateService, notify, router, route, keycloak, uiService);
    this.sharedErrorService.showErrorChange.subscribe((showError: boolean) => {
      this.showError = showError;
    });
  }


  getDataCiteStartResponse(): Observable<HttpResponse<DataCiteCreateDOIStartResponse>> {
    const url = globalAppConfig.bridgeUrl + 'datacite/create-doi?source_artifact_id=' +
      encodeURIComponent(resourceSelector(this.sourceArtifactId ?? ''));
    return this.http.get<DataCiteCreateDOIStartResponse>(
      url, {observe: 'response'});
  }

  override ngOnInit() {
    super.ngOnInit();

    this.sourceArtifactId = this.route.snapshot.paramMap.get('sourceArtifactId');

    this.ceeConfig = {
      "terminologyBaseUrl": globalAppConfig.terminologyBaseUrl,
      "bridgeBaseUrl": globalAppConfig.bridgeUrl,
    }
    const req = this.getDataCiteStartResponse();
    req.subscribe((response: HttpResponse<DataCiteCreateDOIStartResponse>) => {
        this.template = response.body?.dataCiteTemplate ?? null;
        this.draftDoi = response.body?.draftDoi ?? null;
        this.existingDataCiteMetadata = response.body?.existingDataCiteMetadata ?? null;
      },
      (response) => {
        this.doiAlreadyExists = response.error?.errorKey === 'doiAlreadyExists';
        this.existingDoi = response.error?.parameters?.doi ?? null;
        this.openError = this.doiAlreadyExists ? null : 'Error Opening The DataCite Form - ' + serverErrorText(response);
      });
  }

}


