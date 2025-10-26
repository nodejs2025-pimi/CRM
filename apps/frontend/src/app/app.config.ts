import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { registerLocaleData } from "@angular/common";
import localeUk from "@angular/common/locales/uk";

registerLocaleData(localeUk);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        { provide: LOCALE_ID, useValue: "uk-UA" },
    ],
};
