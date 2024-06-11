// app-routing.module.ts ou routes.ts selon votre configuration
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DiseaseComponent } from './components/disease/disease.component';
import { FirmComponent } from './components/firm/firm.component';
import { ProductComponent } from './components/product/product.component';
import {RiskComponent} from "./risk/risk.component";


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'diseases', component: DiseaseComponent },
  { path: 'firms', component: FirmComponent },
  { path: 'products', component: ProductComponent },
  { path: 'risks', component: RiskComponent }
];
