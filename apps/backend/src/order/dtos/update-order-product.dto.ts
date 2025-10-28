import { AddOrderProductDto } from './add-order-product.dto';
import { OmitType, PartialType } from '@nestjs/swagger';

export class UpdateOrderProductDto extends PartialType(
  OmitType(AddOrderProductDto, ['product_id'] as const),
) {}
