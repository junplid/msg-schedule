import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import DatePicker from "react-date-picker";
import { LoadComponent } from "../../../components/load";
import { useCookies } from "react-cookie";
import { useCollapse } from "react-collapsed";
import { HiChevronDown } from "react-icons/hi";

interface propsAction_I {
  newDate: Date;
  customerId: number;
  message?: string;
}
interface propsModalRenew_I {
  customerId: number;
  date: Date;
}

interface propsModal {
  initValues: Date;
  customerId: number;
  setModal(vl: propsModalRenew_I | null): void;
  action(value: propsAction_I): Promise<void>;
}

interface preMadeMessages_I {
  message: string;
  label: string;
}

export const ModalRenew = (props: propsModal): JSX.Element => {
  const [fieldDate, setFieldDate] = useState<Date>(new Date() as Date);
  const [loadAction, setLoadAction] = useState<boolean>(false as boolean);
  const [sucess, setSucess] = useState<boolean>(false as boolean);
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({});

  const [_cookies, _setCookies] = useCookies(["pre_made_messages_renew"]);

  const [preMessages, setPreMessages] = useState<preMadeMessages_I[]>(
    [] as preMadeMessages_I[]
  );
  const [fieldLabel, setFieldLabel] = useState<string>("" as string);

  const [fields, setFields] = useState("" as string);

  useEffect(() => {
    setPreMessages(_cookies.pre_made_messages_renew ?? []);
  }, []);

  const handleAppendPreMessage = useCallback(
    (label: string) => {
      setFieldLabel("");
      setPreMessages([{ label, message: fields }, ...preMessages]);
      _setCookies(
        "pre_made_messages_renew",
        JSON.stringify([
          { label, message: fields } as preMadeMessages_I,
          ...preMessages,
        ])
      );
    },
    [fields, preMessages]
  );

  const handleRemovePreMsg = useCallback(
    (label: string) => {
      const newList = preMessages.filter((e) => e.label !== label);
      setPreMessages(newList);
      _setCookies("pre_made_messages_renew", JSON.stringify(newList));
    },
    [fields, preMessages]
  );

  return (
    <div className="z-50 py-5 flex items-center flex-col overflow-scroll overflow-x-hidden fixed top-0 left-0 w-screen h-full">
      <div className="max-w-2xl w-full m-auto bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-primary text-white flex justify-between items-center font-medium text-lg">
          <span>Renovação cliente</span>
          <button className="icon-2" onClick={() => props.setModal(null)}>
            <IoClose />
          </button>
        </div>
        <div className="px-5 flex w-full gap-4">
          <div className="my-2 flex w-full gap-x-2">
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Vencimento</span>
              <DatePicker
                disabled
                className="h-9"
                value={new Date(props.initValues)}
              />
            </label>
          </div>
          <div className="my-2 flex w-full gap-x-2">
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Renovar para</span>
              <DatePicker
                className="h-9"
                value={fieldDate}
                onChange={(e) => setFieldDate(new Date(String(e)))}
                minDate={new Date()}
              />
            </label>
          </div>
        </div>

        {!!preMessages.length && (
          <div className="px-5 mt-3">
            <span className="text-slate-600 block mb-2">Mensagens prontas</span>
            <div className="flex flex-wrap gap-3 gap-y-4 mt-3">
              {preMessages?.map((msg) => (
                <div key={msg.label} className="flex flex-col items-center ">
                  <button
                    onClick={() => setFields(msg.message)}
                    key={msg.label}
                    className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
                    title={msg.message}
                  >
                    {msg.label}
                  </button>
                  <a
                    onClick={() => handleRemovePreMsg(msg.label)}
                    className="hover:text-red-500 text-red-300 cursor-pointer underline block"
                  >
                    remover
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="mt-2 px-5 block">
          <span className="text-slate-600">Mensagem</span>
          <textarea
            value={fields.replace(/\\n/g, "\n")}
            onChange={(e) => setFields(e.target.value)}
            className="outline-teal-700 border p-1 mt-3 w-full"
            rows={7}
            name="text"
          />
        </label>

        {fields.length > 0 && !preMessages.find((e) => e.message === fields) ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAppendPreMessage(fieldLabel);
            }}
            className="flex items-end gap-5 px-5 my-4 mt-3"
          >
            <label className="flex flex-1 flex-col gap-y-1">
              <input
                className="pl-4 border h-10 outline-sky-700"
                type="text"
                name="label"
                placeholder="Identificador"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
              />
            </label>
            <button className="h-10 text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200">
              Salvar pré-menssagem
            </button>
          </form>
        ) : undefined}

        <div className="px-5 mt-3 pb-4">
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
                <strong>{"{PRECO_PLANO}"}</strong>: Preço do Plano
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
              <li className="text-sm p-1.5 px-3">
                <strong>{"{NOVA_DATA_VENCI}"}</strong>: Nova Data de Vencimento
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-1 gap-x-4 flex justify-end px-5 pb-5">
          <button
            onClick={() => props.setModal(null)}
            className="text-red-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              setLoadAction(true);
              try {
                await props.action({
                  customerId: props.customerId,
                  newDate: fieldDate,
                  message: fields
                    ? fields
                        .replace(
                          /{NOVA_DATA_VENCI}/g,
                          fieldDate.toLocaleDateString("pt-br")
                        )
                        .replace(/\n/g, "\\n")
                    : undefined,
                });
                setLoadAction(false);
                setSucess(true);
                setTimeout(() => setSucess(false), 3000);
              } catch (error) {}
            }}
            className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            {loadAction ? <LoadComponent /> : sucess ? "Renovado!" : "Salvar"}
          </button>
        </div>
      </div>
      <div
        onClick={() => props.setModal(null)}
        className="fixed top-0 left-0 w-screen h-screen backdrop-blur-sm bg-teal-900/60"
      ></div>
    </div>
  );
};
