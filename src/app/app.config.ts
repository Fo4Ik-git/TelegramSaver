import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideAnimationsAsync} from "@angular/platform-browser/animations/async";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";

export function TranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/',
    '.json');
}

export const provideTranslation = () => ({
  defaultLanguage: 'en',
  loader: {
    provide: TranslateLoader,
    useFactory: TranslateLoaderFactory,
    deps: [HttpClient],
  },
});
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
    importProvidersFrom([
      HttpClientModule,
      TranslateModule.forRoot(provideTranslation())
    ]),
    provideAnimationsAsync()]
};
