export class VentaDto {
  sucursal: string;
  docCliente: string;
  cliente: string;
  codReferencia?: string;
  codSerie: string;
  codNumero: string;
  formaPago: string;
  fechaHora: Date;
  montos: number;
}

export class VentaPorSucursalDto {
  sucursal: string;
  total: number;
  porcentaje: number;
}

export class DashboardStatsDto {
  ventasPorSucursal: VentaPorSucursalDto[];
  ventasRecientes: VentaDto[];
  totalVentas: number;
  totalMes: number;
}

import { IsOptional, IsString } from 'class-validator';

export class FiltrosVentaDto {
  @IsOptional()
  @IsString()
  sucursal?: string;

  @IsOptional()
  @IsString()
  formaPago?: string;

  @IsOptional()
  @IsString()
  periodo?: string;

  @IsOptional()
  @IsString()
  mes?: string;

  @IsOptional()
  @IsString()
  dia?: string;
}
