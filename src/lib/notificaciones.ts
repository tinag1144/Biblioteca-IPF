import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL = 'prestamos';

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
  return () => Notifications.setNotificationHandler(null);
}

async function prepararCanal() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Préstamos de biblioteca',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function consultarNotificaciones() {
  if (Platform.OS === 'web') return { granted: false, canAskAgain: false };
  const permiso = await Notifications.getPermissionsAsync();
  return {
    granted: permiso.granted || permiso.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    canAskAgain: permiso.canAskAgain,
  };
}

export async function pedirNotificaciones() {
  if (Platform.OS === 'web') return consultarNotificaciones();
  await prepararCanal();
  await Notifications.requestPermissionsAsync();
  return consultarNotificaciones();
}

export async function programarRecordatorio(titulo: string) {
  await prepararCanal();
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Recordatorio de devolución', body: `Tenés pendiente devolver «${titulo}».` },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 15,
      channelId: CANAL,
    },
  });
}

export function cancelarRecordatorio(id: string) {
  return Notifications.cancelScheduledNotificationAsync(id);
}

export async function notificarEntrega(titulo: string) {
  if (!(await consultarNotificaciones()).granted) return false;
  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    content: { title: '¡Tu libro está listo!', body: `Se registró tu préstamo de «${titulo}».` },
    trigger: Platform.OS === 'android' ? { channelId: CANAL } : null,
  });
  return true;
}
