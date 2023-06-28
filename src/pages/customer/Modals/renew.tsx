import { useState } from "react";
import { IoClose } from "react-icons/io5";
import DatePicker from "react-date-picker";
import { LoadComponent } from "../../../components/load";

interface propsAction_I {
  newDate: Date;
  customerId: number;
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

export const ModalRenew = (props: propsModal): JSX.Element => {
  const [fieldDate, setFieldDate] = useState<Date>(new Date() as Date);
  const [loadAction, setLoadAction] = useState<boolean>(false as boolean);
  const [sucess, setSucess] = useState<boolean>(false as boolean);

  return (
    <div className="py-5 flex items-center flex-col overflow-scroll overflow-x-hidden fixed top-0 left-0 w-screen h-full">
      <div className="max-w-2xl w-full m-auto bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-3 text-white flex justify-between items-center font-medium text-lg">
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

        <div className="mt-5 gap-x-4 flex justify-end px-5 pb-5">
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
