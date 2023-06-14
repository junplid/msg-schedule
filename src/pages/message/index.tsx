export default function PageMessageWhatsApp() {
  return (
    <div>
      <h3 className="font-bold text-xl">Mensagens</h3>

      <div className="mt-6 bg-6">
        <div className="p-4 px-5 flex justify-between items-center bg-7">
          <h4 className="font-medium text-slate-50">Mensagens automáticas</h4>
          <button className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200">
            Adicionar nova mensagem
          </button>
        </div>
        <table className="shadow-md bg-white w-full">
          <tr className="border-b last:border-0 hover:bg-slate-100 cursor-pointer">
            <td className="pl-8 pr-4 py-4">
              <div>
                <h3 className="font-medium text-slate-700">
                  Menssagem de 5 dias antes do vencimento
                </h3>
                <p className="text-slate-400 font-light">
                  Mensagem será enviada Automáticamente 5 dias antes do
                  vencimento
                </p>
              </div>
            </td>
            <td align="right" className="pr-8 pl-4 py-4">
              <span className="p-2 px-6 font-medium bg-red-100 text-sm text-red-600">
                Desconectado
              </span>
            </td>
          </tr>
          <tr className="border-b last:border-0 hover:bg-slate-100 cursor-pointer">
            <td className="pl-8 pr-4 py-4">
              <div>
                <h3 className="font-medium text-slate-700">
                  Menssagem de 5 dias antes do vencimento
                </h3>
                <p className="text-slate-400 font-light">
                  Mensagem será enviada Automáticamente 5 dias antes do
                  vencimento
                </p>
              </div>
            </td>
            <td align="right" className="pr-8 pl-4 py-4">
              <span className="p-2 px-6 font-medium bg-red-100 text-sm text-red-600">
                Desconectado
              </span>
            </td>
          </tr>
          <tr className="border-b last:border-0 hover:bg-slate-100 cursor-pointer">
            <td className="pl-8 pr-4 py-4">
              <div>
                <h3 className="font-medium text-slate-700">
                  Menssagem de 5 dias antes do vencimento
                </h3>
                <p className="text-slate-400 font-light">
                  Mensagem será enviada Automáticamente 5 dias antes do
                  vencimento
                </p>
              </div>
            </td>
            <td align="right" className="pr-8 pl-4 py-4">
              <span className="p-2 px-6 font-medium bg-red-100 text-sm text-red-600">
                Desconectado
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  );
}
