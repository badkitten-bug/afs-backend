import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Comprobante } from './entities/comprobante.entity';
import { Sucursal } from './entities/sucursal.entity';
import { Actor } from './entities/actor.entity';
import { VentasService } from './ventas.service';
import { VentasMockService } from './ventas-mock.service';
import { VentasController } from './ventas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venta, Comprobante, Sucursal, Actor])],
  controllers: [VentasController],
  providers: [VentasService, VentasMockService],
  exports: [VentasService],
})
export class VentasModule {}
