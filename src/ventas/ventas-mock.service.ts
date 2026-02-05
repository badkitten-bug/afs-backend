import { Injectable } from '@nestjs/common';
import { DashboardStatsDto, VentaDto, VentaPorSucursalDto } from './dto/venta.dto';

@Injectable()
export class VentasMockService {
  private readonly sucursales = ['MEGAPLAZA', 'CHACARILLA', 'MALL BELLAVISTA', 'HIGUERETA', 'JESUS MARIA'];
  private readonly formasPago = ['EFECTIVO', 'TARJETA D/DINERS', 'YAPE', 'PLIN'];

  async getDashboardStats(filtros?: any): Promise<DashboardStatsDto> {
    const ventasPorSucursal = this.getVentasPorSucursal(filtros);
    const ventasRecientes = this.getVentasRecientes(filtros);
    const totalVentas = ventasPorSucursal.reduce((sum, v) => sum + v.total, 0);
    
    return {
      ventasPorSucursal,
      ventasRecientes,
      totalVentas,
      totalMes: totalVentas * 0.75, // Simular 75% del total
    };
  }

  getVentasPorSucursal(filtros?: any): VentaPorSucursalDto[] {
    // Datos de ejemplo basados en la imagen
    const data = [
      { sucursal: 'MEGAPLAZA', total: 35981, porcentaje: 49.2 },
      { sucursal: 'CHACARILLA', total: 18087, porcentaje: 23.2 },
      { sucursal: 'MALL BELLAVISTA', total: 14446.5, porcentaje: 15.6 },
      { sucursal: 'HIGUERETA', total: 7111.5, porcentaje: 9.1 },
      { sucursal: 'JESUS MARIA', total: 2207.1, porcentaje: 3.0 },
    ];

    return data;
  }

  getVentasRecientes(filtros?: any, limit: number = 50): VentaDto[] {
    const ventas: VentaDto[] = [];
    const clientes = [
      'CONDORI QUISPE LIFF KAREM',
      'BARRIENCHEA UBILLUS EVELYN GISELL',
      'CLIENTES VARIOS',
      'PEREZ GARCIA MARIA',
      'RODRIGUEZ SANCHEZ JUAN',
      'TORRES MENDOZA ANA',
    ];

    for (let i = 0; i < limit; i++) {
      const sucursal = this.sucursales[Math.floor(Math.random() * this.sucursales.length)];
      const formaPago = this.formasPago[Math.floor(Math.random() * this.formasPago.length)];
      const cliente = clientes[Math.floor(Math.random() * clientes.length)];
      
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - Math.floor(Math.random() * 30));
      fecha.setHours(Math.floor(Math.random() * 12) + 9); // Entre 9am y 9pm
      fecha.setMinutes(Math.floor(Math.random() * 60));

      ventas.push({
        sucursal,
        docCliente: `${Math.floor(Math.random() * 90000000) + 10000000}`,
        cliente,
        codSerie: 'T00' + Math.floor(Math.random() * 5 + 1),
        codNumero: String(Math.floor(Math.random() * 1000000)).padStart(8, '0'),
        formaPago,
        fechaHora: fecha,
        montos: Math.floor(Math.random() * 500) + 15,
      });
    }

    // Ordenar por fecha descendente
    return ventas.sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime());
  }

  async getSucursales(): Promise<string[]> {
    return this.sucursales;
  }

  async getFormasPago(): Promise<string[]> {
    return this.formasPago;
  }
}
