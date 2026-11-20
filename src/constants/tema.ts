import { Platform, StyleSheet } from 'react-native';

export const color = {
  fondo: '#FAF6F2',
  papel: '#FFFCF9',
  rosa: '#F1DDDF',
  rosaSuave: '#F8EBED',
  rosaFuerte: '#8B4056',
  tinta: '#38242B',
  tenue: '#6F535B',
  borde: '#E8D4D6',
  verde: '#3A594A',
  verdeSuave: '#E7EEE7',
  blanco: '#FFFFFF',
  lomoRosa: '#BF8294',
  lomoVerde: '#B6C5AD',
};

export const espacio = { xs: 4, s: 8, m: 12, l: 16, xl: 20, xxl: 24, grande: 32, amplio: 40 };
export const radio = { s: 8, m: 12, l: 18, xl: 24, redondo: 99 };
export const medida = {
  tactil: 44, boton: 50, icono: 20, iconoChico: 16, marca: 40, portada: 46, alturaPortada: 60,
  ancho: 760, camara: 244, visor: 150, hero: 185, dibujo: 106, libro: 20,
  lomos: [66, 76, 53], tarjetaReciente: 236, tapaBorde: 3,
};
export const letra = {
  chica: 12,
  etiqueta: 13,
  cuerpo: 15,
  media: 17,
  seccion: 23,
  titulo: 33,
  hero: 34,
  interlineadoHero: 38,
  interlineadoCuerpo: 22,
  serif: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
};

export const comun = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: color.fondo },
  contenido: {
    width: '100%', maxWidth: medida.ancho, alignSelf: 'center',
    paddingHorizontal: espacio.xl, paddingTop: espacio.xl, paddingBottom: espacio.amplio,
    gap: espacio.l,
  },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio.m },
  flexible: { flex: 1 },
  tarjeta: {
    backgroundColor: color.papel, borderColor: color.borde, borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radio.l, padding: espacio.l, gap: espacio.m,
  },
  titulo: { color: color.tinta, fontFamily: letra.serif, fontSize: letra.titulo },
  seccion: { color: color.tinta, fontFamily: letra.serif, fontSize: letra.seccion },
  subtitulo: { color: color.tinta, fontSize: letra.media, fontWeight: '600' },
  cuerpo: { color: color.tenue, fontSize: letra.cuerpo, lineHeight: letra.interlineadoCuerpo },
  etiqueta: { color: color.rosaFuerte, fontSize: letra.etiqueta, fontWeight: '700' },
  input: {
    minHeight: medida.boton, borderRadius: radio.m, borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.rosaFuerte, backgroundColor: color.papel, paddingHorizontal: espacio.l,
    color: color.tinta, fontSize: letra.cuerpo,
  },
});

export const encabezado = {
  headerStyle: { backgroundColor: color.papel },
  headerTintColor: color.rosaFuerte,
  headerTitleStyle: { fontFamily: letra.serif },
};
