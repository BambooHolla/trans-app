import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListSharedModule } from "../../shared/list-shared.module";
import { SearchItemPage } from "./search-item-page";
// import { HttpModule } from "@angular/http";
import { SearchService } from "./search.service";

@NgModule({
  declarations: [
    SearchItemPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchItemPage),
    ListSharedModule,
    // HttpModule,
  ],
  providers: [
    SearchService,
  ],
  exports: [
    SearchItemPage,
  ]
})
export class SearchItemPageModule {}
