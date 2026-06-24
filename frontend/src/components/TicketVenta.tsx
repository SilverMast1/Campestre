import React from 'react';

interface TicketVentaProps {
  cuenta: any;
  areaNombre?: string;
  cajeroNombre?: string;
}

export const TicketVenta: React.FC<TicketVentaProps> = ({ cuenta, areaNombre, cajeroNombre }) => {
  if (!cuenta) return null;

  const totalOriginal = cuenta.detalleCuentas?.reduce((acc: number, det: any) => acc + (Number(det.cantidad) * Number(det.precio_unitario)), 0) || 0;
  const descuento = Number(cuenta.descuento || 0);
  const propina = Number(cuenta.propina || 0);
  const subtotal = totalOriginal - descuento;
  const granTotal = subtotal + propina;

  return (
    <div id="printable-ticket" className="bg-white text-black w-[80mm] p-4 text-[12px] font-mono mx-auto hidden print:block absolute top-0 left-0">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase">Campestre</h2>
        <p className="text-xs">Bar & Palapa</p>
        <p className="text-[10px] mt-1">Ticket de Venta #{cuenta.id}</p>
        <p className="text-[10px]">{new Date().toLocaleString('es-MX')}</p>
      </div>

      <div className="border-t border-b border-black border-dashed py-2 mb-2 space-y-1 text-[11px]">
        <p><strong>Área:</strong> {areaNombre || 'Bar'}</p>
        <p><strong>Atendió:</strong> {cajeroNombre || 'Cajero'}</p>
        {cuenta.mesa && <p><strong>Mesa/Socio:</strong> {cuenta.mesa}</p>}
      </div>

      <table className="w-full text-left mb-2 text-[11px]">
        <thead>
          <tr className="border-b border-black border-dashed">
            <th className="py-1 w-2/12">Cant</th>
            <th className="py-1 w-6/12">Desc</th>
            <th className="py-1 w-4/12 text-right">Importe</th>
          </tr>
        </thead>
        <tbody>
          {cuenta.detalleCuentas?.map((item: any) => (
            <tr key={item.id}>
              <td className="py-1 align-top">{Number(item.cantidad)}</td>
              <td className="py-1 align-top pr-1">{item.producto?.nombre}</td>
              <td className="py-1 align-top text-right">${(Number(item.cantidad) * Number(item.precio_unitario)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-black border-dashed pt-2 space-y-1 text-right text-[11px]">
        <p>Subtotal: ${totalOriginal.toFixed(2)}</p>
        {descuento > 0 && <p>Descuento: -${descuento.toFixed(2)}</p>}
        {propina > 0 && <p>Propina: ${propina.toFixed(2)}</p>}
        <p className="text-[14px] font-bold mt-1">TOTAL: ${granTotal.toFixed(2)}</p>
      </div>

      <div className="border-t border-black border-dashed pt-2 mt-2 text-center text-[10px]">
        <p>Método de pago: <strong>{cuenta.metodo_pago || 'MÚLTIPLE'}</strong></p>
        <p className="mt-4 font-bold">¡Gracias por su visita!</p>
        <p className="mt-1 text-[8px]">Software by Antigravity</p>
      </div>
    </div>
  );
};
