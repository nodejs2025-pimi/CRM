import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';
import { NumericTransformer } from '../../common/transformers/numeric.transformer';

@Entity('order_product')
@Check('"quantity" > 0')
@Check('"price" >= 0')
export class OrderProduct {
  @PrimaryColumn({
    type: 'integer',
  })
  order_id: number;

  @PrimaryColumn({
    type: 'integer',
    select: false,
  })
  @Exclude({ toPlainOnly: true })
  product_id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  quantity: number;

  @Column({
    type: 'numeric',
    nullable: false,
    transformer: new NumericTransformer(),
  })
  price: number;

  @ManyToOne(() => Order, (order) => order.orderProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.productOrders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
