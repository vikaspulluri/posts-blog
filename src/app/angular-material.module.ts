import { NgModule } from '@angular/core';
import { MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatExpansionModule,
  MatProgressBarModule,
  MatPaginatorModule } from '@angular/material';
import { MatToolbarModule } from '@angular/material/toolbar';


@NgModule({
  imports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatPaginatorModule
  ],
  exports: [
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatPaginatorModule
  ]
})
export class AngularMaterialModule {

}
