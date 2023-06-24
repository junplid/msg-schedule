import "./styles.scss";
import { LoadComponent } from "../../components/load";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { propsAuthActions } from "../../reducers/auth.reducer";
import mainAPI from "../../providers/api.provider";
import { AxiosError } from "axios";

export default function PageChangePassword() {
  const [cookies, _setCookies, removeCookie] = useCookies(["auth"]);
  const dispatch: Dispatch<propsAuthActions> = useDispatch();
  const navigate = useNavigate();

  const [loadPage, setLoadPage] = useState<boolean>(false as boolean);
  const [loadSendCode, setLoadSendCode] = useState<boolean>(false as boolean);
  const [_loadConfirmCode, setLoadConfirmCode] = useState<boolean>(
    false as boolean
  );
  const [sendCode, setSendCode] = useState<boolean>(false as boolean);
  const [fieldWhatsApp, setFieldWhatsApp] = useState<string>("" as string);
  const [fieldCode, setFieldCode] = useState<string>("" as string);
  const [tokeChange, setTokenChange] = useState<string | null>(
    null as string | null
  );
  const [fieldNewPassword, setFieldNewPassword] = useState<string>(
    "" as string
  );
  const [loadChangePass, setLoadChangePass] = useState<boolean>(
    false as boolean
  );
  const [sucess, setSucess] = useState<boolean>(false as boolean);

  useEffect(() => {
    if (cookies.auth) {
      (async () => {
        try {
          const { data } = await mainAPI.get(
            `/v1/public/get/verify-token/${cookies.auth}`
          );
          dispatch({
            type: "LOGIN",
            payload: {
              token: cookies.auth,
              ...data.data,
            },
          });
          navigate("/panel");
        } catch (error) {
          dispatch({ type: "LOGOUT" });
          removeCookie("auth");
          setTimeout(() => setLoadPage(true), 1200);
        }
      })();
      return;
    }
    setTimeout(() => setLoadPage(true), 400);
  }, []);

  const onSendCode = useCallback(async () => {
    try {
      setLoadSendCode(true);
      await mainAPI.post(
        `/v1/public/create/send-code-whatsapp-change-password`,
        {
          whatsapp: fieldWhatsApp,
        }
      );
      setSendCode(true);
      setLoadSendCode(false);
    } catch (error) {
      setLoadSendCode(false);
      if (error instanceof AxiosError) {
        alert(error.response?.data?.body[0]?.message);
        return;
      }
    }
  }, [fieldWhatsApp]);

  const onConfirmCode = useCallback(async () => {
    try {
      setLoadConfirmCode(true);
      const { data } = await mainAPI.post(`/v1/public/create/confim-code`, {
        whatsapp: fieldWhatsApp,
        code: fieldCode,
      });
      setTokenChange(data.data);
      setSendCode(true);
      setLoadConfirmCode(false);
    } catch (error) {
      setTokenChange(null);
      setLoadConfirmCode(false);
      setFieldCode("");
      if (error instanceof AxiosError) {
        alert(
          error.response?.data.message ?? error.response?.data?.body[0]?.message
        );
        return;
      }
    }
  }, [fieldWhatsApp, fieldCode]);

  const onChangePass = useCallback(async () => {
    try {
      setLoadChangePass(true);
      await mainAPI.put(
        `/v1/user/update/change-field?password=${fieldNewPassword}`,
        undefined,
        {
          headers: {
            authorization: `BEARER ${tokeChange}`,
          },
        }
      );
      setSucess(true);
      setTimeout(() => {
        navigate("/");
        setSucess(false);
      }, 2000);
      setLoadChangePass(false);
    } catch (error) {
      setTokenChange(null);
      setLoadChangePass(false);
      setFieldCode("");
      if (error instanceof AxiosError) {
        alert(
          error.response?.data.message ?? error.response?.data?.body[0]?.message
        );
        return;
      }
    }
  }, [fieldNewPassword, tokeChange]);

  return (
    <div className="min-h-screen py-5 px-4 flex items-center justify-center">
      <div className="w-full flex justify-center fixed bottom-0 left-0">
        <div
          className={`bg-3 duration-200 ${
            sucess ? "" : "translate-y-16"
          } text-slate-100 p-4 inline-block text-lg`}
        >
          <span>Senha alterada com sucesso!</span>
        </div>
      </div>
      {!loadPage ? (
        <div className="p-4 bg-3 flex items-center flex-col gap-3">
          <span className="text-slate-50 font-medium text-lg">Aguarde</span>
          <LoadComponent />
        </div>
      ) : (
        <div className="flex bg-2 shadow-md">
          {!tokeChange && (
            <div className="bg-5 max-w-xs p-10 py-8 flex flex-col justify-between gap-4 min-h-full">
              <div>
                <h1 className="font-medium text-2xl text-slate-700">
                  {sendCode ? "Código enviado" : "Recuperar senha"}
                </h1>
                <p className="text-base text-slate-800 leading-snug">
                  {sendCode
                    ? "O código foi enviado para o seu WhatsApp. Por favor, insira-o abaixo."
                    : "Enviaremos o código de confirmação para a troca da sua senha."}
                </p>
              </div>
              <form
                className="flex flex-col gap-7 items-baseline justify-between flex-1"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!sendCode) return await onSendCode();
                  if (sendCode) return await onConfirmCode();
                }}
              >
                <div className="grid gap-y-3">
                  <label className="flex flex-col gap-y-2">
                    {!sendCode && (
                      <span className="text-base font-medium text-slate-800">
                        WhatsApp
                      </span>
                    )}
                    <div
                      style={{ maxWidth: 280 }}
                      className="gap-y-1 flex flex-col"
                    >
                      <input
                        placeholder={!sendCode ? "00000000000" : "Código"}
                        className="py-3 px-4 shadow-sm w-full outline-none"
                        type="text"
                        name="email"
                        value={!sendCode ? fieldWhatsApp : fieldCode}
                        onChange={(e) => {
                          if (!sendCode)
                            return setFieldWhatsApp(e.target.value);
                          if (sendCode) return setFieldCode(e.target.value);
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </label>
                </div>
                {!sendCode && (
                  <button
                    disabled={loadSendCode}
                    type="submit"
                    className="w-full flex justify-center items-center bg-3 text-slate-100 py-0 h-12 font-semibold hover:bg-2 duration-200"
                  >
                    {loadSendCode ? <LoadComponent /> : "Enviar código"}
                  </button>
                )}
                {sendCode && (
                  <button
                    disabled={loadChangePass}
                    type="submit"
                    className="w-full flex justify-center items-center bg-3 text-slate-100 py-0 h-12 font-semibold hover:bg-2 duration-200"
                  >
                    {loadChangePass ? <LoadComponent /> : "Confirmar código"}
                  </button>
                )}
              </form>
              <div>
                <p className="text-slate-700 text-base text-center">
                  Lembrou a senha?{" "}
                  <Link className="text-cyan-800 font-medium" to={"/"}>
                    Login
                  </Link>
                </p>
              </div>
            </div>
          )}
          {tokeChange && (
            <div className="bg-5 max-w-xs p-10 py-8 flex flex-col justify-between gap-4 min-h-full">
              <div>
                <h1 className="font-medium text-2xl text-slate-700">
                  Nova senha
                </h1>
                <p className="text-base text-slate-800 leading-snug">
                  Digite abaixo a sua nova senha
                </p>
              </div>
              <form
                className="flex flex-col gap-7 items-baseline justify-between flex-1"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await onChangePass();
                }}
              >
                <div className="grid gap-y-3">
                  <label className="flex flex-col gap-y-2">
                    <div
                      style={{ maxWidth: 280 }}
                      className="gap-y-1 flex flex-col"
                    >
                      <input
                        placeholder="Nova senha"
                        className="py-3 px-4 shadow-sm w-full outline-none"
                        type="password"
                        name="password"
                        value={fieldNewPassword}
                        onChange={(e) => {
                          if (sendCode)
                            return setFieldNewPassword(e.target.value);
                        }}
                        autoComplete="off"
                      />
                    </div>
                  </label>
                </div>
                <button
                  disabled={loadChangePass}
                  type="submit"
                  className="w-full flex justify-center items-center bg-3 text-slate-100 py-0 h-12 font-semibold hover:bg-2 duration-200"
                >
                  {loadChangePass ? <LoadComponent /> : "Trocar senha"}
                </button>
              </form>
              <div>
                <p className="text-slate-700 text-base text-center">
                  Lembrou a senha?{" "}
                  <Link className="text-cyan-800 font-medium" to={"/"}>
                    Login
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
