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
export default function PageCostumer() {
  const [_cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  const [openModalEdit, setOpenModalEdit] = useState<null | Customer>(
    null as null | Customer
  );
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalNotify, setOpenModalNotify] =
    useState<propsModalNotfity_I | null>(null as propsModalNotfity_I | null);

  const [customer, setCustomer] = useState<
    (Customer & { value_plan: string; value_product: string })[]
  >([] as (Customer & { value_plan: string; value_product: string })[]);
  const [loadGet, setLoadGet] = useState<boolean>(false as boolean);
  const [loadDell, setLoadDell] = useState<number[]>([] as number[]);
  const [stateSession, setStateSession] = useState<null | boolean>(null);

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
        await mainAPI.put(
          `/v1/user/update/change-field-customer/${id}`,
          fields
        );
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

  useEffect(() => {
    getStateSessionWhatsApp();
  }, []);

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
              height={282}
            />
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={282}
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
                  // disabled={loadDell.includes(prd.id)}
                  // onClick={() => !loadDell.includes(prd.id) && onDelete(prd.id)}
                  title="Renovar"
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
