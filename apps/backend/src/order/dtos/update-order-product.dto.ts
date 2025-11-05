import { AddOrderProductDto } from './add-order-product.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateOrderProductDto extends PartialType(AddOrderProductDto) {}
