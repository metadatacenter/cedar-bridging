import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AuthGuard} from "../../guard/auth.guard";
import {DownloadResourceComponent} from "./pages/download-resource/download-resource.component";

export const routes: Routes = [
  {
    path: 'resources/download/:sourceArtifactId',
    component: DownloadResourceComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {
}
