import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("@layouts/layout/layout").then((m) => m.Layout),
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
];
