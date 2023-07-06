import { AxiosError } from "axios";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import mainAPI from "../../providers/api.provider";
import {
  propsAuthActions,
  propsInitialState,
} from "../../reducers/auth.reducer";
import { LoadComponent } from "../../components/load";
import Skeleton from "react-loading-skeleton";

interface UserProps {
  email: string;
  full_name: string;
  whatsapp: string;
}

export default function PageUser() {
  const [_cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProps>({} as UserProps);
  const [loadEdit, setLoadEdit] = useState<boolean>(false as boolean);
  const [load, setLoad] = useState<boolean>(false as boolean);
  const [error, setError] = useState<any>(null as any);
  const [fields, setFields] = useState<
    Partial<UserProps & { password: string }>
  >({} as Partial<UserProps & { password: string }>);

  const auth = useSelector(
    (state: any): propsInitialState => state._root.entries[0][1]
  );

  const onGet = useCallback(async () => {
    try {
      setLoad(true);
      const { data } = await mainAPI.get("/v1/user/get/info-user");
      setUser(data.data);
      setLoad(false);
    } catch (error) {
      setLoad(false);
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
    async (fields: Partial<UserProps & { password: string }>) => {
      try {
        setLoadEdit(true);
        await mainAPI.put(
          `/v1/user/update/change-field?${
            fields.full_name ? `full_name=${fields.full_name}&` : ""
          }${fields.password ? `password=${fields.password}&` : ""}${
            fields.whatsapp ? `whatsapp=${fields.whatsapp}&` : ""
          }`
        );
        dispatch({
          type: "LOGIN",
          payload: {
            ...auth.user!,
            ...(fields.full_name && { full_name: fields.full_name }),
          },
        });
        setUser({ ...user, ...fields });
        setLoadEdit(false);
      } catch (error) {
        setLoadEdit(false);
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
          if (error.response?.status === 500) {
            alert(error.response.data.message);
          }
          setError(error.response?.data?.query[0]);
          return;
        }
        console.log(error);
      }
    },
    [user]
  );

  useEffect(() => {
    onGet();
  }, []);

  return (
    <div className="bg-white">
      <div className="p-4 px-5 flex justify-between items-center bg-primary">
        <h4 className="font-medium text-slate-50">Meus dados</h4>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onEdit(fields);
        }}
        className="p-4 mt-6"
      >
        <div className="gap-y-4 grid">
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Nome completo</span>
            {load && (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={47}
              />
            )}
            {!load && (
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="full_name"
                value={fields?.full_name ?? user?.full_name ?? ""}
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
              />
            )}
            {error?.path.includes("full_name") && (
              <p className="text-red-600 bg-red-200 w-full px-1">
                {error.message}
              </p>
            )}
          </label>
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">E-mail</span>
            {load && (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={47}
              />
            )}
            {!load && (
              <input
                disabled
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="email"
                value={fields?.email ?? user?.email ?? ""}
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
              />
            )}
            {error?.path.includes("email") && (
              <p className="text-red-600 bg-red-200 w-full px-1">
                {error.message}
              </p>
            )}
          </label>
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">WhatsApp</span>
            {load && (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={47}
              />
            )}
            {!load && (
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="whatsapp"
                value={fields?.whatsapp ?? user?.whatsapp ?? ""}
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
              />
            )}
            {error?.path.includes("whatsapp") && (
              <p className="text-red-600 bg-red-200 w-full px-1">
                {error.message}
              </p>
            )}
          </label>
          <label className="flex flex-1 gap-y-1 flex-col">
            <span className="text-slate-600">Nova senha</span>
            {load && (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={47}
              />
            )}
            {!load && (
              <input
                className="pl-4 border h-12 outline-teal-700"
                type="text"
                name="password"
                value={fields?.password ?? ""}
                onChange={(e) =>
                  setFields({ ...fields, [e.target.name]: e.target.value })
                }
              />
            )}
            {error?.path.includes("password") && (
              <p className="text-red-600 bg-red-200 w-full px-1">
                {error.message}
              </p>
            )}
          </label>
        </div>
        <div className="flex justify-end">
          <button
            disabled={loadEdit}
            className="mt-10 text-sky-700 bg-6 shadow-sm font-medium p-2 px-5 border hover:bg-slate-50 duration-200"
            type="submit"
          >
            {loadEdit ? <LoadComponent /> : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
