import "./styles.scss";
import { useCallback, useState } from "react";
import { useCollapse } from "react-collapsed";
import { HiChevronDown } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

interface propsField_I {
  text?: string;
  days?: number;
}

interface propsModal {
  setModal(vl: boolean): void;
  label: string;
  type: "EDIT" | "ADD";
  initValues?: propsField_I;
  actions: {
    onCreate(fields: propsField_I): Promise<void>;
  };
}

const ModalCreate = (props: propsModal): JSX.Element => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({});
  const [fields, setFields] = useState<propsField_I>(
    props.initValues as propsField_I
  );

  return (
    <div className="py-5 flex justify-center items-center flex-col fixed top-0 left-0 w-screen h-screen">
      <div className="max-w-2xl w-full bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-3 text-white flex justify-between items-center font-medium text-lg">
          <span>{props.label}</span>
          <button className="icon-2" onClick={() => props.setModal(false)}>
            <IoClose />
          </button>
        </div>
        <label className="mt-5 px-5 block">
          <span className="text-slate-600">Mensagem</span>
          <textarea
            value={fields?.text ?? ""}
            onChange={(e) =>
              setFields({ ...fields, [e.target.name]: e.target.value })
            }
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
        <div className="gap-x-4 flex justify-between px-5 pb-5">
          <input
            className="pl-3 border"
            min={0}
            type="text"
            name="days"
            value={`Dias: ${fields?.days ?? 0}`}
            onChange={(e) =>
              setFields({
                ...fields,
                [e.target.name]: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="Dias antes do vencimento"
          />
          <div className="flex gap-x-4 justify-end">
            <button
              onClick={() => props.setModal(false)}
              className="text-red-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                props.actions?.onCreate({
                  ...fields,
                  days: Number(String(fields.days).replace(/\D/g, "")),
                })
              }
              className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
            >
              {props.type === "ADD" && "Criar"}
              {props.type === "EDIT" && "Salvar"}
            </button>
          </div>
        </div>
      </div>
      <div
        onClick={() => props.setModal(false)}
        className="fixed top-0 left-0 w-screen h-screen bg-3 backdrop-blur-sm bg-white/30"
      ></div>
    </div>
  );
};

export default function PageMessageWhatsApp() {
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalCreate, setOpenModalCreate] = useState(false);

  const onCreate = useCallback(async (fields: propsField_I) => {
    try {
      console.log(fields);
    } catch (error) {}
  }, []);

  return (
    <div>
      {openModalCreate && (
        <ModalCreate
          actions={{ onCreate }}
          type="ADD"
          label="Criar nova mensagem de vencimento"
          setModal={setOpenModalCreate}
        />
      )}
      <h3 className="font-bold text-xl">Mensagens</h3>

      <div className="mt-6 bg-6">
        <div className="p-4 px-5 flex justify-between items-center bg-7">
          <h4 className="font-medium text-slate-50">
            Mensagens automáticas de vencimento
          </h4>
          <button
            onClick={() => setOpenModalCreate(true)}
            className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Adicionar nova mensagem
          </button>
        </div>
        <table className="shadow-md bg-white w-full">
          <tbody>
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
                  Desativada
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
                  Desativada
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
                  Desativada
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
