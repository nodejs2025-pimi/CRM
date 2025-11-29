import { Routes } from "@angular/router";
import { authGuard } from "@shared/guards/auth.guard";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("@layouts/layout/layout").then((m) => m.Layout),
        canActivate: [authGuard],
        children: [
            {
                path: "analytics",
                loadComponent: () => import("@pages/analytics/analytics").then((m) => m.Analytics),
            },
            {
                path: "shops",
                loadComponent: () => import("@pages/shops/shops").then((m) => m.Shops),
            },
            {
                path: "products",
                loadComponent: () => import("@pages/products/products").then((m) => m.Products),
            },
            {
                path: "orders",
                loadComponent: () => import("@pages/orders/orders").then((m) => m.Orders),
            },
            {
                path: "",
                redirectTo: "analytics",
                pathMatch: "full",
            },
        ],
    },
    {
        path: "auth",
        loadComponent: () => import("@layouts/auth/auth").then((m) => m.Auth),
        children: [
            {
                path: "login",
                loadComponent: () => import("@pages/login/login").then((m) => m.Login),
            },
            {
                path: "",
                redirectTo: "login",
                pathMatch: "full",
            },
        ],
    },
    {
        path: "**",
        redirectTo: "",
        pathMatch: "full",
    },
];
