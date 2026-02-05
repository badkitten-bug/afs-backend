import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('inv_almacen')
export class Sucursal {
  @PrimaryGeneratedColumn({ name: 'IDE_ALMACEN' })
  ideSucursal: number;

  @Column({ name: 'TXT_ALMACEN' })
  nomSucursal: string;

  @Column({ name: 'EST_REGISTRO' })
  estRegistro: string;
}
