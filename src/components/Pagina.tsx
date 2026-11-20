import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { comun } from '@/constants/tema';

export default function Pagina({ children }: { children: ReactNode }) {
  return <ScrollView style={comun.pagina} contentContainerStyle={comun.contenido} keyboardShouldPersistTaps="handled">{children}</ScrollView>;
}
