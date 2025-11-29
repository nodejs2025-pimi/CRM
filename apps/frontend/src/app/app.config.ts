import {
    ApplicationConfig,
    LOCALE_ID,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { registerLocaleData } from "@angular/common";
import localeUk from "@angular/common/locales/uk";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { interceptor } from "@shared/interceptor/interceptor";

registerLocaleData(localeUk);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([interceptor])),
        { provide: LOCALE_ID, useValue: "uk-UA" },
    ],
};
