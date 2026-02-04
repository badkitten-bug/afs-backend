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
    
    let totalMes = 0;

    if (filtros?.periodo) {
        // Si hay filtro de periodo, el total mostrado YA es el total del periodo (mes o año)
        totalMes = totalVentas;
    } else {
        // Si no hay filtro, calculamos el mes actual por defecto para "Total Mes"
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const currentPeriod = `${year}${month}`;
        
        // Reutilizamos getVentasPorSucursal para obtener el total del mes actual
        // creando un filtro interno
        const ventasMesActual = await this.getVentasPorSucursal({ periodo: currentPeriod });
        totalMes = ventasMesActual.reduce((sum, v) => sum + v.total, 0);
    }
    
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
      .where('venta.estRegistro = :estado', { estado: '001' });

    if (filtros?.periodo) {
      if (filtros.periodo.length === 4) {
        // Year only, e.g., '2026'
        query.andWhere('venta.codPeriodo LIKE :anio', { anio: `${filtros.periodo}%` });
      } else {
        // YearMonth, e.g., '202601'
        query.andWhere('venta.codPeriodo = :periodo', { periodo: filtros.periodo });
      }
    }

    // Handle 'mes' filter
    if (filtros?.mes) {
        // If we have a year (periodo=YYYY), we can construct YYYYMM.
        // Or if we just filter by month regardless of year (unlikely but possible).
        // For now, let's assume if period is YYYY, we append month.
        if (filtros.periodo && filtros.periodo.length === 4) {
             const periodoMes = `${filtros.periodo}${filtros.mes}`;
             query.andWhere('venta.codPeriodo = :periodoMes', { periodoMes });
        }
    }

    if (filtros?.dia) {
      query.andWhere('DAY(venta.fecRegistro) = :dia', { dia: filtros.dia });
    }

    if (filtros?.sucursal) {
      // Provide reverse mapping or check if ID
       const sucursalMapReverse = {
        'MEGAPLAZA': 1,
        'CHACARILLA': 2,
        'MALL BELLAVISTA': 3,
        'HIGUERETA': 4,
        'JESUS MARIA': 5,
      };
      const ideSucursal = sucursalMapReverse[filtros.sucursal] || filtros.sucursal;
      query.andWhere('venta.ideSucursal = :ideSucursal', { ideSucursal });
    }

    query
      .groupBy('venta.ideSucursal')
      .orderBy('total', 'DESC');

    const results = await query.getRawMany();
    
    const total = results.reduce((sum, r) => sum + parseFloat(r.total), 0);

    return results.map(r => ({
      sucursal: sucursales[r.ideSucursal] || `Sucursal ${r.ideSucursal}`,
      total: parseFloat(r.total),
      porcentaje: total > 0 ? (parseFloat(r.total) / total) * 100 : 0,
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

    if (filtros?.periodo) {
        if (filtros.periodo.length === 4) {
            query.andWhere('venta.codPeriodo LIKE :anio', { anio: `${filtros.periodo}%` });
        } else {
            query.andWhere('venta.codPeriodo = :periodo', { periodo: filtros.periodo });
        }
    }

    if (filtros?.mes) {
        if (filtros.periodo && filtros.periodo.length === 4) {
             const periodoMes = `${filtros.periodo}${filtros.mes}`;
             query.andWhere('venta.codPeriodo = :periodoMes', { periodoMes });
        }
    }

    if (filtros?.dia) {
      query.andWhere('DAY(venta.fecRegistro) = :dia', { dia: filtros.dia });
    }

    if (filtros?.sucursal) {
         const sucursalMapReverse = {
        'MEGAPLAZA': 1,
        'CHACARILLA': 2,
        'MALL BELLAVISTA': 3,
        'HIGUERETA': 4,
        'JESUS MARIA': 5,
      };
      const ideSucursal = sucursalMapReverse[filtros.sucursal] || filtros.sucursal;
      query.andWhere('venta.ideSucursal = :ideSucursal', { ideSucursal });
    }

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

  async getYears(): Promise<string[]> {
    const result = await this.ventasRepository
      .createQueryBuilder('venta')
      .select('DISTINCT LEFT(venta.codPeriodo, 4)', 'anio')
      .where('venta.codPeriodo IS NOT NULL')
      .orderBy('anio', 'DESC')
      .getRawMany();

    console.log('DEBUG getYears result:', result);

    return result.map(r => r.anio);
  }
}
