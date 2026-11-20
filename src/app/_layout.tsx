import NavegacionRaiz from '@/components/NavegacionRaiz';
import { BibliotecaProvider } from '@/context/BibliotecaContext';

export const unstable_settings = { anchor: '(tabs)' };

export default function LayoutRaiz() {
  return <BibliotecaProvider><NavegacionRaiz /></BibliotecaProvider>;
}
