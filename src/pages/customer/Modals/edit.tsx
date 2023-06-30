import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import mainAPI from "../../../providers/api.provider";
import Skeleton from "react-loading-skeleton";
import Select from "react-select";
import DatePicker from "react-date-picker";
import { Plans, Product } from "../../../entities/product.entity";
import { Customer, Invoice_T } from "../../../entities/customer.entity";
import { Message } from "../../../entities/message.entity";
import { LoadComponent } from "../../../components/load";

const options = [
  { value: "PAY", label: "Paga" },
  { value: "PENDING", label: "Pendente" },
];

interface propsField_I
  extends Partial<Customer & { value_product: string; value_plan: string }> {}

interface propsModal {
  setModal(vl: boolean): void;
  label: string;
  type: "EDIT" | "ADD";
  initValues?: propsField_I & { id?: number };
  action?(fields: Required<Omit<propsField_I, "id">>): Promise<void>;
  actionEdit?(fields: propsField_I): Promise<void>;
  actionSaveCust?(props: Customer): Promise<void>;
  actionDellPlan?(id: number): Promise<void>;
}

export const ModalEdit = (props: propsModal): JSX.Element => {
  const [fields, setFields] = useState<propsField_I & { id?: number }>(
    props.initValues ?? ({ messageId: [] } as propsField_I & { id?: number })
  );

  const [selectedDefaultProduct, setSelectedDefaultProduct] = useState<{
    value: number;
    label: string;
  }>(
    {} as {
      value: number;
      label: string;
    }
  );
  const [selectedDefaultPlan, setSelectedDefaultPlan] = useState<{
    value: number;
    label: string;
  }>(
    {} as {
      value: number;
      label: string;
    }
  );

  const [loadSaveCust, setLoadSaveCust] = useState<boolean>(false as boolean);

  const [products, setProducts] = useState<Omit<Product, "plans">[]>(
    [] as Omit<Product, "plans">[]
  );
  const [_loadGetProducts, setLoadGetProducts] = useState<boolean>(
    false as boolean
  );
  const [plans, setPlans] = useState<Plans[]>([] as Plans[]);
  const [_loadGetPlans, setLoadGetPlans] = useState<boolean>(false as boolean);

  const [messages, setMessages] = useState<Message[]>([] as Message[]);
  const [loadGetMessages, setLoadGetMessages] = useState<boolean>(
    false as boolean
  );

  const handleSelectProduct = useCallback(
    async (id: number, label: string) => {
      try {
        const { data } = await mainAPI.get(
          `/v1/user/get/plans-of-product/${id}`
        );
        setPlans(data.data);
        setFields({ ...fields, productId: id, value_product: label });
        setLoadGetPlans(true);
      } catch (error) {
        setLoadGetPlans(false);
        console.log(error);
      }
    },
    [fields]
  );

  useEffect(() => {
    (async () => {
      try {
        const [{ data }, { data: dataMessage }] = await Promise.all([
          mainAPI.get("/v1/user/get/only-products"),
          mainAPI.get("/v1/user/get/messages"),
        ]);
        if (fields?.productId) {
          const { data: DefaultPlan } = await mainAPI.get(
            `/v1/user/get/plans-of-product/${fields.productId}`
          );
          const pdr = data.data.find((pp: any) => pp.id === fields.productId);
          const pl = DefaultPlan.data.find(
            (pp: any) => pp.id === fields.planId
          );
          setPlans(DefaultPlan.data);
          setSelectedDefaultProduct({
            label: `${pdr.name} - R$${pdr.price}`,
            value: pdr.id,
          });
          setSelectedDefaultPlan({
            label: `${pl.name} - R$${pl.price}`,
            value: pl.id,
          });
        }
        setProducts(data.data);
        setMessages(dataMessage.data);
        setLoadGetMessages(true);
        setLoadGetProducts(true);
      } catch (error) {
        setLoadGetProducts(false);
        console.log(error);
      }
    })();
  }, []);

  return (
    <div className="z-50 py-5 flex items-center flex-col overflow-scroll overflow-x-hidden fixed top-0 left-0 w-screen h-full">
      <div className="max-w-2xl w-full m-auto bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-primary text-white flex justify-between items-center font-medium text-lg">
          <span>{props.label}</span>
          <button className="icon-2" onClick={() => props.setModal(false)}>
            <IoClose />
          </button>
        </div>
        <div className="px-5">
          <div className="my-2 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Nome</span>
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="full_name"
                placeholder="Nome do cliente"
                value={fields?.full_name ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">WhatsApp</span>
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="whatsapp"
                placeholder="Ex: 0000999999999"
                value={fields?.whatsapp ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: e.target.value.replace(/\D/g, ""),
                  })
                }
              />
            </label>
          </div>
          <div className="my-2 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Login | E-mail</span>
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="login"
                placeholder="Login ou e-mail"
                value={fields?.login ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Senha</span>
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="password"
                placeholder="Senha de acesso"
                value={fields?.password ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
          </div>
          <div className="my-2 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Produto | Provedor</span>
              <Select
                value={selectedDefaultProduct ?? undefined}
                onChange={(e) => handleSelectProduct(e?.value!, e?.label!)}
                options={products.map((pdr) => ({
                  label: `${pdr.name} - R$${pdr.price}`,
                  value: pdr.id,
                }))}
                placeholder="Selecione"
                name="product"
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Plano mensal</span>
              <Select
                value={selectedDefaultPlan ?? undefined}
                placeholder="Selecione"
                onChange={(e) => {
                  setSelectedDefaultPlan({
                    label: e?.label!,
                    value: e?.value!,
                  });
                  setFields({ ...fields, planId: e?.value! });
                }}
                options={plans.map((plan) => ({
                  label: `${plan.name} - R$${plan.price}`,
                  value: plan.id,
                }))}
                name="plan"
              />
            </label>
          </div>
          <div className="my-2 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Fatura</span>
              <Select
                // defaultValue={selectedOption}
                onChange={(e) =>
                  setFields({ ...fields, invoice: e?.value as Invoice_T })
                }
                value={options.find((e) => e.value === fields.invoice)}
                options={options}
                placeholder="Selecione"
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Data de vencimento</span>
              <DatePicker
                className="h-9"
                value={fields?.dueDate}
                onChange={(e) =>
                  setFields({ ...fields, dueDate: new Date(String(e)) })
                }
                minDate={new Date()}
              />
            </label>
          </div>
          <div className="my-2 mt-7 flex flex-col items-baseline gap-y-2">
            <span className="text-slate-600">
              Enviar notificações automáticas
            </span>
            <div className="flex gap-2 flex-wrap">
              {!loadGetMessages ? (
                <>
                  <Skeleton
                    borderRadius={0}
                    baseColor="#d4d7dc"
                    highlightColor="#f4f8ff"
                    width={140}
                    height={24}
                  />
                  <Skeleton
                    borderRadius={0}
                    baseColor="#d4d7dc"
                    highlightColor="#f4f8ff"
                    width={140}
                    height={24}
                  />
                </>
              ) : (
                messages?.map((msg) => (
                  <label
                    key={msg?.id}
                    className={`px-2 flex gap-y-1 items-center gap-x-2 ${
                      fields?.messageId?.includes(msg.id)
                        ? "bg-3 text-white"
                        : "text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      onChange={() => {
                        if (
                          fields.messageId &&
                          fields?.messageId?.includes(msg.id)
                        ) {
                          setFields({
                            ...fields,
                            messageId: fields.messageId.filter(
                              (e) => e !== msg.id
                            ),
                          });
                          return;
                        }
                        setFields({
                          ...fields,
                          messageId: [...fields?.messageId!, msg.id],
                        });
                      }}
                      checked={fields?.messageId?.includes(msg.id)}
                    />
                    <span>
                      {msg?.days} {msg?.days > 1 ? "dias" : "dia"} antes
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-col items-baseline gap-y-2">
            <label className="w-full">
              <span className="text-slate-600">Observações</span>
              <textarea
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
                className="outline-teal-700 border p-1 mt-2 w-full"
                rows={3}
                name="comments"
                value={fields?.comments ?? ""}
              />
            </label>
          </div>
        </div>

        <div className="mt-5 gap-x-4 flex justify-end px-5 pb-5">
          <button
            onClick={() => props.setModal(false)}
            className="text-red-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (props.actionEdit) {
                setLoadSaveCust(true);
                props.actionEdit({
                  ...fields,
                  value_plan: undefined,
                  value_product: undefined,
                });
                setLoadSaveCust(true);
              }
            }}
            className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            {loadSaveCust ? <LoadComponent /> : "Salvar"}
          </button>
        </div>
      </div>
      <div
        onClick={() => props.setModal(false)}
        className="fixed top-0 left-0 w-screen h-screen backdrop-blur-sm bg-teal-900/60"
      ></div>
    </div>
  );
};
