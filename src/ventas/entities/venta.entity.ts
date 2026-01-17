import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cjb_orden')
export class Venta {
  @PrimaryGeneratedColumn({ name: 'IDE_ORDEN' })
  ideOrden: number;

  @Column({ name: 'COD_ORDEN' })
  codOrden: string;

  @Column({ name: 'IDE_SUCURSAL' })
  ideSucursal: number;

  @Column({ name: 'IDE_ACTOR_CLIENTE' })
  ideActorCliente: number;

  @Column({ name: 'FEC_REGISTRO' })
  fecRegistro: Date;

  @Column({ name: 'TIP_MONEDA' })
  tipMoneda: string;

  @Column({ name: 'IMP_IMPORTE', type: 'decimal', precision: 18, scale: 6 })
  impImporte: number;

  @Column({ name: 'COD_PERIODO' })
  codPeriodo: string;

  @Column({ name: 'EST_REGISTRO' })
  estRegistro: string;
}
