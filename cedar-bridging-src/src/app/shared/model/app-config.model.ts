export class AppConfig {
  appUrl: string = '';
  cedarUrl: string = '';
  bridgeUrl: string = '';
  terminologyUrl: string = '';
  terminologyProxyUrl: string = '';
  keycloakUrl: string = '';
  loaded: boolean = false;

  init(appConfig: AppConfig) {
    const domain = (window as any).cedarDomain;
    this.appUrl = appConfig.appUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
    this.bridgeUrl = appConfig.bridgeUrl.replace('{{cedarDomain}}', domain);
    this.terminologyUrl = appConfig.terminologyUrl.replace('{{cedarDomain}}', domain);
    this.terminologyProxyUrl = appConfig.terminologyProxyUrl.replace('{{cedarDomain}}', domain);
    this.keycloakUrl = appConfig.keycloakUrl.replace('{{cedarDomain}}', domain);
    this.loaded = true;
  }
}

