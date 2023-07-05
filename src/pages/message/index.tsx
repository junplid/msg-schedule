import "./styles.scss";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCollapse } from "react-collapsed";
import { HiChevronDown } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import mainAPI from "../../providers/api.provider";
import { AxiosError } from "axios";
import { Message } from "../../entities/message.entity";
import { AiFillDelete } from "react-icons/ai";
import Skeleton from "react-loading-skeleton";
import { propsAuthActions } from "../../reducers/auth.reducer";
import { useDispatch } from "react-redux";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { produce } from "immer";

interface propsField_I {
  text?: string;
  days?: number;
}

interface propsModal {
  setModal(vl: boolean): void;
  label: string;
  type: "EDIT" | "ADD";
  initValues?: propsField_I;
  actions(fields: Required<Omit<propsField_I, "id">>): Promise<void>;
}

const ModalCreate = (props: propsModal): JSX.Element => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({});
  const [fields, setFields] = useState<propsField_I>(
    props.initValues as propsField_I
  );

  return (
    <div className="py-5 flex justify-center items-center flex-col fixed top-0 left-0 w-screen h-screen">
      <div className="max-w-2xl w-full bg-white shadow-lg relative z-10 anima">
        <div className="p-5 bg-primary text-white flex justify-between items-center font-medium text-lg">
          <span>{props.label}</span>
          <button className="icon-2" onClick={() => props.setModal(false)}>
            <IoClose />
          </button>
        </div>
        <label className="mt-5 px-5 block">
          <span className="text-slate-600">Mensagem</span>
          <textarea
            value={fields?.text ?? ""}
            onChange={(e) =>
              setFields({
                ...fields,
                [e.target.name]: e.target.value,
              })
            }
            className="outline-teal-700 border p-1 mt-3 w-full"
            rows={9}
            name="text"
          />
        </label>
        <div className="px-5 mt-3 pb-5">
          <div className="bg-7 mt-2">
            <button
              {...getToggleProps()}
              className="p-2 px-3 text-white flex items-center justify-between w-full"
            >
              <div className={`flex items-center duration-200`}>
                <span className="text-lg">Gatilhos de mensagem</span>
              </div>
              <div
                className={`icon-aside duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              >
                <HiChevronDown />
              </div>
            </button>
            <ul className="bg-5" {...getCollapseProps()}>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{NOME}"}</strong>: Nome completo
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{PRIMEIRO_NOME}"}</strong>: Primeiro Nome
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{ZAP}"}</strong>: Whatsapp
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{LOGIN"} </strong>: Login
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{SENHA}"}</strong>: Senha
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{PLANO}"}</strong>: Plano
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{PRODUTO}"}</strong>: Produto/Mensal
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{OBS}"}</strong>: Observações
              </li>
              <li className="text-sm p-1.5 px-3">
                <strong>{"{DATA_VENCI}"}</strong>: Data de Vencimento
              </li>
            </ul>
          </div>
        </div>
        <div className="gap-x-4 flex justify-between px-5 pb-5">
          <input
            className="pl-3 border"
            min={0}
            type="text"
            name="days"
            value={`Dias: ${fields?.days ?? 0}`}
            onChange={(e) =>
              setFields({
                ...fields,
                [e.target.name]: e.target.value.replace(/\D/g, ""),
              })
            }
            placeholder="Dias antes do vencimento"
          />
          <div className="flex gap-x-4 justify-end">
            <button
              onClick={() => props.setModal(false)}
              className="text-red-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={() =>
                props.actions({
                  text: fields.text!.replace(/\n/g, "\\n"),
                  days: Number(String(fields.days).replace(/\D/g, ""))!,
                })
              }
              className="text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
            >
              {props.type === "ADD" && "Criar"}
              {props.type === "EDIT" && "Salvar"}
            </button>
          </div>
        </div>
      </div>
      <div
        onClick={() => props.setModal(false)}
        className="fixed top-0 left-0 w-screen h-screen bg-3 backdrop-blur-sm bg-teal-900/60"
      ></div>
    </div>
  );
};

export default function PageMessageWhatsApp() {
  const [_cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  const [openModalEdit, setOpenModalEdit] = useState<null | Message>(
    null as null | Message
  );
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [messages, setMessages] = useState<Message[]>([] as Message[]);
  const [loadGet, setLoadGet] = useState<boolean>(false as boolean);
  const [loadDell, setLoadDell] = useState<number[]>([] as number[]);

  // const auth = useSelector(
  //   (state: any): propsInitialState => state._root.entries[0][1]
  // );

  const onList = useCallback(async () => {
    try {
      const { data } = await mainAPI.get("/v1/user/get/messages");
      setMessages(data.data);
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
      setTimeout(
        () =>
          setMessages([
            ...messages,
            {
              ...fields,
              id: data.data.id,
            },
          ]),
        300
      );
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
        await mainAPI.put(
          `/v1/user/update/change-field-message/${openModalEdit?.id}?text=${fields.text}&days=${fields.days}`
        );
        alert("Editado com sucesso!");
        setOpenModalEdit(null);
        const newMessages = produce(messages, (draft) => {
          draft.map((msg) => {
            if (msg.id === openModalEdit?.id) {
              if (fields.days !== undefined) {
                msg.days = fields.days;
              }
              if (fields.text !== undefined) {
                msg.text = fields.text;
              }
              return msg;
            }
            return msg;
          });
        });
        setMessages(newMessages);
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
          setMessages(messages.filter((e) => e.id !== id));
          setLoadDell(loadDell.filter((e) => e !== id));
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 400) {
            alert(error.response.data.body[0].message);
            setMessages(messages.filter((e) => e.id !== id));
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
    [loadDell, messages]
  );

  useEffect(() => {
    onList();
  }, []);

  return (
    <div>
      {openModalCreate && (
        <ModalCreate
          actions={onCreate}
          type="ADD"
          label="Criar nova mensagem"
          setModal={setOpenModalCreate}
        />
      )}
      {openModalEdit && (
        <ModalCreate
          actions={onEdit}
          type="EDIT"
          label="Editar mensagem"
          setModal={(vl) => !vl && setOpenModalEdit(null)}
          initValues={openModalEdit}
        />
      )}
      <h3 className="font-bold text-xl">Mensagens</h3>

      <div className="mt-6 bg-6">
        <div className="p-4 px-5 flex justify-between items-center bg-secundary">
          <h4 className="font-medium text-slate-50">Mensagens automáticas</h4>
          <button
            onClick={() => {
              setOpenModalCreate(true);
              setOpenModalEdit(null);
            }}
            className="text-secundary bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
          >
            Adicionar nova mensagem
          </button>
        </div>
        {!loadGet ? (
          <Skeleton
            borderRadius={0}
            baseColor="#d4d7dc"
            highlightColor="#f4f8ff"
            width={"100%"}
            height={80}
          />
        ) : (
          <>
            {messages.length > 0 ? (
              <table className="shadow-md bg-white w-full">
                <tbody>
                  {messages.map((e) => (
                    <tr
                      onClick={() => {
                        setOpenModalEdit(e);
                      }}
                      key={e.id}
                      className={`${
                        loadDell.includes(e.id) ? "opacity-70" : ""
                      } duration-200 border-b last:border-0 hover:bg-slate-100 cursor-pointer`}
                    >
                      <td className="pl-8 pr-4 py-4">
                        <div>
                          <h3 className="font-medium text-slate-700">
                            Menssagem de {e.days} dias antes do vencimento
                          </h3>
                          <p className="text-slate-400 font-light">
                            Mensagem será enviada Automáticamente {e.days} dias
                            antes do vencimento
                          </p>
                        </div>
                      </td>
                      <td align="right" className="pr-8 pl-4 py-4">
                        <button
                          disabled={loadDell.includes(e.id)}
                          onClick={() =>
                            !loadDell.includes(e.id) && onDelete(e.id)
                          }
                          className="hover:bg-red-500 duration-300 hover:text-red-50 p-2 px-6 font-medium bg-red-100 text-sm icon-3 text-red-600"
                        >
                          <AiFillDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-20 flex justify-center items-center">
                <span className="text-slate-600">
                  Não há mensagens cadastradas
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
