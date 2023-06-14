export default function PageMySectionWhatsApp() {
  return (
    <div>
      <h3 className="font-bold text-xl">Seção WhatsApp</h3>

      <div className="mt-6 flex flex-col gap-y-2 items-baseline">
        <span className="block p-2 px-6 font-medium shadow-md bg-red-300 text-red-800 text-lg">
          Desconectado
        </span>
        <span className="text-lg text-orange-600">
          Você não possui nenhuma seção ativa
        </span>

        <button className="text-sky-700 bg-6 shadow-sm font-medium mt-3 p-2 px-5 border hover:bg-slate-50 duration-200">
          Conectar
        </button>
      </div>
    </div>
  );
}
