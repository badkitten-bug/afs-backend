import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gen_actor')
export class Actor {
  @PrimaryGeneratedColumn({ name: 'IDE_ACTOR' })
  ideActor: number;

  @Column({ name: 'COD_DOCUMENTO', nullable: true })
  codDocumento: string;

  @Column({ name: 'TXT_RAZON_SOCIAL', nullable: true })
  nomCliente: string;

  @Column({ name: 'TXT_APELLIDO_PATERNO', nullable: true })
  apePaterno: string;

  @Column({ name: 'TXT_APELLIDO_MATERNO', nullable: true })
  apeMaterno: string;

  @Column({ name: 'TXT_NOMBRES', nullable: true })
  nombres: string;
}
