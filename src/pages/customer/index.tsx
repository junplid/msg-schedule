import { AxiosError } from "axios";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { IoIosAdd, IoMdNotificationsOutline } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import mainAPI from "../../providers/api.provider";
import { propsAuthActions } from "../../reducers/auth.reducer";
import { Plans, Product } from "../../entities/product.entity";
import { produce } from "immer";
import { BiSave } from "react-icons/bi";
import { VscDebugRestart } from "react-icons/vsc";
import Skeleton from "react-loading-skeleton";
import { LoadComponent } from "../../components/load";
import Select from "react-select";
import DatePicker from "react-date-picker";
import Switch from "react-switch";
import { Customer, Invoice_T } from "../../entities/customer.entity";
import { Message } from "../../entities/message.entity";

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
  actionSavePlan?(props: Plans): Promise<void>;
  actionDellPlan?(id: number): Promise<void>;
}

interface propsHandleValuePlanEdit {
  id: number;
  name: string;
  value: string;
}

const ModalCreate = (props: propsModal): JSX.Element => {
  const [fields, setFields] = useState<propsField_I & { id?: number }>(
    props.initValues ?? ({ messageId: [] } as propsField_I & { id?: number })
  );

  const [fieldsPlan, setFieldsPlan] = useState<Plans>({} as Plans);
  const [loadSavePlan, setLoadSavePlan] = useState<string[]>([] as string[]);

  const [products, setProducts] = useState<Omit<Product, "plans">[]>(
    [] as Omit<Product, "plans">[]
  );
  const [loadGetProducts, setLoadGetProducts] = useState<boolean>(
    false as boolean
  );
  const [plans, setPlans] = useState<Plans[]>([] as Plans[]);
  const [loadGetPlans, setLoadGetPlans] = useState<boolean>(false as boolean);

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
    <div className="py-5 flex items-center flex-col overflow-scroll overflow-x-hidden fixed top-0 left-0 w-screen h-full">
      <div className="max-w-2xl w-full m-auto bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-3 text-white flex justify-between items-center font-medium text-lg">
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
                placeholder="Ex: 00999999999"
                maxLength={11}
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
                placeholder="Selecione"
                onChange={(e) => setFields({ ...fields, planId: e?.value! })}
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
                value={fields?.dueDate ?? new Date()}
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
            onClick={() =>
              props.type === "ADD"
                ? props.action &&
                  props.action(fields as Omit<Required<propsField_I>, "id">)
                : props.actionEdit && undefined
            }
            className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            {props.type === "ADD" && "Criar"}
            {props.type === "EDIT" && "Salvar"}
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

export default function PageCostumer() {
  const [_cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  const [openModalEdit, setOpenModalEdit] = useState<null | Customer>(
    null as null | Customer
  );
  const [openModalCreate, setOpenModalCreate] = useState(false);

  const [customer, setCustomer] = useState<Customer[]>([] as Customer[]);
  const [loadGet, setLoadGet] = useState<boolean>(false as boolean);
  const [loadDell, setLoadDell] = useState<number[]>([] as number[]);

  const onList = useCallback(async () => {
    try {
      const { data } = await mainAPI.get("/v1/user/get/customers");
      setCustomer(data.data);
      setTimeout(() => setLoadGet(true), 600);
    } catch (error) {
      setLoadGet(false);
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth", {
            maxAge: 2147483647,
            path: "/",
          });
          navigate("/");
          return;
        }
        return;
      }
      console.log(error);
    }
  }, []);

  const onCreate = useCallback(
    async (fields: Omit<Required<propsField_I>, "id">) => {
      try {
        const { data } = await mainAPI.post("/v1/user/create/customer", {
          ...fields,
          value_product: undefined,
          value_plan: undefined,
        });
        setOpenModalCreate(false);
        setTimeout(() => {
          const newState = produce(customer, (draft) => {
            draft.push({
              ...fields,
              id: data.data.id,
            });
          });
          console.log(newState);
          setCustomer(newState);
        }, 300);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            dispatch({ type: "LOGOUT" });
            removeCookie("auth", {
              maxAge: 2147483647,
              path: "/",
            });
            navigate("/");
            return;
          }
          return;
        }
        console.log(error);
      }
    },
    [customer]
  );

  // const onEdit = useCallback(
  //   async (fields: propsField_I) => {
  //     try {
  //       await mainAPI.put(
  //         `/v1/user/update/change-field-product/${openModalEdit?.id}?${
  //           fields.price ? `&price=${fields.price}` : ""
  //         }${fields.name ? `&name=${fields.name}` : ""}`
  //       );
  //       setOpenModalEdit(null);
  //       const newProducts = produce(products, (draft) => {
  //         draft.map((pdr) => {
  //           if (pdr.id === openModalEdit?.id) {
  //             if (fields.name !== undefined) {
  //               pdr.name = fields.name;
  //             }
  //             if (fields.price !== undefined) {
  //               pdr.price = fields.price;
  //             }
  //             return pdr;
  //           }
  //           return pdr;
  //         });
  //       });
  //       setProducts(newProducts);
  //     } catch (error) {
  //       if (error instanceof AxiosError) {
  //         if (error.response?.status === 401) {
  //           dispatch({ type: "LOGOUT" });
  //           removeCookie("auth", {
  //             maxAge: 2147483647,
  //             path: "/",
  //           });
  //           navigate("/");
  //           return;
  //         }
  //         return;
  //       }
  //       console.log(error);
  //     }
  //   },
  //   [openModalEdit?.id, products]
  // );

  const onDelete = useCallback(
    async (id: number) => {
      try {
        if (confirm("Deseja deletar esse cliente permanentemente?")) {
          setLoadDell([...loadDell, id]);
          await mainAPI.delete(`/v1/user/delete/customer/${id}`);
          setTimeout(() => {
            setCustomer(customer.filter((e) => e.id !== id));
            setLoadDell(loadDell.filter((e) => e !== id));
          }, 400);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
            setCustomer(customer.filter((e) => e.id !== id));
            setLoadDell(loadDell.filter((e) => e !== id));
            return;
          }

          if (error.response?.status === 401) {
            dispatch({ type: "LOGOUT" });
            removeCookie("auth", {
              maxAge: 2147483647,
              path: "/",
            });
            navigate("/");
            return;
          }
          return;
        }
        console.log(error);
      }
    },
    [loadDell, customer]
  );

  const onDeletePlan = useCallback(
    async (id: number) => {
      try {
        if (confirm("Deseja deletar esse plano permanentemente?")) {
          setLoadDell([...loadDell, id]);
          await mainAPI.delete(`/v1/user/delete/plan/${id}`);
          setTimeout(() => {
            setCustomer(customer.filter((e) => e.id !== id));
            setLoadDell(loadDell.filter((e) => e !== id));
          }, 400);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
            setCustomer(customer.filter((e) => e.id !== id));
            setLoadDell(loadDell.filter((e) => e !== id));
            return;
          }

          if (error.response?.status === 401) {
            dispatch({ type: "LOGOUT" });
            removeCookie("auth", {
              maxAge: 2147483647,
              path: "/",
            });
            navigate("/");
            return;
          }
          return;
        }
        console.log(error);
      }
    },
    [loadDell, customer]
  );

  useEffect(() => {
    onList();
  }, []);

  return (
    <div>
      {openModalCreate && (
        <ModalCreate
          action={onCreate}
          type="ADD"
          label="Adicionar cliente"
          setModal={setOpenModalCreate}
        />
      )}
      {openModalEdit && (
        <ModalCreate
          // actionEdit={onEdit}
          type="EDIT"
          label="Editar cliente"
          setModal={(vl) => !vl && setOpenModalEdit(null)}
          initValues={openModalEdit}
          actionDellPlan={onDeletePlan}
          // actionSavePlan={onEditPlan}
        />
      )}
      <div className="p-4 px-5 flex justify-between items-center bg-teal-900">
        <h4 className="font-medium text-slate-50">Meus clientes</h4>
        <button
          onClick={() => {
            setOpenModalCreate(true);
            setOpenModalEdit(null);
          }}
          className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
        >
          Adicionar
        </button>
      </div>

      <div className="mt-6 gap-2 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {!loadGet ? (
          <>
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={306}
            />
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={306}
            />
          </>
        ) : (
          customer?.map((cust) => (
            <article
              key={cust.id}
              className={`gap-y-2 bg-white grid hover:border-slate-600 border w-full duration-200 hover:shadow-md`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setOpenModalEdit(cust)}
              >
                <p className="text-slate-600">
                  Nome:{" "}
                  <strong className="text-slate-900">{cust.full_name}</strong>
                </p>
                <p className="text-slate-600">
                  WhatsApp:{" "}
                  <strong className="text-slate-900">55{cust.whatsapp}</strong>
                </p>
                <p className="text-slate-600">
                  Login:{" "}
                  <strong className="text-slate-900">{cust.login}</strong>
                </p>
                <p className="text-slate-600">
                  Provedor:{" "}
                  <strong className="text-slate-900">
                    ({cust.productId}) Provedor 1
                  </strong>
                </p>
                <p className="text-slate-600">
                  Plano:{" "}
                  <strong className="text-slate-900">
                    ({cust.planId}) Plano 1
                  </strong>
                </p>
                <p className="text-slate-600">
                  Vencimento:{" "}
                  <strong className="text-slate-900">
                    {new Date(cust.dueDate).toLocaleDateString("pt-br")}
                  </strong>
                </p>
                <p className="text-slate-600">
                  Fatura:{" "}
                  <strong
                    className={`${
                      cust.invoice === "PAY"
                        ? "text-blue-700"
                        : "text-orange-600"
                    }`}
                  >
                    {cust.invoice === "PAY" ? "Paga" : "Pendente"}
                  </strong>
                </p>
                <p className="text-slate-600">
                  Status:{" "}
                  <strong
                    className={`${
                      cust.invoice === "PAY"
                        ? "text-blue-700"
                        : "text-orange-600"
                    }`}
                  >
                    Ativo
                  </strong>
                </p>
                <p className="text-slate-600">
                  Notificação:{" "}
                  <strong
                    className={`${
                      cust.invoice === "PAY"
                        ? "text-blue-700"
                        : "text-orange-600"
                    }`}
                  >
                    Ativo
                  </strong>
                </p>
              </div>
              <div className="flex gap-x-2">
                <button
                  // disabled={loadDell.includes(prd.id)}
                  onClick={() =>
                    !loadDell.includes(cust.id) && onDelete(cust.id)
                  }
                  className="text-red-700 bg-6 flex items-center justify-center font-medium p-2 px-5 border hover:bg-red-50 duration-200 flex-1"
                >
                  Deletar
                </button>
                <button
                  // disabled={loadDell.includes(prd.id)}
                  // onClick={() => !loadDell.includes(prd.id) && onDelete(prd.id)}
                  className="text-blue-700 bg-6 flex items-center justify-center font-medium p-2 px-5 icon border hover:bg-blue-50 duration-200 flex-1"
                >
                  <IoMdNotificationsOutline />
                </button>
                <button
                  // disabled={loadDell.includes(prd.id)}
                  // onClick={() => !loadDell.includes(prd.id) && onDelete(prd.id)}
                  className="text-green-700 bg-6 flex items-center justify-center font-medium p-2 px-5 icon border hover:bg-green-50 duration-200 flex-1"
                >
                  <VscDebugRestart />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
