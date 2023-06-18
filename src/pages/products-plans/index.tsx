import { AxiosError } from "axios";
import { produce } from "immer";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { IoIosAdd } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Message } from "../../entities/message.entity";
import mainAPI from "../../providers/api.provider";
import { propsAuthActions } from "../../reducers/auth.reducer";
import { Plans, Product } from "../../entities/product.entity";

interface propsField_I extends Partial<Omit<Product, "id">> {}

interface propsModal {
  setModal(vl: boolean): void;
  label: string;
  type: "EDIT" | "ADD";
  initValues?: propsField_I;
  actions(fields: Required<Omit<propsField_I, "id">>): Promise<void>;
}

const ModalCreate = (props: propsModal): JSX.Element => {
  const [fields, setFields] = useState<Required<Omit<propsField_I, "plans">>>(
    props.initValues as Required<Omit<propsField_I, "plans">>
  );
  const [listPlans, setListPlans] = useState<Plans[]>(
    props.initValues?.plans ?? ([] as Plans[])
  );
  const [fieldsPlan, setFieldsPlan] = useState<Plans>({} as Plans);

  return (
    <div className="py-5 flex justify-center items-center flex-col fixed top-0 left-0 w-screen h-screen">
      <div className="max-w-2xl w-full bg-white shadow-lg relative z-10 anima">
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
                  setFields({ ...fields, [e.target.name]: e.target.value })
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
                  setFields({ ...fields, [e.target.name]: e.target.value })
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
                <strong className="text-slate-800">Nome</strong>, é feito apenas
                uma vez.
              </small>
            </div>
            <ul className="gap-2 my-2 flex flex-wrap">
              {listPlans?.map((plan) => (
                <li className="bg-5">
                  <div className="flex items-center gap-x-2 pl-2">
                    <span className="text-slate-800">
                      {plan.name} <strong>R${plan.price}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setListPlans(
                          listPlans.filter((item) => item.name !== plan.name)
                        );
                      }}
                      className="text-slate-50 hover:bg-red-600 duration-200 bg-red-700 icon-3 p-1"
                    >
                      <IoClose />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setListPlans([...listPlans, fieldsPlan]);
                setFieldsPlan({} as Plans);
              }}
              className="flex items-end gap-x-2"
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
                      [e.target.name]: e.target.value,
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
              props.actions({
                ...fields,
                plans: listPlans,
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
        className="fixed top-0 left-0 w-screen h-screen backdrop-blur-sm bg-teal-900/80"
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
      const { data } = await mainAPI.get("/v1/user/get/messages");
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

  const onCreate = useCallback(async (fields: Required<propsField_I>) => {
    try {
      const { data } = await mainAPI.post("/v1/user/create/message", fields);
      setOpenModalCreate(false);
      // setTimeout(
      //   () =>
      //     setMessages([
      //       ...messages,
      //       {
      //         ...fields,
      //         id: data.data.id,
      //       },
      //     ]),
      //   300
      // );
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
  }, []);

  const onEdit = useCallback(
    async (fields: propsField_I) => {
      try {
        // await mainAPI.put(
        //   `/v1/user/update/change-field-message/${openModalEdit?.id}?text=${fields.text}&days=${fields.days}`
        // );
        alert("Editado com sucesso!");
        setOpenModalEdit(null);
        // const newMessages = produce(messages, (draft) => {
        //   draft.map((msg) => {
        //     if (msg.id === openModalEdit?.id) {
        //       if (fields.days !== undefined) {
        //         msg.days = fields.days;
        //       }
        //       if (fields.text !== undefined) {
        //         msg.text = fields.text;
        //       }
        //       return msg;
        //     }
        //     return msg;
        //   });
        // });
        // setMessages(newMessages);
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
    [openModalEdit?.id]
  );

  const onDelete = useCallback(
    async (id: number) => {
      try {
        if (confirm("Deseja deletar essa mensagem permanentemente?")) {
          setLoadDell([...loadDell, id]);
          await mainAPI.delete(`/v1/user/delete/message/${id}`);
          setOpenModalCreate(false);
          setProducts(products.filter((e) => e.id !== id));
          setLoadDell(loadDell.filter((e) => e !== id));
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
    // onList();
  }, []);

  return (
    <div>
      {openModalCreate && (
        <ModalCreate
          actions={onCreate}
          type="ADD"
          label="Adicionar produto | provedor"
          setModal={setOpenModalCreate}
        />
      )}
      {openModalEdit && (
        <ModalCreate
          actions={onEdit}
          type="EDIT"
          label="Editar mensagem de vencimento"
          setModal={(vl) => !vl && setOpenModalEdit(null)}
          initValues={openModalEdit}
        />
      )}
      <div className="p-4 px-5 flex justify-between items-center bg-teal-900">
        <h4 className="font-medium text-slate-50">Produtos | Provedores</h4>
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

      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(200px,300px))]">
        <article className="hover:bg-gray-50 gap-y-2 grid hover:border-slate-600 border bg-6 duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="p-4 cursor-pointer">
            <p className="text-slate-600">
              <strong className="text-slate-900">(265)</strong>: Produto
            </p>
            <p className="text-slate-600">
              Preço de compra: <strong className="text-slate-900">R$10</strong>
            </p>
            <div>
              <p className="text-slate-600 leading-normal">
                Planos:{" "}
                <span className="bg-7 break-keep text-white p-0.5 px-2 text-sm">
                  Básico-<strong>R$10</strong>
                </span>{" "}
                <span className="bg-7 text-white p-0.5 px-2 text-sm">
                  Premium-<strong>R$35</strong>
                </span>{" "}
                <span className="bg-7 text-white p-0.5 px-2 text-sm">
                  Master-<strong>R$35</strong>
                </span>{" "}
              </p>
            </div>
          </div>
          <div className="flex">
            <button className="text-red-700 bg-6 font-medium p-2 px-5 border hover:bg-red-50 duration-200 flex-1">
              Deletar
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
