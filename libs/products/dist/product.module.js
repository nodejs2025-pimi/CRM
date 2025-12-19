"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProductModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const common_1 = require("@nestjs/common");
const product_controller_1 = require("./product.controller");
const product_service_1 = require("./product.service");
const product_repository_interface_1 = require("./interfaces/product-repository.interface");
let ProductModule = ProductModule_1 = class ProductModule {
    static forRoot(options) {
        return {
            module: ProductModule_1,
            imports: options.imports || [],
            controllers: [product_controller_1.ProductController],
            providers: [
                product_service_1.ProductService,
                {
                    provide: product_repository_interface_1.PRODUCT_REPOSITORY,
                    useClass: options.repository,
                },
            ],
            exports: [product_service_1.ProductService],
        };
    }
};
exports.ProductModule = ProductModule;
exports.ProductModule = ProductModule = ProductModule_1 = __decorate([
    (0, common_1.Module)({})
], ProductModule);
//# sourceMappingURL=product.module.js.map