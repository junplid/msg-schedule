import { useState } from "react";
import { useCollapse } from "react-collapsed";
import { HiChevronDown } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { LoadComponent } from "../../../components/load";

interface propsField_I {
  text: string;
  id: number;
}

interface propsModalNotfity_I {
  id: number;
  full_name: string;
  whatsapp: string;
}

interface propsModal {
  info: {
    id: number;
    full_name: string;
    whatsapp: string;
  };
  setModal(vl: propsModalNotfity_I | null): void;
  actions(fields: propsField_I): Promise<boolean>;
}

export const ModalNotify = (props: propsModal): JSX.Element => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({});
  const [fields, setFields] = useState("" as string);
  const [load, setLoad] = useState<boolean>(false as boolean);
  const [send, setSend] = useState<number>(3 as number);

  return (
    <div className="py-5 flex justify-center items-center flex-col fixed top-0 left-0 w-screen h-screen">
      <div className="max-w-2xl w-full bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-3 text-slate-100 flex justify-between items-center text-lg">
          <span>
            Enviar notificação para{" "}
            <strong>
              {props.info.full_name}:{props.info.whatsapp}
            </strong>
          </span>
          <button className="icon-2" onClick={() => props.setModal(null)}>
            <IoClose />
          </button>
        </div>
        <label className="mt-5 px-5 block">
          <span className="text-slate-600">Mensagem</span>
          <textarea
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            className="outline-teal-700 border p-1 mt-3 w-full"
            rows={9}
            name="text"
          />
        </label>
        <div className="px-5 mt-3 pb-5">
          <div className="bg-7 mt-2">
            <button
              {...getToggleProps()}
              className="p-2 px-3 text-white flex items-center justify-between w-full"
            >
              <div className={`flex items-center duration-200`}>
                <span className="text-lg">Gatilhos de mensagem</span>
              </div>
              <div
                className={`icon-aside duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                <HiChevronDown />
              </div>
            </button>
            <ul className="bg-5" {...getCollapseProps()}>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{NOME}"}</strong>: Nome completo
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{PRIMEIRO_NOME}"}</strong>: Primeiro Nome
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{ZAP}"}</strong>: Whatsapp
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{LOGIN"} </strong>: Login
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{SENHA}"}</strong>: Senha
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{PLANO}"}</strong>: Plano
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{PRODUTO}"}</strong>: Produto/Mensal
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{OBS}"}</strong>: Observações
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{DATA_VENCI}"}</strong>: Data de Vencimento
              </li>
            </ul>
          </div>
        </div>
        <div className="pb-5 px-5 flex gap-x-4 justify-end">
          <button
            onClick={() => props.setModal(null)}
            className="text-red-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (!load) {
                setLoad(true);
                const status = await props.actions({
                  text: fields,
                  id: props.info.id,
                });
                setLoad(false);
                setSend(Number(status));
                setTimeout(() => setSend(3), 3000);
              }
            }}
            className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            {load && <LoadComponent />}
            {!load && send === 1 && "Enviada!"}
            {!load && send === 0 && "Error!"}
            {!load && send === 3 && "Enviar mensagem"}
          </button>
        </div>
      </div>
      <div
        onClick={() => props.setModal(null)}
        className="fixed top-0 left-0 w-screen h-screen bg-3 backdrop-blur-sm bg-teal-900/60"
      ></div>
    </div>
  );
};
