import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from '../shared';
import {MaterialModule} from '../material-module';
import {ResourcesRoutingModule} from "./resources-routing.module";
import {DownloadResourceComponent} from "./pages/download-resource/download-resource.component";


@NgModule({
  declarations: [
    DownloadResourceComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    SharedModule,
    ResourcesRoutingModule,
    MaterialModule
  ],
  exports: [],
  providers: []
})
export class ResourcesModule {
}
