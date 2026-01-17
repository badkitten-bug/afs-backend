export class VentaDto {
  sucursal: string;
  docCliente: string;
  cliente: string;
  codReferencia: string;
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

export class FiltrosVentaDto {
  sucursal?: string;
  formaPago?: string;
  periodo?: string;
  mes?: string;
}
