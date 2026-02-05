import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vta_comprobante')
export class Comprobante {
  @PrimaryGeneratedColumn({ name: 'IDE_COMPROBANTE' })
  ideComprobante: number;

  @Column({ name: 'COD_SERIE' })
  codSerie: string;

  @Column({ name: 'COD_NUMERO' })
  codNumero: string;

  @Column({ name: 'IDE_SUCURSAL' })
  ideSucursal: number;

  @Column({ name: 'IDE_ACTOR_CLIENTE' })
  ideActorCliente: number;



  @Column({ name: 'FEC_REGISTRO' })
  fecRegistro: Date;

  @Column({ name: 'IMP_TOTNETO', type: 'decimal', precision: 18, scale: 2 })
  impTotal: number;

  @Column({ name: 'COD_PERIODO' })
  codPeriodo: string;

  @Column({ name: 'EST_REGISTRO' })
  estRegistro: string;
    
  @Column({ name: 'TXT_FORMA_PAGO' })
  txtFormaPago: string;
}
