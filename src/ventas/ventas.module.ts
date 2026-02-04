import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { VentasService } from './ventas.service';
import { VentasMockService } from './ventas-mock.service';
import { VentasController } from './ventas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Venta])],
  controllers: [VentasController],
  providers: [VentasService, VentasMockService],
  exports: [VentasService],
})
export class VentasModule {}
