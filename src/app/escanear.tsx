import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import Boton from '@/components/Boton';
import EstadoVista from '@/components/EstadoVista';
import Pagina from '@/components/Pagina';
import { color, comun, medida, radio } from '@/constants/tema';
import { usePermiso } from '@/hooks/usePermiso';
import { buscarPorIsbn } from '@/lib/catalogo';

export default function Escanear() {
  const { estado, error, reintentar } = usePermiso('camara');
  const [enFoco, setEnFoco] = useState(false);
  const [entrada, setEntrada] = useState('');
  const [aviso, setAviso] = useState('');
  const [falloCamara, setFalloCamara] = useState(false);
  const navegando = useRef(false);
  const ultimoInvalido = useRef('');

  useFocusEffect(useCallback(() => {
    navegando.current = false;
    ultimoInvalido.current = '';
    setEnFoco(true);
    return () => setEnFoco(false);
  }, []));

  function abrirLibro(isbn: string, desdeCamara = false) {
    if (navegando.current || (desdeCamara && ultimoInvalido.current === isbn)) return;
    if (!/^\d{13}$/.test(isbn)) {
      setAviso('Ingresá un ISBN de 13 dígitos.');
      return;
    }
    const libro = buscarPorIsbn(isbn);
    if (!libro) {
      if (desdeCamara) ultimoInvalido.current = isbn;
      setAviso(`No encontramos el ISBN ${isbn}. Probá con otro libro.`);
      return;
    }

    navegando.current = true;
    router.replace({ pathname: '/libro/[isbn]', params: { isbn } }, { withAnchor: true });
  }

  function leerCodigo({ data, type }: BarcodeScanningResult) {
    if (type === 'ean13') abrirLibro(data, true);
  }

  const manual = () => abrirLibro(entrada.replace(/[\s-]/g, ''));

  return (
    <Pagina>
      <Text accessibilityRole="header" style={comun.titulo}>Leé la contratapa</Text>
      {Platform.OS === 'web'
        ? <EstadoVista titulo="Escáner disponible en el teléfono" detalle="Podés ingresar el ISBN a continuación." icono="scan-outline" />
        : error
          ? <EstadoVista titulo="No pudimos consultar la cámara." boton={{ texto: 'Reintentar', accion: reintentar }} />
          : estado === 'cargando'
            ? <EstadoVista titulo="Consultando el permiso de cámara…" cargando />
            : estado !== 'concedido'
              ? <EstadoVista
                  titulo={estado === 'bloqueado' ? 'La cámara está bloqueada' : 'Escaneá con la cámara'}
                  detalle="El ingreso manual está disponible más abajo."
                  icono="camera-outline"
                  boton={{
                    texto: estado === 'bloqueado' ? 'Ver ajustes de cámara' : 'Habilitar cámara',
                    accion: () => router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } }),
                  }}
                />
              : falloCamara
                ? <EstadoVista titulo="No pudimos abrir la cámara." boton={{ texto: 'Reintentar', accion: () => setFalloCamara(false) }} />
                : enFoco && <View style={estilos.marco}>
                    <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13'] }}
                      onBarcodeScanned={leerCodigo} onMountError={() => setFalloCamara(true)} />
                    <View pointerEvents="none" style={estilos.visor} />
                  </View>}
      <View style={comun.tarjeta}>
        <Text accessibilityRole="header" style={comun.seccion}>Ingresá el ISBN</Text>
        <TextInput accessibilityLabel="ISBN de 13 dígitos" keyboardType="number-pad"
          placeholder="ISBN de 13 dígitos" placeholderTextColor={color.tenue} value={entrada}
          onChangeText={setEntrada} onSubmitEditing={manual} style={comun.input} />
        <Boton texto="Abrir ficha" icono="search-outline" accion={manual} />
      </View>
      {!!aviso && <Text accessibilityRole="alert" style={comun.etiqueta}>{aviso}</Text>}
    </Pagina>
  );
}

const estilos = StyleSheet.create({
  marco: {
    height: medida.camara, overflow: 'hidden', borderRadius: radio.l,
    backgroundColor: color.tinta, alignItems: 'center', justifyContent: 'center',
  },
  visor: { width: '70%', height: medida.visor, borderWidth: 2, borderColor: color.papel, borderRadius: radio.l },
});
