import {Injectable} from '@angular/core';
import {globalAppConfig} from "../../environments/global-app-config";

@Injectable({
  providedIn: 'root'
})
export class RestApiUrlService {

  private readonly API_RESOURCE_URL: string;

  constructor() {
    this.API_RESOURCE_URL = globalAppConfig.resourceUrl;
  }

  private resourceBase() {
    return `${this.API_RESOURCE_URL}`;
  }

  private resourceTemplates() {
    return `${this.resourceBase()}templates`;
  }

  private resourceTemplateFields() {
    return `${this.resourceBase()}template-fields`;
  }

  private resourceTemplateElements() {
    return `${this.resourceBase()}template-elements`;
  }

  private resourceTemplateInstances() {
    return `${this.resourceBase()}template-instances`;
  }

  public downloadTemplate(templateId: string, compact:boolean) {
    return `${this.resourceTemplates()}/${encodeURIComponent(templateId)}/download?compact=${compact}`;
  }

  public downloadTemplateField(templateId: string, compact:boolean) {
    return `${this.resourceTemplateFields()}/${encodeURIComponent(templateId)}/download?compact=${compact}`;
  }

  public downloadTemplateElement(templateId: string, compact:boolean) {
    return `${this.resourceTemplateElements()}/${encodeURIComponent(templateId)}/download?compact=${compact}`;
  }

  public downloadTemplateInstance(templateId: string, compact:boolean) {
    return `${this.resourceTemplateInstances()}/${encodeURIComponent(templateId)}/download?compact=${compact}`;
  }

}
