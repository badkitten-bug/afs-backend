import { Controller, Get, Query } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { FiltrosVentaDto } from './dto/venta.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get('dashboard')
  async getDashboard(@Query() filtros: FiltrosVentaDto) {
    return this.ventasService.getDashboardStats(filtros);
  }

  @Get('por-sucursal')
  async getVentasPorSucursal(@Query() filtros: FiltrosVentaDto) {
    return this.ventasService.getVentasPorSucursal(filtros);
  }

  @Get('recientes')
  async getVentasRecientes(@Query() filtros: FiltrosVentaDto) {
    return this.ventasService.getVentasRecientes(filtros);
  }

  @Get('sucursales')
  async getSucursales() {
    return this.ventasService.getSucursales();
  }

  @Get('formas-pago')
  async getFormasPago() {
    return this.ventasService.getFormasPago();
  }

  @Get('anios')
  async getYears() {
    return this.ventasService.getYears();
  }
}
