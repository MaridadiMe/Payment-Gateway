import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { VehicleStatus } from '../enums/vehicle-status.enum';
import { CapacityUnit } from '../enums/capacity-unit.enum';
@Entity({ name: 'ORDERS' })
export class Order extends BaseEntity {
  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  capacity: number;

  @Column({
    type: 'enum',
    enum: CapacityUnit,
  })
  capacityUnit: CapacityUnit;

  @Column({ nullable: true })
  route: string;
}
