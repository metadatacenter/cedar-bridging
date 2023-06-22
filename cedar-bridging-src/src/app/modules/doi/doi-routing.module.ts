import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {DataciteCreateInstanceComponent} from "./pages/datacite-create-instance/datacite-create-instance.component";
import {AuthGuard} from "../../guard/auth.guard";

export const routes: Routes = [
  {
    path: 'doi/datacite/:sourceArtifactId',
    component: DataciteCreateInstanceComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoiRoutingModule {
}
