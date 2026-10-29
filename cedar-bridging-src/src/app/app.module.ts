import {exactJsonInterceptor} from './exact-json.interceptor';
import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SharedModule} from "./modules/shared";
import {DoiModule} from "./modules/doi/doi.module";
import {MaterialModule} from "./modules/material-module";
import {provideHttpClient, withInterceptors, withInterceptorsFromDi, withXhr} from "@angular/common/http";
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";
import {initializeKeycloak} from "./init/keycloak-init.factory";
import {KeycloakAngularModule, KeycloakService} from "keycloak-angular";
import {AppConfigService} from "./services/app-config.service";



const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

@NgModule({
  declarations: [
    AppComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    DoiModule,
    MaterialModule,
    KeycloakAngularModule,
  ],
  providers: [
    provideHttpClient(withXhr(), withInterceptors([exactJsonInterceptor]), withInterceptorsFromDi()),
    provideTranslateService({loader: provideTranslateHttpLoader()}),
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
