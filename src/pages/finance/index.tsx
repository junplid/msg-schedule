import "./styles.scss";
import Select from "react-select";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import DatePicker from "react-date-picker";
import ReactPaginate from "react-paginate";
import { ModalCreate } from "./Modals/create";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import mainAPI from "../../providers/api.provider";
import { AiFillDelete, AiOutlineEdit } from "react-icons/ai";
import { propsAuthActions } from "../../reducers/auth.reducer";
import { CgPlayTrackNext, CgPlayTrackPrev } from "react-icons/cg";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { ModalEdit } from "./Modals/edit";
import { TbCoins } from "react-icons/tb";

interface Payment_I {
  id: number;
  name: string;
  payday: Date;
  price: string;
  type_transation: "EXIT" | "PROHIBITED";
}

interface propsField_I {
  name: string;
  price: number;
  type_transation: "EXIT" | "PROHIBITED";
  date: Date;
}

interface propsFilter_I {
  page?: number;
  amount?: number;
  search?: string;
  date?: (Date | null)[];
  type_transation?: "PROHIBITED" | "EXIT";
}

export default function PageFinance() {
  const [_cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);

  const [openModalEdit, setOpenModalEdit] = useState<
    (propsField_I & { date: Date; id: number }) | null
  >(null as (propsField_I & { date: Date; id: number }) | null);

  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [payments, setPayments] = useState<Payment_I[]>([] as Payment_I[]);
  const [loadGet, setLoadGet] = useState<boolean>(false as boolean);
  const [loadDell, setLoadDell] = useState<number[]>([] as number[]);
  const [balance, setBalance] = useState<number | null>(null as number | null);

  const [filter, setFilter] = useState<propsFilter_I>({
    amount: 20,
  } as propsFilter_I);

  // const auth = useSelector(
  //   (state: any): propsInitialState => state._root.entries[0][1]
  // );

  const onList = useCallback(async (props: propsFilter_I) => {
    try {
      setLoadGet(true);
      const { data } = await mainAPI.get(
        `/v1/user/get/my-payments?${
          props.amount !== undefined ? `amount=${props.amount}&` : ""
        }${props.search !== undefined ? `search=${props.search}&` : ""}${
          props.type_transation !== undefined
            ? `type_transation=${props.type_transation}&`
            : ""
        }${props.page !== undefined ? `page=${props.page}&` : ""}${
          props.date !== undefined && props.date[0] !== null
            ? `afterDate=${props.date[0]}&`
            : ""
        }${
          props.date !== undefined && props.date[1] !== null
            ? `beforeDate=${props.date[1]}`
            : ""
        }`
      );
      setPayments(data.data);
      setTimeout(() => setLoadGet(false), 600);
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

  // const onEdit = useCallback(
  //   async (fields: propsField_I) => {
  //     try {
  //       await mainAPI.put(
  //         `/v1/user/update/change-field-message/${openModalEdit?.id}?text=${fields.text}&days=${fields.days}`
  //       );
  //       alert("Editado com sucesso!");
  //       setOpenModalEdit(null);
  //       // const newMessages = produce(payments, (draft) => {
  //       //   draft.map((msg) => {
  //       //     if (msg.id === openModalEdit?.id) {
  //       //       if (fields.days !== undefined) {
  //       //         msg.days = fields.days;
  //       //       }
  //       //       if (fields.text !== undefined) {
  //       //         msg.text = fields.text;
  //       //       }
  //       //       return msg;
  //       //     }
  //       //     return msg;
  //       //   });
  //       // });
  //       // setPayments(newMessages);
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
  //   [openModalEdit?.id]
  // );

  const onDelete = useCallback(
    async (id: number) => {
      try {
        if (confirm("Deseja deletar essa transação permanentemente?")) {
          setLoadDell([...loadDell, id]);
          await mainAPI.delete(`/v1/user/delete/payment/${id}`);
          setOpenModalCreate(false);
          const actual_price = payments.find((pay) => pay.id === id)!.price;
          setBalance((balance ?? 0) - Number(actual_price));
          setPayments(payments.filter((e) => e.id !== id));
          setLoadDell(loadDell.filter((e) => e !== id));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
            setPayments(payments.filter((e) => e.id !== id));
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
    [loadDell, payments, balance]
  );

  const onCreate = useCallback(
    async (fields: propsField_I): Promise<boolean> => {
      try {
        const { data } = await mainAPI.post(
          `/v1/user/create/transaction`,
          fields
        );
        setPayments([
          {
            ...fields,
            id: data.data.id,
            payday: fields.date,
            price: String(fields.price),
          },
          ...payments,
        ]);
        if (fields.type_transation === "EXIT") {
          setBalance((balance ?? 0) - fields.price);
        }
        if (fields.type_transation === "PROHIBITED") {
          setBalance((balance ?? 0) + fields.price);
        }
        return true;
      } catch (error) {
        if (error instanceof AxiosError) {
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
        return false;
      }
    },
    [payments, balance]
  );

  const onEdit = useCallback(
    async (fields: propsField_I & { id: number }): Promise<boolean> => {
      try {
        const actual_price = payments.find(
          (pay) => pay.id === fields.id
        )!.price;

        const valueaction = fields.price - Number(actual_price);

        if (fields.type_transation === "EXIT") {
          setBalance((balance ?? 0) - valueaction);
        } else {
          setBalance((balance ?? 0) + valueaction);
        }

        await mainAPI.put(`/v1/user/update/transaction`, {
          ...fields,
          price: fields.price,
          valueaction,
        });

        setPayments(
          payments.map((pay) => {
            if (fields.id === pay.id) {
              return {
                id: fields.id,
                name: fields.name,
                payday: fields.date,
                price: String(fields.price),
                type_transation: fields.type_transation,
              };
            }
            return pay;
          })
        );
        return true;
      } catch (error) {
        if (error instanceof AxiosError) {
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
        return false;
      }
    },
    [payments, balance]
  );

  const onGetCount = useCallback(
    async (props: propsFilter_I): Promise<number> => {
      try {
        const { data } = await mainAPI.get(
          `/v1/user/get/count-finance?${
            props.amount !== undefined ? `amount=${props.amount}&` : ""
          }${props.search !== undefined ? `search=${props.search}&` : ""}${
            props.type_transation !== undefined
              ? `type_transation=${props.type_transation}&`
              : ""
          }${props.page !== undefined ? `page=${props.page}&` : ""}${
            props.date !== undefined && props.date[0] !== null
              ? `afterDate=${props.date[0]}&`
              : ""
          }${
            props.date !== undefined && props.date[1] !== null
              ? `beforeDate=${props.date[1]}`
              : ""
          }`
        );
        return data.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            dispatch({ type: "LOGOUT" });
            removeCookie("auth", {
              maxAge: 2147483647,
              path: "/",
            });
            navigate("/");
          }
        }
        return 0;
      }
    },
    [payments]
  );

  const onGetBalance = useCallback(async (): Promise<void> => {
    try {
      const { data } = await mainAPI.get(`/v1/user/get/my-balance`);
      setBalance(data.data);
    } catch (error) {
      if (error instanceof AxiosError) {
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
  }, [payments]);

  useEffect(() => {
    onGetBalance();
    (async () => {
      const amount = await onGetCount({});
      if (amount > 0) {
        setAmount(amount);
        onList({});
      }
    })();
  }, []);

  return (
    <div>
      {openModalCreate && (
        <ModalCreate actions={onCreate} setModal={setOpenModalCreate} />
      )}
      {openModalEdit && (
        <ModalEdit
          actions={onEdit}
          setModal={setOpenModalEdit}
          initialVl={openModalEdit}
        />
      )}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl">Financeiro</h3>
        <div>
          <button
            onClick={() => setOpenModalCreate(true)}
            className="text-secundary bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Adicionar transação
          </button>
        </div>
      </div>

      <div className="mt-5 max-w-xs">
        <article className="flex shadow-slate-200/40 justify-center gap-x-4 items-center bg-white p-6 w-full shadow-md">
          <div className="flex gap-x-2 items-center">
            <TbCoins size={48} className="text-sky-800" />
            <h1 className="text-sky-800 text-lg font-medium">Saldo:</h1>
          </div>
          <span className="text-sky-800 font-medium text-2xl">
            R$ {balance ?? 0}
          </span>
        </article>
      </div>

      <div className="bg-white mt-6">
        <div className="p-5 flex gap-2">
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Nome</span>
            <input
              disabled={loadGet}
              style={{ height: 38 }}
              className="pl-4 border outline-blue-700"
              type="text"
              name="search"
              placeholder="Identificador"
              value={filter.search ?? ""}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  [e.target.name]: e.target.value,
                })
              }
            />
          </label>
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
            <span className="text-slate-600">Tipo da transação</span>
            <Select
              isDisabled={loadGet}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  type_transation: e!.value as "EXIT" | "PROHIBITED",
                })
              }
              options={[
                { value: "PROHIBITED", label: "Entrada" },
                { value: "EXIT", label: "Saída" },
              ]}
              placeholder="Selecione"
            />
          </label>
          <label className="flex flex-1 flex-col gap-y-1">
            <span className="text-slate-600">Data: de</span>
            <DatePicker
              disabled={loadGet}
              className="h-9"
              value={filter.date ? filter.date[0] : undefined}
              onChange={(e: any) =>
                setFilter({
                  ...filter,
                  date: [e, filter.date ? filter.date[1] : null],
                })
              }
            />
          </label>
          <label className="flex flex-1 flex-col gap-y-1">
            <span className="text-slate-600">Data: até</span>
            <DatePicker
              disabled={loadGet}
              className="h-9"
              value={filter.date ? filter.date[1] : undefined}
              onChange={(e: any) =>
                setFilter({
                  ...filter,
                  date: [filter.date ? filter.date[0] : null, e],
                })
              }
            />
          </label>
          <button
            disabled={loadGet}
            onClick={() => onList({ ...filter, page: undefined })}
            className="text-secundary bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Filtrar
          </button>
        </div>
        <table className="shadow-md bg-white w-full">
          <thead>
            <tr className="border-b">
              <td className="pl-8 py-4 font-bold">ID</td>
              <td className="px-2 py-4 font-bold">Venda</td>
              <td className="px-2 py-4 font-bold">Valor</td>
              <td className="px-2 py-4 font-bold">Data da transação</td>
              <td className="pr-8 pl-2 py-4 font-bold" style={{ width: 190 }}>
                Ação
              </td>
            </tr>
          </thead>
          <tbody>
            {!loadGet &&
              payments.map((e) => (
                <tr
                  key={e.id}
                  className={`${
                    loadDell.includes(e.id) ? "opacity-70" : ""
                  } even:bg-slate-100/70 duration-200 border-b last:border-0 hover:bg-slate-50/60`}
                >
                  <td className="pl-8 pr-2 py-0.5">
                    <h3 className="text-slate-700">#{e.id}</h3>
                  </td>
                  <td className="px-2 py-0.5">
                    <h3 className="text-slate-700">{e.name}</h3>
                  </td>
                  <td
                    style={{ height: 43 }}
                    className="px-2 flex items-center py-0.5"
                  >
                    <h3
                      className={`${
                        e.type_transation === "PROHIBITED"
                          ? "bg-green-600"
                          : "bg-red-500"
                      } font-medium px-3 py-0.5 text-slate-50`}
                    >
                      R${" "}
                      {e.type_transation === "EXIT"
                        ? (Number(e.price) * -1).toFixed(2)
                        : Number(e.price).toFixed(2)}
                    </h3>
                  </td>
                  <td className="px-2 py-0.5">
                    <h3
                      style={{ letterSpacing: 2 }}
                      className="font-medium text-slate-700"
                    >
                      {new Date(e.payday).toLocaleDateString("pt-br")}
                    </h3>
                  </td>
                  <td align="right" className="pr-8 pl-2 py-0.5">
                    <button
                      disabled={loadDell.includes(e.id)}
                      onClick={() =>
                        !loadDell.includes(e.id) &&
                        setOpenModalEdit({
                          date: new Date(e.payday),
                          name: e.name,
                          price: Number(e.price),
                          id: e.id,
                          type_transation: e.type_transation,
                        })
                      }
                      className="hover:bg-blue-500 mr-2 duration-300 hover:text-blue-50 p-2 px-6 font-medium bg-blue-100 text-sm icon-3 text-blue-600"
                    >
                      <AiOutlineEdit />
                    </button>
                    <button
                      disabled={loadDell.includes(e.id)}
                      onClick={() => !loadDell.includes(e.id) && onDelete(e.id)}
                      className="hover:bg-red-500 duration-300 hover:text-red-50 p-2 px-6 font-medium bg-red-100 text-sm icon-3 text-red-600"
                    >
                      <AiFillDelete />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="">
        {loadGet ? (
          <>
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={40}
            />
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={40}
            />
          </>
        ) : (
          <>
            {amount !== null && amount > 0 && payments.length > 0 ? (
              <>
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
                      onClick={(e) =>
                        setFilter({ ...filter, page: e.selected })
                      }
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white h-20 flex justify-center items-center">
                <span className="text-slate-600">
                  Não há transações efetuadas
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
