import {DownloadArtifactAvailableResponse} from "../../../shared/model/download-artifact-available-response.model";
import {DownloadArtifactWizardState} from "../../../shared/model/download-artifact-wizard-state.model";
import {CedarPageComponent} from "../../../shared/components/base/cedar-page-component.component";
import {Component, OnInit} from "@angular/core";
import {LocalSettingsService} from "../../../../services/local-settings.service";
import {TranslateService} from "@ngx-translate/core";
import {SnotifyService} from "ng-alt-snotify";
import {ActivatedRoute, Router} from "@angular/router";
import {KeycloakService} from "keycloak-angular";
import {UiService} from "../../../../services/ui.service";
import {HttpClient, HttpResponse} from "@angular/common/http";
import {SharedErrorService} from "../../../../services/shared-error.service";
import {Observable} from "rxjs";
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'download-resource',
  templateUrl: './download-resource.component.html',
  styleUrls: ['./download-resource.component.scss']
})
export class DownloadResourceComponent extends CedarPageComponent implements OnInit {

  public sourceArtifactId: string | null = null;
  public showError: boolean = false;
  public errorKey: string | null = null;

  public available: boolean | null = null;
  public accessible: boolean | null = null;
  public artifactType: string | null = null;
  public schemaName: string | null = null;
  public schemaDescription: string | null = null;
  public availableFormats: string[] | null = null;
  public templateAvailable: boolean | null = null;
  public templateAccessible: boolean | null = null;
  public downloadUri: string | null = null;

  public wizardState: DownloadArtifactWizardState = new DownloadArtifactWizardState();

  public imagePath: string = '../../../assets/images/download/';

  public serializationFormatSubtitle: string = '';
  public serializationFormatImageUrl: string = '';

  public packageSubtitle: string = '';
  public packageImageUrl: string = '';

  public downloadFormatSubtitle: string = '';
  public downloadFormatImageUrl: string = '';

  public deliverSubtitle: string = ''
  public deliverImageUrl: string = '';

  public actionTitle: string = '';
  public actionImageUrl: string = '';
  public actionLinkText: string = '';


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
    this.sharedErrorService.showErrorChange.subscribe((showError: boolean) => {
      this.showError = showError;
    });
    this.updateSerializationFormat('json');
    this.updatePackage('instance');
    this.updateDownloadFormat('raw');
    this.updateDeliver('download');
  }

  getArtifactAvailableResponse(): Observable<HttpResponse<DownloadArtifactAvailableResponse>> {
    const url = globalAppConfig.bridgeUrl + 'download/artifact-available?source_artifact_id=' +
      encodeURIComponent(this.sourceArtifactId ?? '');
    return this.http.get<DownloadArtifactAvailableResponse>(
      url, {observe: 'response'});
  }

  override ngOnInit() {
    super.ngOnInit();

    this.sourceArtifactId = this.route.snapshot.paramMap.get('sourceArtifactId');

    const req = this.getArtifactAvailableResponse();
    req.subscribe((response: HttpResponse<DownloadArtifactAvailableResponse>) => {
        this.available = response.body?.available ?? null;
        this.accessible = response.body?.accessible ?? null;
        this.artifactType = response.body?.artifactType ?? null;
        this.schemaName = response.body?.schemaName ?? null;
        this.schemaDescription = response.body?.schemaDescription ?? null;
        this.availableFormats = response.body?.availableFormats ?? null;
        this.templateAvailable = response.body?.templateAvailable ?? null;
        this.templateAccessible = response.body?.templateAccessible ?? null;
        this.downloadUri = response.body?.downloadUri ?? null;
      },
      (response) => {
        this.errorKey = response.error?.errorKey ?? null;
      });
  }

  updateSerializationFormat(format: 'json' | 'yaml' | 'yamlc') {
    this.wizardState.serializationFormat = format;

    switch (format) {
      case 'json':
        this.serializationFormatSubtitle = 'JSON Schema';
        this.serializationFormatImageUrl = 'serialization-json-schema.png'; // example image
        break;
      case 'yaml':
        this.serializationFormatSubtitle = 'YAML';
        this.serializationFormatImageUrl = 'serialization-yaml.png'; // example image
        break;
      case 'yamlc':
        this.serializationFormatSubtitle = 'Compact YAML';
        this.serializationFormatImageUrl = 'serialization-yaml-compact.png'; // example image
        break;
    }
  }

  pickJSON() {
    this.updateSerializationFormat('json');
  }

  pickYAML() {
    this.updateSerializationFormat('yaml');
  }

  pickYAMLCompact() {
    this.updateSerializationFormat('yamlc');
  }

  updateDownloadFormat(format: 'raw' | 'zip') {
    this.wizardState.downloadFormat = format;

    switch (format) {
      case 'raw':
        this.downloadFormatSubtitle = 'Raw';
        this.downloadFormatImageUrl = 'download-raw.png'; // example image
        break;
      case 'zip':
        this.downloadFormatSubtitle = 'Zip';
        this.downloadFormatImageUrl = 'download-zip.png'; // example image
        break;
    }
  }

  pickRaw() {
    this.updateDownloadFormat('raw');
  }

  pickZip() {
    this.updateDownloadFormat('zip');
  }


  updateDeliver(deliver: 'download' | 'in-browser') {
    this.wizardState.deliver = deliver;

    switch (deliver) {
      case 'download':
        this.deliverSubtitle = 'Download and Save';
        this.deliverImageUrl = 'deliver-download.png';
        this.actionImageUrl = 'action-download.png';
        break;
      case 'in-browser':
        this.deliverSubtitle = 'Show in Browser';
        this.deliverImageUrl = 'deliver-in-browser.png';
        this.actionImageUrl = 'action-in-browser.png';
        break;
    }

    this.actionTitle = this.deliverSubtitle;
    this.actionLinkText = 'Click to ' + this.actionTitle;
  }

  pickDeliverDownload() {
    this.updateDeliver('download');
  }

  pickDeliverInBrowser() {
    this.updateDeliver('in-browser');
  }

  updatePackage(packageContent: 'instance' | 'with-template') {
    this.wizardState.packageContent = packageContent;

    switch (packageContent) {
      case 'instance':
        this.packageSubtitle = 'Just the Instance';
        this.packageImageUrl = 'package-instance.png';
        break;
      case 'with-template':
        this.packageSubtitle = 'Include the Template';
        this.packageImageUrl = 'package-with-template.png';
        break;
    }
  }

  pickPackageJustInstance() {
    this.updatePackage('instance');
  }

  pickPackageTemplateAsWell() {
    this.updatePackage('with-template');
  }
}
