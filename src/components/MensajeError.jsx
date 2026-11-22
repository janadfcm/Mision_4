// Mensaje de error de un campo. Su id es el que el input pone en
// aria-describedby, así el lector de pantalla lo lee junto al campo.
// role="alert" hace que se anuncie en cuanto aparece.
export default function MensajeError({ nombre, error }) {
  if (!error) return null;
  return (
    <p id={`${nombre}-error`} role="alert" className="error">
      {error.message}
    </p>
  );
}
