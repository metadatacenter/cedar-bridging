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

  public downloadTemplate(templateId: string) {
    return `${this.resourceTemplates()}/${encodeURIComponent(templateId)}/download?download=true`;
  }

  public downloadTemplateField(templateId: string) {
    return `${this.resourceTemplateFields()}/${encodeURIComponent(templateId)}/download?download=true`;
  }

  public downloadTemplateElement(templateId: string) {
    return `${this.resourceTemplateElements()}/${encodeURIComponent(templateId)}/download?download=true`;
  }

  public downloadTemplateInstance(templateId: string) {
    return `${this.resourceTemplateInstances()}/${encodeURIComponent(templateId)}/download?download=true`;
  }

}
