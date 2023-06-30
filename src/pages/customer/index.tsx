import { AxiosError } from "axios";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import mainAPI from "../../providers/api.provider";
import { propsAuthActions } from "../../reducers/auth.reducer";
import { produce } from "immer";
import { VscDebugRestart } from "react-icons/vsc";
import Skeleton from "react-loading-skeleton";
import { Customer } from "../../entities/customer.entity";
import { ModalCreate } from "./Modals/create";
import { ModalEdit } from "./Modals/edit";
import { ModalNotify } from "./Modals/notify";
import { ModalRenew } from "./Modals/renew";
import DatePicker from "react-date-picker";
import Select from "react-select";
import { Plans, Product } from "../../entities/product.entity";
import ReactPaginate from "react-paginate";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";

interface propsField_I
  extends Partial<Customer & { value_product: string; value_plan: string }> {}

interface propsModalNotfity_I {
  id: number;
  full_name: string;
  whatsapp: string;
}

interface propsSendNotify_I {
  text: string;
  id: number;
}

interface propsModalRenew_I {
  customerId: number;
  date: Date;
}

interface onRenewCustomer_I {
  customerId: number;
  newDate: Date;
}

const options_invoice = [
  { value: "PAY", label: "Paga" },
  { value: "PENDING", label: "Pendente" },
];

interface propsFilter_I {
  page?: number;
  amount?: number;
  name?: string;
  login?: string;
  whatsapp?: string;
  planId?: number;
  productId?: number;
  afterDate?: Date;
  beforeDate?: Date;
  invoice?: string;
}

