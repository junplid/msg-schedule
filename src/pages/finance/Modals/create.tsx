import { useCallback, useState } from "react";
import Select from "react-select";
import { IoClose } from "react-icons/io5";
import { LoadComponent } from "../../../components/load";
import DatePicker from "react-date-picker";

interface propsField_I {
  name: string;
  price: number;
  type_transation: "EXIT" | "PROHIBITED";
  date: Date;
}

interface propsModal {
  setModal(vl: boolean): void;
  actions(fields: Required<Omit<propsField_I, "id">>): Promise<boolean>;
}

export const ModalCreate = (props: propsModal): JSX.Element => {
  const [fields, setFields] = useState<propsField_I>({
    type_transation: "PROHIBITED",
    date: new Date(),
  } as propsField_I);
  const [status, setStatus] = useState<0 | 1 | 2>(0 as 0 | 1 | 2);
  const [load, setLoad] = useState<boolean>(false as boolean);

  const formatePrice = useCallback((valor: string) => {
    const numero = parseFloat(valor.replace(/\D/g, "")) / 100;
    return numero.toFixed(2);
  }, []);

  return (
    <div className="py-5 z-50 flex justify-center items-center flex-col fixed top-0 left-0 w-screen h-screen">
      <div className="max-w-2xl w-full bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-primary text-white flex justify-between items-center font-medium text-lg">
          <span>Adicionar transação</span>
          <button className="icon-2" onClick={() => props.setModal(false)}>
            <IoClose />
          </button>
        </div>
        <div className="p-5 grid grid-cols-[1fr_200px] gap-2">
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Nome</span>
            <input
              required
              className="pl-4 border h-12 outline-blue-700"
              type="text"
              name="name"
              placeholder="Identificador"
              value={fields?.name ?? ""}
              onChange={(e) =>
                setFields({
                  ...fields,
                  [e.target.name]: e.target.value,
                })
              }
            />
          </label>
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Valor</span>
            <input
              required
              className="pl-4 border h-12 outline-blue-700"
              type="text"
              name="price"
              placeholder="R$ 10,00"
              value={fields?.price ?? ""}
              autoComplete="off"
              onChange={(e) =>
                setFields({
                  ...fields,
                  [e.target.name]: formatePrice(e.target.value),
                })
              }
            />
          </label>
        </div>
        <div className="px-5 grid grid-cols-[1fr_200px] gap-2">
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Tipo</span>
            <Select
              onChange={(e) =>
                setFields({
                  ...fields,
                  type_transation: e!.value as "EXIT" | "PROHIBITED",
                })
              }
              defaultValue={{ value: "PROHIBITED", label: "Entrada" }}
              required
              options={[
                { value: "PROHIBITED", label: "Entrada" },
                { value: "EXIT", label: "Saída" },
              ]}
              placeholder="Selecione"
            />
          </label>
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Data</span>
            <DatePicker
              className="h-9"
              value={fields.date ? fields.date : undefined}
              onChange={(e: any) =>
                setFields({
                  ...fields,
                  date: e,
                })
              }
            />
          </label>
        </div>
        <div className="flex gap-x-4 p-5 justify-end">
          <button
            onClick={() => props.setModal(false)}
            className="text-red-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              if (!load) {
                try {
                  setLoad(true);
                  const stat = await props.actions({
                    ...fields,
                    price: Number(fields.price),
                  });
                  setLoad(false);
                  if (stat) {
                    setStatus(1);
                  } else {
                    setStatus(2);
                  }
                  setTimeout(() => setStatus(0), 3000);
                } catch (error) {
                  setLoad(false);
                  setStatus(2);
                  setTimeout(() => setStatus(0), 3000);
                }
              }
            }}
            className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            {load && <LoadComponent />}
            {!load && status === 1 && "Criado!"}
            {!load && status === 2 && "Error!"}
            {!load && status === 0 && "Criar"}
          </button>
        </div>
      </div>
      <div
        onClick={() => props.setModal(false)}
        className="fixed top-0 left-0 w-screen h-screen bg-3 backdrop-blur-sm bg-blue-900/60"
      ></div>
    </div>
  );
};
