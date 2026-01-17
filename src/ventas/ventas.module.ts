import { Module } from '@nestjs/common';
import { VentasMockService } from './ventas-mock.service';
import { VentasController } from './ventas.controller';

@Module({
  imports: [],
  controllers: [VentasController],
  providers: [VentasMockService],
  exports: [VentasMockService],
})
export class VentasModule {}
