import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { NgOptimizedImage } from "@angular/common";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, RouterLink, HttpClientModule, NgOptimizedImage, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nico-patho-ui';

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('en'); // Default
  }

  switchLanguage(language: string): void {
    this.translate.use(language);
  }
}
