import { AxiosError } from "axios";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { IoIosAdd } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import mainAPI from "../../providers/api.provider";
import { propsAuthActions } from "../../reducers/auth.reducer";
import { Plans, Product } from "../../entities/product.entity";
import { produce } from "immer";
import { BiSave } from "react-icons/bi";
import Skeleton from "react-loading-skeleton";
import { LoadComponent } from "../../components/load";

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
    <div className="py-5 flex items-center flex- overflow-scroll overflow-x-hidden fixed top-0 left-0 w-screen h-screen">
      <div className="max-w-2xl m-auto w-full bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-3 text-white flex justify-between items-center font-medium text-lg">
          <span>{props.label}</span>
          <button className="icon-2" onClick={() => props.setModal(false)}>
            <IoClose />
          </button>
        </div>
        <div className="px-5">
          <div className="my-5 flex gap-x-2">
            <label className="flex flex-1 gap-y-1 flex-col">
              <span className="text-slate-600">Nome</span>
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="name"
                placeholder="Nome do: produto, serviço ou provedor"
                value={fields?.name ?? ""}
                onChange={(e) =>
                  setFields({
                    ...fields,
                    [e.target.name]: e.target.value,
                  })
                }
              />
            </label>
            <label className="flex flex-col w-36 gap-y-1">
              <span className="text-slate-600">Preço de compra</span>
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="price"
                placeholder="Ex: 10"
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
          <div className="">
            <div className="flex flex-col">
              <span className="text-lg">
                Planos mensais <strong>{listPlans?.length ?? 0}</strong>
              </span>
              <small className="text-slate-500 text-base">
                Deixar sem planos significa que o pagamento pelo:{" "}
                <strong className="text-slate-800">
                  {fields?.name && fields?.name !== ""
                    ? fields?.name
                    : "Produto/Provedor"}
                </strong>
                , é feito apenas uma vez.
              </small>
            </div>
            {listPlans.length ? (
              <ul className="border-y py-4 gap-2 my-2 flex flex-wrap">
                {listPlans?.map((plan, i) => (
                  <li key={i}>
                    <div className="flex gap-x-2">
                      <input
                        onChange={(e) =>
                          handleValuePlanEdit({
                            id: plan.id ?? i,
                            name: e.target.name,
                            value: e.target.value,
                          })
                        }
                        type="text"
                        value={plan.name}
                        name="name"
                        className="pl-2 border outline-teal-700"
                      />
                      <input
                        onChange={(e) =>
                          handleValuePlanEdit({
                            id: plan.id,
                            name: e.target.name,
                            value: formatePrice(e.target.value),
                          })
                        }
                        className="border pl-2 w-24 outline-teal-700"
                        value={plan.price}
                        type="text"
                        name="price"
                      />
                      <button
                        onClick={async () => {
                          if (props.actionDellPlan) {
                            await props.actionDellPlan(plan.id);
                          }
                          setListPlans(
                            listPlans.filter((item) => item.name !== plan.name)
                          );
                        }}
                        className="text-slate-50 hover:bg-red-600 duration-200 bg-red-700 icon-3 p-1"
                      >
                        <IoClose />
                      </button>
                      {props.type === "EDIT" &&
                        listPlans?.some((ini) => {
                          if (plan.id === ini.id) {
                            if (
                              ini.name !== plan.name ||
                              ini.price !== Number(plan.price)
                            )
                              return true;
                          }
                        }) && (
                          <button
                            onClick={async () => {
                              if (props.actionSavePlan) {
                                setLoadSavePlan([...loadSavePlan, plan.name]);
                                await props.actionSavePlan(plan);
                                const newListp = listPlans.map((e) => {
                                  if (e.id === plan.id) return { ...plan };
                                  return e;
                                });
                                console.log(newListp);
                                setListPlans(newListp);
                                setLoadSavePlan(
                                  loadSavePlan.filter((pl) => pl !== plan.name)
                                );
                              }
                            }}
                            className="text-slate-50 hover:bg-green-600 duration-200 bg-green-500 icon-3 p-1"
                          >
                            {loadSavePlan.includes(plan.name) ? (
                              <LoadComponent />
                            ) : (
                              <BiSave />
                            )}
                          </button>
                        )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : undefined}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setListPlans([...listPlans, fieldsPlan]);
                setFieldsPlan({} as Plans);
              }}
              className={`flex ${
                !listPlans.length ? "mt-3" : ""
              } items-end gap-x-2`}
            >
              <label className="flex flex-1 gap-y-1 flex-col">
                <span className="text-slate-600">Nome do plano</span>
                <input
                  required
                  autoComplete="off"
                  className="pl-4 border h-12 outline-teal-700"
                  type="text"
                  name="name"
                  placeholder="Ex: Básico, Premium"
                  onChange={(e) =>
                    setFieldsPlan({
                      ...fieldsPlan,
                      [e.target.name]: e.target.value,
                    })
                  }
                  value={fieldsPlan.name ?? ""}
                />
              </label>
              <label className="flex flex-col w-36 gap-y-1">
                <span className="text-slate-600">R$/mensal</span>
                <input
                  required
                  className="pl-4 border h-12 outline-teal-700"
                  autoComplete="off"
                  type="text"
                  name="price"
                  placeholder="Ex: 5.99"
                  onChange={(e) =>
                    setFieldsPlan({
                      ...fieldsPlan,
                      [e.target.name]: formatePrice(e.target.value),
                    })
                  }
                  value={fieldsPlan.price ?? ""}
                />
              </label>
              <button
                type="submit"
                className="h-12 text-green-500 bg-6 shadow-sm font-medium p-2 px-3 border hover:bg-slate-50 duration-200"
              >
                <div className="icon">
                  <IoIosAdd />
                </div>
              </button>
            </form>
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

export default function PageProductsPlans() {
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

  // const auth = useSelector(
  //   (state: any): propsInitialState => state._root.entries[0][1]
  // );

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
        const { data } = await mainAPI.put(
          `/v1/user/update/change-field-plan-product/${openModalEdit?.id}?${
            fields.price ? `price=${fields.price}&` : ""
          }${fields.name ? `name=${fields.name}` : ""}`,
          {
            idPlan: fields.id ?? undefined,
          }
        );
        const newProducts = produce(products, (draft) => {
          const dd = draft.map((pdr) => {
            if (pdr.id === openModalEdit?.id) {
              pdr.plans.map((pl) => {
                if (pl.id === fields.id) {
                  if (fields.name !== undefined) {
                    pl.name = fields.name;
                  }
                  if (fields.price !== undefined) {
                    pl.price = fields.price;
                  }
                } else {
                  pdr.plans.push({ ...fields, id: data.data });
                }
                return pl;
              });
              return pdr;
            }
            return pdr;
          });

          draft = dd;
          return draft;
        });
        setOpenModalEdit(null);
        console.log(newProducts);
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
            const newProducts = produce(products, (draft) => {
              draft.map((pdr) => {
                if (pdr.id === openModalEdit?.id) {
                  return pdr.plans.filter((pl) => pl.id !== id);
                }
                return pdr;
              });
            });
            setProducts(newProducts);
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
    [loadDell, products, openModalEdit?.id]
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
      <h3 className="font-bold text-xl">Produtos e Serviços</h3>

      <div className="p-4 mt-6 px-5 flex justify-between items-center bg-secundary">
        <h4 className="font-medium text-slate-50">Produtos | Provedores</h4>
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

      <div>
        {!loadGet ? (
          <div className="gap-2 mt-3 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
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
          </div>
        ) : products.length ? (
          <div className="mt-6 gap-2 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
            {products.map((prd) => (
              <article
                key={prd.id}
                className={`hover:bg-gray-50 gap-y-2 bg-white justify-between flex flex-col hover:border-slate-600 border w-full duration-200 hover:shadow-md`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setOpenModalEdit(prd)}
                >
                  <p className="text-slate-600">
                    <strong className="text-slate-900">({prd.id})</strong>:{" "}
                    {prd.name}
                  </p>
                  {/* <p className="text-slate-600">
                  Preço de compra:{" "}
                  <strong className="text-slate-900">R${prd.price}</strong>
                </p> */}
                  {prd.plans.length ? (
                    <div>
                      <p className="text-slate-600 gap-x-1 flex flex-wrap">
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
                    onClick={() =>
                      !loadDell.includes(prd.id) && onDelete(prd.id)
                    }
                    className="text-red-700 bg-6 font-medium h-10 p-2 px-5 border hover:bg-red-50 duration-200 flex-1"
                  >
                    Deletar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white h-20 flex justify-center items-center">
            <span className="text-slate-600">
              Não há produtos/serviços cadastrados
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
