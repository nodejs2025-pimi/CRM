import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderProduct } from './order-product.entity';
import { Establishment } from '../../establishment/entities/establishment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column({
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  date: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    enumName: 'order_status_enum',
    default: OrderStatus.NEW,
  })
  status: OrderStatus;

  @ManyToOne(() => Establishment, (establishment) => establishment.orders, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'establishment_id' })
  establishment: Establishment;

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
  orderProducts: OrderProduct[];
}
