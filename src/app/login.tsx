import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import Boton from '@/components/Boton';
import Pagina from '@/components/Pagina';
import { comun } from '@/constants/tema';
import { useBiblioteca } from '@/context/BibliotecaContext';

export default function Login() {
  const { iniciarSesion } = useBiblioteca();
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(false);

  function ingresar() {
    setError(!iniciarSesion(usuario, clave));
  }

  return (
    <Pagina>
      <Text accessibilityRole="header" style={comun.titulo}>Acceso del personal</Text>
      <View style={comun.tarjeta}>
        <Text style={comun.etiqueta}>Usuario</Text>
        <TextInput accessibilityLabel="Usuario" autoCapitalize="none" autoCorrect={false}
          value={usuario} onChangeText={setUsuario} style={comun.input} />
        <Text style={comun.etiqueta}>Clave</Text>
        <TextInput accessibilityLabel="Clave" secureTextEntry value={clave} onChangeText={setClave}
          onSubmitEditing={ingresar} style={comun.input} />
        {error && <Text accessibilityRole="alert" style={comun.etiqueta}>Revisá el usuario y la clave.</Text>}
        <Boton texto="Ingresar" icono="log-in-outline" accion={ingresar} />
      </View>
      <Text style={comun.cuerpo}>El mostrador se abre desde el botón Personal del Catálogo después de ingresar.</Text>
    </Pagina>
  );
}
