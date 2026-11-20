import { isRunningInExpoGo } from 'expo';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';

const CANAL = 'prestamos';
const DEMORA = 15;
const PREFIJO = 'expo-go:';
const expoGoAndroid = Platform.OS === 'android' && isRunningInExpoGo();
const permisoAndroid = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
const temporizadores = new Map<string, ReturnType<typeof setTimeout>>();
let siguienteId = 0;

export function configurarNotificaciones() {
  if (Platform.OS === 'web') return undefined;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  return () => {
    Notifications.setNotificationHandler(null);
    temporizadores.forEach((timer) => clearTimeout(timer));
    temporizadores.clear();
  };
}

async function prepararCanal() {
  if (Platform.OS !== 'android') return undefined;
  try {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Préstamos de biblioteca',
      importance: AndroidImportance.HIGH,
    });
    return CANAL;
  } catch (error) {
    if (!expoGoAndroid || !(error instanceof Error) ||
      !error.message.includes('NullPointerException')) throw error;
    return undefined;
  }
}

export async function consultarNotificaciones() {
  if (Platform.OS === 'web') return { granted: false, canAskAgain: false };
  const permiso = await Notifications.getPermissionsAsync();
  const concedidoEnExpoGo = expoGoAndroid && Number(Platform.Version) >= 33 &&
    permiso.status === 'undetermined' && await PermissionsAndroid.check(permisoAndroid);
  return {
    granted: permiso.granted || concedidoEnExpoGo ||
      permiso.ios?.status === IosAuthorizationStatus.PROVISIONAL,
    canAskAgain: permiso.canAskAgain,
  };
}

export async function pedirNotificaciones() {
  if (Platform.OS === 'web') return consultarNotificaciones();
  const canal = await prepararCanal();
  if (expoGoAndroid && !canal && Number(Platform.Version) >= 33) {
    const respuesta = await PermissionsAndroid.request(permisoAndroid);
    return {
      granted: respuesta === PermissionsAndroid.RESULTS.GRANTED,
      canAskAgain: respuesta !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
    };
  }
  await Notifications.requestPermissionsAsync({
    android: {},
    ios: { allowAlert: true, allowSound: true },
  });
  return consultarNotificaciones();
}

export async function programarRecordatorio(titulo: string, alFallar: () => void) {
  const canal = await prepararCanal();
  const content = { title: 'Recordatorio de devolución', body: `Tenés pendiente devolver «${titulo}».` };

  if (expoGoAndroid && !canal) {
    const id = `${PREFIJO}${++siguienteId}`;
    const timer = setTimeout(() => {
      temporizadores.delete(id);
      void Notifications.scheduleNotificationAsync({ content, trigger: null }).catch(alFallar);
    }, DEMORA * 1000);
    temporizadores.set(id, timer);
    return id;
  }

  return Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: DEMORA,
      channelId: canal,
    },
  });
}

export async function cancelarRecordatorio(id: string) {
  if (id.startsWith(PREFIJO)) {
    const timer = temporizadores.get(id);
    if (timer !== undefined) clearTimeout(timer);
    temporizadores.delete(id);
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function notificarEntrega(titulo: string) {
  if (!(await consultarNotificaciones()).granted) return false;
  const canal = await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    content: { title: '¡Tu libro está listo!', body: `Se registró tu préstamo de «${titulo}».` },
    trigger: canal ? { channelId: canal } : null,
  });
  return true;
}
