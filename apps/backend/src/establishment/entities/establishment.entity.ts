import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Check,
  OneToMany,
} from 'typeorm';
import { EstablishmentType } from '../enums/establishment-type.enum';
import { Order } from '../../order/entities/order.entity';

@Entity('establishments')
@Check(`"email" ~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$'`)
@Check(`"phone" ~ '^\\+380[0-9]{9}$'`)
export class Establishment {
  @PrimaryGeneratedColumn()
  establishment_id: number;

  @Column({
    type: 'enum',
    enum: EstablishmentType,
    enumName: 'establishment_type_enum',
    nullable: false,
  })
  type: EstablishmentType;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 13,
    unique: true,
    nullable: false,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  address: string;

  @OneToMany(() => Order, (order) => order.establishment)
  orders: Order[];
}
