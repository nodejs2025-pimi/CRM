import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
  })
  password_hash: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  address: string;
}
