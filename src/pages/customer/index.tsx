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

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

interface propsField_I
  extends Partial<Omit<Product<(Plans & { id?: number })[]>, "id">> {}

interface propsModal {
  setModal(vl: boolean): void;
  label: string;
  type: "EDIT" | "ADD";
  initValues?: propsField_I;
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
  const [fields, setFields] = useState<Required<Omit<propsField_I, "plans">>>(
    props.initValues as Required<Omit<propsField_I, "plans">>
  );
  const [listPlans, setListPlans] = useState<Plans[]>(
    props.initValues?.plans ?? ([] as Plans[])
  );
  const [fieldsPlan, setFieldsPlan] = useState<Plans>({} as Plans);
  const [loadSavePlan, setLoadSavePlan] = useState<string[]>([] as string[]);

  const formatePrice = useCallback((valor: string) => {
    const numero = parseFloat(valor.replace(/\D/g, "")) / 100;
    return numero.toFixed(2);
  }, []);

  const handleValuePlanEdit = useCallback((props: propsHandleValuePlanEdit) => {
    const newState = produce(listPlans, (draft) => {
      return draft.map((e) => {
        if (e.id === props.id) {
          return { ...e, [props.name]: props.value };
        }
        return e;
      });
    });
    setListPlans(newState);
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
                name="name"
                placeholder="Nome do cliente"
                value={fields?.name ?? ""}
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
                placeholder="Ex: DD999999999"
                value={fields?.price ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: e.target.value.replace(/\d/g, ""),
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
                value={fields?.name ?? ""}
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
                value={fields?.price ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: formatePrice(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <div className="my-2 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Produto | Provedor</span>
              <Select
                // defaultValue={selectedOption}
                // onChange={setSelectedOption}
                options={options}
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Plano</span>
              <Select
                // defaultValue={selectedOption}
                // onChange={setSelectedOption}
                options={options}
              />
            </label>
          </div>
          <div className="my-2 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Fatura</span>
              <Select
                // defaultValue={selectedOption}
                // onChange={setSelectedOption}
                options={options}
              />
            </label>
            <label className="flex flex-1 flex-col gap-y-1">
              <span className="text-slate-600">Data de vencimento</span>
              <DatePicker className="h-9" value={new Date()} />
            </label>
          </div>
          <div className="my-2 flex flex-col items-baseline gap-y-2">
            <span>Enviar notificações automáticas</span>
            <label className="flex gap-y-1 items-center gap-x-2">
              <Switch
                onChange={() => undefined}
                onColor="#10967b"
                offColor="#828282"
                checkedIcon={false}
                checked
              />
              <span className="text-slate-600">5 dias antes</span>
            </label>
          </div>
          <div className="mt-3 flex flex-col items-baseline gap-y-2">
            <label className="w-full">
              <span className="text-slate-600">Observações</span>
              <textarea
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
                className="outline-teal-700 border p-1 mt-2 w-full"
                rows={4}
                name="comments"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-col items-baseline gap-y-2">
            <label className="w-full">
              <span className="text-slate-600">Observações</span>
              <textarea
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
                className="outline-teal-700 border p-1 mt-2 w-full"
                rows={4}
                name="comments"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-col items-baseline gap-y-2">
            <label className="w-full">
              <span className="text-slate-600">Observações</span>
              <textarea
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
                className="outline-teal-700 border p-1 mt-2 w-full"
                rows={4}
                name="comments"
              />
            </label>
          </div>
          <div className="mt-3 flex flex-col items-baseline gap-y-2">
            <label className="w-full">
              <span className="text-slate-600">Observações</span>
              <textarea
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
                className="outline-teal-700 border p-1 mt-2 w-full"
                rows={4}
                name="comments"
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
                  props.action({
                    ...fields,
                    price: Number(fields.price),
                    plans: listPlans.map((pl) => ({
                      ...pl,
                      price: Number(pl.price),
                    })),
                  })
                : props.actionEdit &&
                  props.actionEdit({
                    ...(fields.name !== props.initValues?.name && {
                      name: fields.name,
                    }),
                    ...(fields.price !== props.initValues?.price && {
                      price: Number(fields.price),
                    }),
                  })
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

  const [openModalEdit, setOpenModalEdit] = useState<null | Product>(
    null as null | Product
  );
  const [openModalCreate, setOpenModalCreate] = useState(false);

  const [products, setProducts] = useState<Product[]>([] as Product[]);
  const [loadGet, setLoadGet] = useState<boolean>(false as boolean);
  const [loadDell, setLoadDell] = useState<number[]>([] as number[]);

  const onList = useCallback(async () => {
    try {
      const { data } = await mainAPI.get("/v1/user/get/products");
      setProducts(data.data);
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
    async (fields: Required<propsField_I>) => {
      try {
        const { data } = await mainAPI.post(
          "/v1/user/create/product-service",
          fields
        );
        setOpenModalCreate(false);
        setTimeout(() => {
          const newState = produce(products, (draft) => {
            draft.push({
              id: data.data.id,
              name: fields.name,
              price: fields.price,
              plans: data.data?.plan?.map(
                (fi: Omit<Plans, "price">): Plans | null => {
                  const ind = fields.plans.findIndex(
                    (fil) => fil.name === fi.name
                  );
                  if (fi.name === fields.plans[ind].name) {
                    return {
                      ...fields.plans[ind],
                      id: fi.id,
                    };
                  }
                  return null;
                }
              ),
            });
          });
          setProducts(newState);
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
    [products]
  );

  const onEdit = useCallback(
    async (fields: propsField_I) => {
      try {
        await mainAPI.put(
          `/v1/user/update/change-field-product/${openModalEdit?.id}?${
            fields.price ? `&price=${fields.price}` : ""
          }${fields.name ? `&name=${fields.name}` : ""}`
        );
        setOpenModalEdit(null);
        const newProducts = produce(products, (draft) => {
          draft.map((pdr) => {
            if (pdr.id === openModalEdit?.id) {
              if (fields.name !== undefined) {
                pdr.name = fields.name;
              }
              if (fields.price !== undefined) {
                pdr.price = fields.price;
              }
              return pdr;
            }
            return pdr;
          });
        });
        setProducts(newProducts);
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
    [openModalEdit?.id, products]
  );

  const onEditPlan = useCallback(
    async (fields: Plans) => {
      try {
        await mainAPI.put(
          `/v1/user/update/change-field-plan-product/${fields.id}?price=${fields.price}&name=${fields.name}`
        );
        const newProducts = produce(products, (draft) => {
          draft.map((pdr) => {
            if (pdr.id === openModalEdit?.id) {
              pdr.plans.map((pl) => {
                if (pl.id === fields.id) {
                  if (fields.name !== undefined) {
                    pl.name = fields.name;
                  }
                  if (fields.price !== undefined) {
                    pl.price = fields.price;
                  }
                }
                return pl;
              });
              return pdr;
            }
            return pdr;
          });
        });
        setOpenModalEdit(products.find((pdr) => pdr.id === openModalEdit?.id)!);
        setProducts(newProducts);
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
    [openModalEdit?.id, products]
  );

  const onDelete = useCallback(
    async (id: number) => {
      try {
        if (confirm("Deseja deletar essa mensagem permanentemente?")) {
          setLoadDell([...loadDell, id]);
          await mainAPI.delete(`/v1/user/delete/product/${id}`);
          setTimeout(() => {
            setProducts(products.filter((e) => e.id !== id));
            setLoadDell(loadDell.filter((e) => e !== id));
          }, 400);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
            setProducts(products.filter((e) => e.id !== id));
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
    [loadDell, products]
  );

  const onDeletePlan = useCallback(
    async (id: number) => {
      try {
        if (confirm("Deseja deletar esse plano permanentemente?")) {
          setLoadDell([...loadDell, id]);
          await mainAPI.delete(`/v1/user/delete/plan/${id}`);
          setTimeout(() => {
            setProducts(products.filter((e) => e.id !== id));
            setLoadDell(loadDell.filter((e) => e !== id));
          }, 400);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
            setProducts(products.filter((e) => e.id !== id));
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
    [loadDell, products]
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
          label="Adicionar produto | provedor"
          setModal={setOpenModalCreate}
        />
      )}
      {openModalEdit && (
        <ModalCreate
          actionEdit={onEdit}
          type="EDIT"
          label="Editar mensagem de vencimento"
          setModal={(vl) => !vl && setOpenModalEdit(null)}
          initValues={openModalEdit}
          actionDellPlan={onDeletePlan}
          actionSavePlan={onEditPlan}
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
        <article
          className={`gap-y-2 bg-white grid hover:border-slate-600 border w-full duration-200 hover:shadow-md`}
        >
          <div
            className="p-4 cursor-pointer"
            // onClick={() => setOpenModalEdit(prd)}
          >
            <p className="text-slate-600">
              Nome:{" "}
              <strong className="text-slate-900">
                Rian Carlos de Sousa Pinho
              </strong>
            </p>
            <p className="text-slate-600">
              WhatsApp:{" "}
              <strong className="text-slate-900">5571986751101</strong>
            </p>
            <p className="text-slate-600">
              Login: <strong className="text-slate-900">sousa20300</strong>
            </p>
            <p className="text-slate-600">
              Provedor: <strong className="text-slate-900">Provedor 1</strong>
            </p>
            <p className="text-slate-600">
              Vencimento: <strong className="text-slate-900">16/06/2023</strong>
            </p>
            <p className="text-slate-600">
              Fatura: <strong className="text-blue-700">Paga</strong>
            </p>
            <p className="text-slate-600">
              Status: <strong className="text-blue-700">Ativo</strong>
            </p>
            <p className="text-slate-600">
              Notificação: <strong className="text-blue-700">Ativo</strong>
            </p>
          </div>
          <div className="flex gap-x-2">
            <button
              // disabled={loadDell.includes(prd.id)}
              // onClick={() => !loadDell.includes(prd.id) && onDelete(prd.id)}
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

        {/* {!loadGet ? (
          <>
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={155}
            />
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={155}
            />
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={155}
            />
          </>
        ) : (
          products.map((prd) => (
            <article
              key={prd.id}
              className={`hover:bg-gray-50 gap-y-2 bg-white grid hover:border-slate-600 border w-full duration-200 hover:shadow-md`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setOpenModalEdit(prd)}
              >
                <p className="text-slate-600">
                  <strong className="text-slate-900">({prd.id})</strong>:{" "}
                  {prd.name}
                </p>
                <p className="text-slate-600">
                  Preço de compra:{" "}
                  <strong className="text-slate-900">R${prd.price}</strong>
                </p>
                {prd.plans.length ? (
                  <div>
                    <p className="text-slate-600 gap-x-1 leading-normal flex flex-wrap">
                      Planos:
                      {prd.plans?.map((pl) => (
                        <span key={pl.id}>
                          <span
                            key={pl.id}
                            className="bg-7 break-keep text-white p-0.5 px-2 text-sm"
                          >
                            {pl.name}-<strong>R${pl.price}</strong>
                          </span>{" "}
                        </span>
                      ))}
                    </p>
                  </div>
                ) : undefined}
              </div>
              <div className="flex">
                <button
                  disabled={loadDell.includes(prd.id)}
                  onClick={() => !loadDell.includes(prd.id) && onDelete(prd.id)}
                  className="text-red-700 bg-6 font-medium p-2 px-5 border hover:bg-red-50 duration-200 flex-1"
                >
                  Deletar
                </button>
              </div>
            </article>
          ))
        )} */}
      </div>
    </div>
  );
}
