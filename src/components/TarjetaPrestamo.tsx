import { StyleSheet, Switch, Text, View } from 'react-native';

import { color, comun, medida } from '@/constants/tema';
import type { Libro, Prestamo } from '@/types';
import Boton from './Boton';

const fecha = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

type Props = {
  libro: Libro;
  prestamo: Prestamo;
  procesando: boolean;
  cambiarRecordatorio: (activo: boolean) => void;
  devolver: () => void;
};

export default function TarjetaPrestamo({ libro, prestamo, procesando, cambiarRecordatorio, devolver }: Props) {
  return (
    <View style={comun.tarjeta}>
      <Text style={comun.subtitulo}>{libro.titulo}</Text>
      <Text style={comun.cuerpo}>Devolvé el {fecha.format(new Date(prestamo.vence))}.</Text>
      <View style={comun.fila}>
        <Text style={[comun.cuerpo, comun.flexible]}>Recordarme</Text>
        <Switch accessibilityLabel={`Recordarme la devolución de ${libro.titulo}`}
          disabled={procesando} value={Boolean(prestamo.recordatorio)} onValueChange={cambiarRecordatorio}
          trackColor={{ false: color.borde, true: color.rosaFuerte }}
          style={estilos.interruptor} />
      </View>
      <Boton texto="Devolver" variante="suave" icono="return-down-back-outline" deshabilitado={procesando} accion={devolver} />
    </View>
  );
}

const estilos = StyleSheet.create({ interruptor: { minWidth: medida.tactil, minHeight: medida.tactil } });