export default function PageCostumer() {
  const [_cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  const [openModalEdit, setOpenModalEdit] = useState<null | Customer>(
    null as null | Customer
  );
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalRenew, setOpenModalRenew] =
    useState<propsModalRenew_I | null>(null);
  const [openModalNotify, setOpenModalNotify] =
    useState<propsModalNotfity_I | null>(null as propsModalNotfity_I | null);

  const [customer, setCustomer] = useState<
    (Customer & { value_plan: string; value_product: string })[]
  >([] as (Customer & { value_plan: string; value_product: string })[]);
  const [loadGet, setLoadGet] = useState<boolean>(false as boolean);
  const [loadDell, setLoadDell] = useState<number[]>([] as number[]);
  const [stateSession, setStateSession] = useState<null | boolean>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [products, setProducts] = useState<Omit<Product, "plans">[]>(
    [] as Omit<Product, "plans">[]
  );
  const [plans, setPlans] = useState<Plans[]>([] as Plans[]);

  const [filter, setFilter] = useState<propsFilter_I>({
    amount: 20,
  } as propsFilter_I);

  const onCount = useCallback(async (fields: propsFilter_I) => {
    try {
      const { data } = await mainAPI.get(
        `/v1/user/get/count-customers-user?${
          fields.page ? `page=${fields.page}&` : ""
        }${fields.amount ? `amount=${fields.amount}&` : ""}${
          fields.name ? `name=${fields.name}&` : ""
        }${fields.login ? `login=${fields.login}&` : ""}${
          fields.whatsapp ? `whatsapp=${fields.whatsapp}&` : ""
        }${fields.planId ? `planId=${fields.planId}&` : ""}${
          fields.productId ? `productId=${fields.productId}&` : ""
        }${fields.afterDate ? `afterDate=${fields.afterDate}&` : ""}${
          fields.beforeDate ? `beforeDate=${fields.beforeDate}&` : ""
        }${fields.invoice ? `invoice=${fields.invoice}` : ""}`
      );
      return data.data;
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

  const onList = useCallback(async (fields: propsFilter_I) => {
    try {
      setLoadGet(true);
      const { data } = await mainAPI.get(
        `/v1/user/get/customers?${fields.page ? `page=${fields.page}&` : ""}${
          fields.amount ? `amount=${fields.amount}&` : ""
        }${fields.name ? `name=${fields.name}&` : ""}${
          fields.login ? `login=${fields.login}&` : ""
        }${fields.whatsapp ? `whatsapp=${fields.whatsapp}&` : ""}${
          fields.planId ? `planId=${fields.planId}&` : ""
        }${fields.productId ? `productId=${fields.productId}&` : ""}${
          fields.afterDate ? `afterDate=${fields.afterDate}&` : ""
        }${fields.beforeDate ? `beforeDate=${fields.beforeDate}&` : ""}${
          fields.invoice ? `invoice=${fields.invoice}` : ""
        }`
      );
      setCustomer(data.data);
      setLoadGet(false);
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
              id: data.data,
            });
          });
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
          if (error.response?.status === 400) {
            throw {
              message: error.response?.data.body[0].message,
              field: error.response?.data.body[0].context.key,
            };
          }
          return;
        }
        console.log(error);
      }
    },
    [customer]
  );

  const onEdit = useCallback(
    async ({ id, ...fields }: Customer) => {
      try {
        await mainAPI.put(`/v1/user/update/change-field-customer/${id}`, {
          ...fields,
          comments: fields.comments ?? undefined,
        });
        setOpenModalEdit(null);
        const newProducts = produce(customer, (draft) => {
          const dd = draft.map((cust) => {
            if (cust.id === id) {
              return { ...fields, id, value_plan: "", value_product: "" };
            }
            return cust;
          });
          draft = dd;
          return draft;
        });
        setCustomer(newProducts);
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

  const onSendNotify = useCallback(async (props: propsSendNotify_I) => {
    try {
      await mainAPI.post("/v1/user/create/send-message", props);
      return true;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          alert(error.response.data.body[0].message);
          return false;
        }

        if (error.response?.status === 401) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth", {
            maxAge: 2147483647,
            path: "/",
          });
          navigate("/");
          return false;
        }
        return false;
      }
      console.log(error);
      return false;
    }
  }, []);

  const getStateSessionWhatsApp = useCallback(async () => {
    const { data } = await mainAPI.get("/v1/user/get/state-session-whatsapp");
    setStateSession(data.data);
  }, []);

  const onRenewCustomer = useCallback(
    async (props: onRenewCustomer_I) => {
      try {
        await mainAPI.post("/v1/user/create/renew-customer", props);
        const newState = produce(customer, (draft: any) => {
          draft.map((cust: any) => {
            if (cust.id === props.customerId) {
              cust.dueDate = props.newDate;
              return cust;
            }
            return cust;
          });
        });

        setCustomer(newState);
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
          }
          if (error.response?.status === 401) {
            dispatch({ type: "LOGOUT" });
            removeCookie("auth", {
              maxAge: 2147483647,
              path: "/",
            });
            navigate("/");
          }
        }
      }
    },
    [customer]
  );

  useEffect(() => {
    getStateSessionWhatsApp();
  }, []);

  useEffect(() => {
    (async () => {
      const { data: dataP } = await mainAPI.get("/v1/user/get/only-products");
      setProducts(dataP.data);
      const amount = await onCount({});
      if (amount > 0) {
        setAmount(amount);
        onList({});
      }
    })();
  }, []);

  return (
    <div>
      {openModalRenew && (
        <ModalRenew
          action={onRenewCustomer}
          customerId={openModalRenew.customerId}
          initValues={openModalRenew.date}
          setModal={setOpenModalRenew}
        />
      )}
      {openModalCreate && (
        <ModalCreate
          action={onCreate}
          type="ADD"
          label="Adicionar cliente"
          setModal={setOpenModalCreate}
        />
      )}
      {openModalEdit && (
        <ModalEdit
          actionEdit={onEdit}
          type="EDIT"
          label="Editar cliente"
          setModal={(vl) => !vl && setOpenModalEdit(null)}
          initValues={openModalEdit}
        />
      )}
      {openModalNotify !== null && (
        <ModalNotify
          info={openModalNotify}
          setModal={setOpenModalNotify}
          actions={onSendNotify}
        />
      )}
      <h3 className="font-bold text-xl">Clientes</h3>

      <div className="mt-6 p-4 px-5 flex justify-between items-center bg-secundary">
        <h4 className="font-medium text-slate-50">Meus clientes</h4>

        <button
          onClick={() => {
            setOpenModalCreate(true);
            setOpenModalEdit(null);
          }}
          className="text-secundary bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
        >
          Adicionar
        </button>
      </div>

      <div className="p-5 bg-white mt-6 shadow-md shadow-slate-200/50 flex gap-2">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex w-full gap-4">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Quantidade por página</span>
              <Select
                onChange={(e) => setFilter({ ...filter, amount: e!.value })}
                isDisabled={loadGet}
                value={
                  filter.amount !== undefined
                    ? { value: filter.amount, label: filter.amount }
                    : undefined
                }
                options={[
                  { value: 20, label: 20 },
                  { value: 25, label: 25 },
                  { value: 30, label: 30 },
                  { value: 35, label: 35 },
                ]}
                placeholder="Selecione"
              />
            </label>
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Nome</span>
              <input
                disabled={loadGet}
                style={{ height: 38 }}
                className="pl-4 border outline-blue-700"
                type="text"
                name="name"
                placeholder="Nome do cliente"
                value={filter.name ?? ""}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">WhatsApp</span>
              <input
                disabled={loadGet}
                style={{ height: 38 }}
                className="pl-4 border outline-blue-700"
                type="text"
                name="whatsapp"
                placeholder="WhatsApp"
                value={filter.whatsapp ?? ""}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Login</span>
              <input
                disabled={loadGet}
                style={{ height: 38 }}
                className="pl-4 border outline-blue-700"
                type="text"
                name="login"
                placeholder="Login"
                value={filter.login ?? ""}
                onChange={(e) =>
                  setFilter({
                    ...filter,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Fatura</span>
              <Select
                onChange={(e) => setFilter({ ...filter, invoice: e!.value })}
                isDisabled={loadGet}
                options={options_invoice}
                placeholder="Selecione"
              />
            </label>
          </div>
          <div className="flex w-full gap-4">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Produto/Serviço</span>
              <Select
                onChange={async (e) => {
                  const { data } = await mainAPI.get(
                    `/v1/user/get/plans-of-product/${e!.value}`
                  );
                  setPlans(data.data);
                  setFilter({ ...filter, productId: e!.value });
                }}
                isDisabled={loadGet}
                options={products.map((pdr) => ({
                  label: `${pdr.name} - R$${pdr.price}`,
                  value: pdr.id,
                }))}
                placeholder="Selecione"
              />
            </label>
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Plano</span>
              <Select
                onChange={(e) => setFilter({ ...filter, planId: e!.value })}
                isDisabled={loadGet}
                options={plans.map((plan) => ({
                  label: `${plan.name} - R$${plan.price}`,
                  value: plan.id,
                }))}
                placeholder="Selecione"
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Data vencimento: de</span>
              <DatePicker
                disabled={loadGet}
                className="h-9"
                value={filter.afterDate ? filter.afterDate : undefined}
                onChange={(e: any) => setFilter({ ...filter, afterDate: e })}
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Data vencimento: até</span>
              <DatePicker
                disabled={loadGet}
                className="h-9"
                value={filter.beforeDate ? filter.beforeDate : undefined}
                onChange={(e: any) => setFilter({ ...filter, beforeDate: e })}
              />
            </label>
          </div>
        </div>
        <button
          disabled={loadGet}
          onClick={() => onList({ ...filter, page: undefined })}
          className="text-secundary bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
        >
          Filtrar
        </button>
      </div>

      <div>
        {loadGet ? (
          <div className="mt-6 gap-2 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={282}
            />
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={282}
            />
          </div>
        ) : customer.length ? (
          <>
            <div className="mt-6 gap-2 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {customer?.map((cust) => (
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
                      <strong className="text-slate-900">
                        {cust.full_name}
                      </strong>
                    </p>
                    <p className="text-slate-600">
                      WhatsApp:{" "}
                      <strong className="text-slate-900">
                        {cust.whatsapp}
                      </strong>
                    </p>
                    <p className="text-slate-600">
                      Login:{" "}
                      <strong className="text-slate-900">{cust.login}</strong>
                    </p>
                    <p className="text-slate-600">
                      Senha:{" "}
                      <strong className="text-slate-900">
                        {cust.password}
                      </strong>
                    </p>
                    <p className="text-slate-600">
                      Produto/Provedor:{" "}
                      {cust?.productId && (
                        <strong className="text-slate-900">
                          ({cust.productId}) {cust.value_product}
                        </strong>
                      )}
                    </p>
                    <p className="text-slate-600">
                      Plano:{" "}
                      {cust?.planId && (
                        <strong className="text-slate-900">
                          ({cust.planId}) {cust.value_plan}
                        </strong>
                      )}
                    </p>
                    <p className="text-slate-600">
                      Vencimento:{" "}
                      {cust.dueDate && (
                        <strong className="text-slate-900">
                          {new Date(cust.dueDate).toLocaleDateString("pt-br")}
                        </strong>
                      )}
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
                    {/* <p className="text-slate-600">
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
                </p> */}
                    <p className="text-slate-600">
                      Notificação:{" "}
                      <strong
                        className={`${
                          stateSession ? "text-blue-700" : "text-orange-600"
                        }`}
                      >
                        {!stateSession ? "Desativada" : "Ativo"}
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
                      disabled={!stateSession}
                      onClick={() =>
                        setOpenModalNotify({
                          id: cust.id,
                          full_name: cust.full_name,
                          whatsapp: cust.whatsapp,
                        })
                      }
                      className={`${
                        !stateSession ? "cursor-not-allowed" : "cursor-pointer"
                      } text-blue-700 bg-6 flex items-center justify-center font-medium p-2 px-5 icon border hover:bg-blue-50 duration-200 flex-1`}
                      title={stateSession ? "Notificar" : "Desconectado"}
                    >
                      <IoMdNotificationsOutline />
                    </button>
                    <button
                      onClick={() =>
                        setOpenModalRenew({
                          customerId: cust.id,
                          date: new Date(cust.dueDate),
                        })
                      }
                      title="Renovar"
                      className="text-green-700 bg-6 flex items-center justify-center font-medium p-2 px-5 icon border hover:bg-green-50 duration-200 flex-1"
                    >
                      <VscDebugRestart />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            {amount !== null && amount > 0 && customer.length > 0 ? (
              <div className="flex justify-center w-full mt-10">
                <div className="max-w-xl m-auto bg-white">
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel={<CgPlayTrackNext size={20} />}
                    onPageChange={() => undefined}
                    pageRangeDisplayed={3}
                    pageCount={Math.floor(
                      Math.abs(amount / (filter?.amount ?? 0))
                    )}
                    className="flex gap-x-1 h-14 shadow-md shadow-slate-800/5 justify-between items-center"
                    pageLinkClassName="p-2 hover:bg-blue-200"
                    nextClassName="p-2"
                    nextLinkClassName="p-2"
                    previousClassName="p-2"
                    activeClassName="bg-blue-200 py-1.5"
                    containerClassName="flex"
                    previousLabel={<CgPlayTrackPrev size={20} />}
                    renderOnZeroPageCount={null}
                    onClick={(e) => setFilter({ ...filter, page: e.selected })}
                  />
                </div>
              </div>
            ) : undefined}
          </>
        ) : (
          <div className="bg-white h-20 mt-6 flex justify-center items-center">
            <span className="text-slate-600">Não há clientes cadastrados</span>
          </div>
        )}
      </div>
    </div>
  );
}
