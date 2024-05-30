import { Routes } from "@angular/router";
import { HomeComponent } from "./components/home/home.component";
import { DiseaseComponent } from "./components/disease/disease.component";
import { FirmComponent } from "./components/firm/firm.component";
import { ProductComponent } from "./components/product/product.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'diseases', component: DiseaseComponent },
  { path: 'firms', component: FirmComponent },
  { path: 'products', component: ProductComponent }
];
