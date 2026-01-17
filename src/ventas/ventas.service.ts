import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { DashboardStatsDto, VentaDto, VentaPorSucursalDto } from './dto/venta.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
  ) {}

  async getDashboardStats(filtros?: any): Promise<DashboardStatsDto> {
    // Obtener ventas agrupadas por sucursal
    const ventasPorSucursal = await this.getVentasPorSucursal(filtros);
    
    // Obtener ventas recientes
    const ventasRecientes = await this.getVentasRecientes(filtros);
    
    // Calcular totales
    const totalVentas = ventasPorSucursal.reduce((sum, v) => sum + v.total, 0);
    const totalMes = totalVentas; // Esto se puede calcular con filtros específicos
    
    return {
      ventasPorSucursal,
      ventasRecientes,
      totalVentas,
      totalMes,
    };
  }

  async getVentasPorSucursal(filtros?: any): Promise<VentaPorSucursalDto[]> {
    // Mapeo de IDs de sucursales a nombres (deberías ajustar esto según tu BD)
    const sucursales = {
      1: 'MEGAPLAZA',
      2: 'CHACARILLA',
      3: 'MALL BELLAVISTA',
      4: 'HIGUERETA',
      5: 'JESUS MARIA',
    };

    const query = this.ventasRepository
      .createQueryBuilder('venta')
      .select('venta.ideSucursal', 'ideSucursal')
      .addSelect('SUM(venta.impImporte)', 'total')
      .where('venta.estRegistro = :estado', { estado: '001' })
      .groupBy('venta.ideSucursal')
      .orderBy('total', 'DESC');

    const results = await query.getRawMany();

    const total = results.reduce((sum, r) => sum + parseFloat(r.total), 0);

    return results.map(r => ({
      sucursal: sucursales[r.ideSucursal] || `Sucursal ${r.ideSucursal}`,
      total: parseFloat(r.total),
      porcentaje: (parseFloat(r.total) / total) * 100,
    }));
  }

  async getVentasRecientes(filtros?: any, limit: number = 20): Promise<VentaDto[]> {
    const sucursales = {
      1: 'MEGAPLAZA',
      2: 'CHACARILLA',
      3: 'MALL BELLAVISTA',
      4: 'HIGUERETA',
      5: 'JESUS MARIA',
    };

    const query = this.ventasRepository
      .createQueryBuilder('venta')
      .where('venta.estRegistro = :estado', { estado: '001' })
      .orderBy('venta.fecRegistro', 'DESC')
      .limit(limit);

    const ventas = await query.getMany();

    return ventas.map(venta => ({
      sucursal: sucursales[venta.ideSucursal] || `Sucursal ${venta.ideSucursal}`,
      docCliente: venta.ideActorCliente?.toString() || '0',
      cliente: 'CLIENTE GENERICO', // Esto requeriría JOIN con tabla de clientes
      codReferencia: venta.codOrden,
      formaPago: 'EFECTIVO', // Esto requeriría JOIN con tabla de formas de pago
      fechaHora: venta.fecRegistro,
      montos: parseFloat(venta.impImporte.toString()),
    }));
  }

  async getSucursales(): Promise<string[]> {
    return ['MEGAPLAZA', 'CHACARILLA', 'MALL BELLAVISTA', 'HIGUERETA', 'JESUS MARIA'];
  }

  async getFormasPago(): Promise<string[]> {
    return ['EFECTIVO', 'TARJETA D/DINERS', 'YAPE', 'PLIN'];
  }
}
