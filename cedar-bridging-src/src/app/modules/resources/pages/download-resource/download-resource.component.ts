import {DownloadArtifactAvailableResponse} from "../../../shared/model/download-artifact-available-response.model";
import {CedarPageComponent} from "../../../shared/components/base/cedar-page-component.component";
import {Component, OnInit} from "@angular/core";
import {LocalSettingsService} from "../../../../services/local-settings.service";
import {TranslateService} from "@ngx-translate/core";
import {SnotifyService} from "ng-alt-snotify";
import {ActivatedRoute, Router} from "@angular/router";
import {KeycloakService} from "keycloak-angular";
import {UiService} from "../../../../services/ui.service";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {SharedErrorService} from "../../../../services/shared-error.service";
import {Observable} from "rxjs";
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {RestApiUrlService} from "../../../../services/rest-api-url.service";

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

  public imagePath: string = '../../../assets/images/download/';

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    keycloak: KeycloakService,
    uiService: UiService,
    private http: HttpClient,
    private sharedErrorService: SharedErrorService,
    private restApiUrlService: RestApiUrlService
  ) {
    super(localSettings, translateService, notify, router, route, keycloak, uiService);
    this.sharedErrorService.showErrorChange.subscribe((showError: boolean) => {
      this.showError = showError;
    });
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

  quickDownload(format: string) {
    let downloadUrl: string | null = null
    if (this.sourceArtifactId !== null) {
      if (this.sourceArtifactId.indexOf('template-fields') !== -1) {
        downloadUrl = this.restApiUrlService.downloadTemplateField(this.sourceArtifactId, format === 'yamlc');
      } else if (this.sourceArtifactId.indexOf('template-elements') !== -1) {
        downloadUrl = this.restApiUrlService.downloadTemplateElement(this.sourceArtifactId, format === 'yamlc');
      } else if (this.sourceArtifactId.indexOf('template-instances') !== -1) {
        downloadUrl = this.restApiUrlService.downloadTemplateInstance(this.sourceArtifactId, format === 'yamlc');
      } else if (this.sourceArtifactId.indexOf('templates') !== -1) {
        downloadUrl = this.restApiUrlService.downloadTemplate(this.sourceArtifactId, format === 'yamlc');
      }
    }

    var accept = '*/*'
    if (format == 'json') {
      accept='application/json';
    } else if (format == 'yaml' || format == 'yamlc') {
      accept='application/x-yaml';
    }

    const headers = new HttpHeaders({
      'Accept': accept,
    });

    this.http.post(downloadUrl ?? '', {}, {
      headers: headers,
      responseType: 'blob',
      observe: 'response'
    }).subscribe((response: HttpResponse<Blob>) => {
      if (response.body) {
        // Extract the filename from the 'Content-Disposition' header
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'downloaded_file.yaml'; // Default file name

        if (contentDisposition) {
          // Use a regular expression to extract the filename
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches && matches[1]) {
            fileName = matches[1].replace(/['"]/g, ''); // Remove any quotes around the filename
          }
        }

        // Create a URL for the blob and trigger the download
        const blob = response.body;
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(downloadUrl); // Clean up the blob URL
      } else {
        console.error('Response body is null');
      }
    }, error => {
      console.error('Download failed', error); // Handle error
    });

  }
}
