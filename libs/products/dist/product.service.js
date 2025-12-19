"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const product_repository_interface_1 = require("./interfaces/product-repository.interface");
let ProductService = class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async exportCsv() {
        const products = await this.productRepository.getAll();
        const headers = [
            'product_id',
            'name',
            'available_quantity',
            'price',
            'wholesale_price',
            'wholesale_minimum_quantity',
            'is_active',
        ];
        const normCsv = (v) => {
            if (v === null || v === undefined)
                return '';
            let s;
            if (typeof v === 'object') {
                try {
                    s = JSON.stringify(v);
                }
                catch {
                    s = String(v);
                }
            }
            else {
                s = String(v);
            }
            if (/^[=+\-@;]/.test(s))
                s = `'${s}`;
            if (/[",\n\r]/.test(s))
                s = `"${s.replace(/"/g, '""')}"`;
            return s;
        };
        const lines = [];
        lines.push(headers.join(','));
        for (const p of products) {
            lines.push([
                normCsv(p.product_id),
                normCsv(p.name),
                normCsv(p.available_quantity),
                normCsv(p.price),
                normCsv(p.wholesale_price),
                normCsv(p.wholesale_minimum_quantity),
                normCsv(p.is_active ? 'yes' : 'no'),
            ].join(','));
        }
        return lines.join('\n');
    }
    async getList(q) {
        return this.productRepository.findWithFilters(q);
    }
    async getById(id) {
        const product = await this.productRepository.findById(id);
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        return product;
    }
    async create(dto) {
        return this.productRepository.create(dto);
    }
    async update(id, attrs) {
        const product = await this.productRepository.findById(id);
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        Object.assign(product, attrs);
        return this.productRepository.update(product);
    }
    async remove(id) {
        const product = await this.productRepository.findById(id);
        if (!product)
            throw new common_1.NotFoundException('Product not found.');
        await this.productRepository.delete(product);
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(product_repository_interface_1.PRODUCT_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], ProductService);
//# sourceMappingURL=product.service.js.map