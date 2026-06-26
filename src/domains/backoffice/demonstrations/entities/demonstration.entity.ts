import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/shared';

export enum DemonstrationStatus {
  PENDING = 'PENDIENTE',
  EXECUTED = 'EJECUTADA',
  CANCELLED = 'CANCELADA',
}

@Entity({ name: 'demostraciones', schema: 'backoffice' })
export class Demonstration extends BaseEntity {
  @Column({ name: 'nombre', type: 'text' })
  name: string;

  @Column({ name: 'email', type: 'text' })
  email: string;

  @Column({ name: 'telefono', type: 'text', nullable: true })
  phone?: string | null;

  @Column({ name: 'fecha_agendamiento', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'producto_interes', type: 'text', nullable: true })
  productInterest?: string | null;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: DemonstrationStatus,
    enumName: 'estado_demostracion',
    default: DemonstrationStatus.PENDING,
  })
  status: DemonstrationStatus;
}
