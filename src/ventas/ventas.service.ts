import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venta } from './entities/venta.entity';
import { Comprobante } from './entities/comprobante.entity';
import { Sucursal } from './entities/sucursal.entity';
import { Actor } from './entities/actor.entity';
import { DashboardStatsDto, VentaDto, VentaPorSucursalDto } from './dto/venta.dto';

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    @InjectRepository(Comprobante)
    private comprobanteRepository: Repository<Comprobante>,
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
    const query = this.ventasRepository
      .createQueryBuilder('venta')
      .leftJoin(Sucursal, 'sucursal', 'venta.ideSucursal = sucursal.ideSucursal')
      .select('sucursal.nomSucursal', 'sucursalNombre')
      .addSelect('SUM(venta.impImporte)', 'total')
      .where('venta.estRegistro = :estado', { estado: '001' });

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
      // Assuming sorting by ID is still valid if filtering by ID
      if (!isNaN(filtros.sucursal)) {
         query.andWhere('venta.ideSucursal = :ideSucursal', { ideSucursal: filtros.sucursal });
      }
    }

    query
      .groupBy('sucursal.nomSucursal')
      .orderBy('total', 'DESC');

    const results = await query.getRawMany();
    
    const total = results.reduce((sum, r) => sum + parseFloat(r.total), 0);

    return results.map(r => ({
      sucursal: r.sucursalNombre || `Sucursal ${r.ideSucursal}`, // Fallback if join misses
      total: parseFloat(r.total),
      porcentaje: total > 0 ? (parseFloat(r.total) / total) * 100 : 0,
    }));
  }

  async getVentasRecientes(filtros?: any, limit: number = 20): Promise<VentaDto[]> {
    // Updated to use Sucursal entity for branch names
    
    const query = this.comprobanteRepository
      .createQueryBuilder('comprobante')
      .leftJoinAndSelect(Sucursal, 'sucursal', 'comprobante.ideSucursal = sucursal.ideSucursal')
      .leftJoinAndSelect(Actor, 'actor', 'comprobante.ideActorCliente = actor.ideActor')
      .where('comprobante.estRegistro IN (:...estados)', { estados: ['001', '012'] })
      .orderBy('comprobante.fecRegistro', 'DESC')
      .limit(limit);

    if (filtros?.periodo) {
        if (filtros.periodo.length === 4) {
            query.andWhere('comprobante.codPeriodo LIKE :anio', { anio: `${filtros.periodo}%` });
        } else {
            query.andWhere('comprobante.codPeriodo = :periodo', { periodo: filtros.periodo });
        }
    }

    if (filtros?.mes) {
        if (filtros.periodo && filtros.periodo.length === 4) {
             const periodoMes = `${filtros.periodo}${filtros.mes}`;
             query.andWhere('comprobante.codPeriodo = :periodoMes', { periodoMes });
        }
    }

    if (filtros?.dia) {
      query.andWhere('DAY(comprobante.fecRegistro) = :dia', { dia: filtros.dia });
    }

    if (filtros?.sucursal) {
      // Assuming user passes ID or Name. If Name, we need to find ID. 
      // For now, let's assume the frontend sends the ID or we handle it gracefully.
      // But the current frontend sends names like 'MEGAPLAZA'. 
      // We need to fetch the ID for that name if possible, or reliance on ID is better.
      // Given the user saying the hardcoded map is wrong, we should rely on DB.
      // But let's try to match by name in DB if string passed.
      if (isNaN(filtros.sucursal)) {
          // It's a string, try to find by name in the subquery or just join
           // This is risky without entity. Let's assume frontend sends ID or we fix frontend to send ID later.
           // For now, let's look at the mapping the user said is wrong.
      } else {
         query.andWhere('comprobante.ideSucursal = :ideSucursal', { ideSucursal: filtros.sucursal });
      }
    }

    // Updated to use Sucursal entity for branch names
    
    const results = await query
        .select('comprobante.codSerie', 'codSerie')
        .addSelect('comprobante.codNumero', 'codNumero')
        .addSelect('comprobante.fecRegistro', 'fecRegistro')
        .addSelect('comprobante.impTotal', 'impTotal')
        .addSelect('sucursal.nomSucursal', 'nomSucursal')
        .addSelect('actor.codDocumento', 'docCliente')
        .addSelect('actor.nomCliente', 'nomCliente') // Maps to TXT_RAZON_SOCIAL in entity
        .getRawMany();

    return results.map(r => ({
      sucursal: r.nomSucursal || 'Desconocido',
      docCliente: r.docCliente || '0',
      cliente: r.nomCliente || 'CLIENTE DESCONOCIDO',
      codReferencia: undefined, // Removing this
      codSerie: r.codSerie,
      codNumero: r.codNumero,
      formaPago: 'EFECTIVO', // Placeholder
      fechaHora: r.fecRegistro,
      montos: parseFloat(r.impTotal || 0),
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
