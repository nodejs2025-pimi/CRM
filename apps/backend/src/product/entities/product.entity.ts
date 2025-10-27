import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  OneToMany,
} from 'typeorm';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';
import { OrderProduct } from '../../order/entities/order-product.entity';

@Entity('products')
@Check('"available_quantity" >= 0')
@Check('"price" >= 0')
@Check('"wholesale_price" >= 0')
@Check('"wholesale_minimum_quantity" >= 0')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  available_quantity: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: new NumericTransformer(),
  })
  price: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: new NumericTransformer(),
  })
  wholesale_price: number;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  wholesale_minimum_quantity: number;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  is_active: boolean;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  productOrders: OrderProduct[];
}
