import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { propsInitialState } from "../../reducers/auth.reducer";
import { io } from "socket.io-client";
import { LoadComponent } from "../../components/load";
import mainAPI from "../../providers/api.provider";

export default function PageMySectionWhatsApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null as string | null);
  const [loadGetQrCode, setLoadGetQrCode] = useState(false);
  const [stateSession, setStateSession] = useState<null | boolean>(null);

  const socket = useMemo(() => {
    return io("https://77ff-177-128-192-93.ngrok-free.app", {
      extraHeaders: {
        "ngrok-skip-browser-warning": "1",
      },
    });
  }, []);

  const auth = useSelector(
    (state: any): propsInitialState => state._root.entries[0][1]
  );

  const createSession = useCallback(() => {
    socket.emit("create-session", {
      key: String(auth.user?.id),
    });
    setLoadGetQrCode(true);
    setIsSessionOpen(true);
  }, [auth.user?.id]);

  const closeSession = useCallback(() => {
    socket.emit("close-session", {
      key: String(auth.user?.id),
    });
    setIsSessionOpen(false);
  }, [auth.user?.id]);

  const getStateSessionWhatsApp = useCallback(async () => {
    const { data } = await mainAPI.get("/v1/user/get/state-session-whatsapp");
    setStateSession(data.data);
  }, []);

  useEffect(() => {
    getStateSessionWhatsApp();
  }, []);

  useEffect(() => {
    try {
      (async () => {})();

      socket.on(String(auth.user?.id)!, (data) => {
        setQrCode(data);
        setLoadGetQrCode(false);
      });
      socket.on("leave", (room) => {
        if (room === String(auth.user?.id)) {
          setQrCode(null);
          setIsSessionOpen(false);
        }
      });
      socket.on("sucess-connetion", (data) => {
        getStateSessionWhatsApp();
        setLoadGetQrCode(false);
        setIsSessionConnected(data);
        setQrCode(null);
      });

      setIsConnected(true);
    } catch (error) {
      console.log(error);
    }
  }, []);

  return (
    <div>
      <h3 className="font-bold text-xl">Seção WhatsApp</h3>

      <div className="mt-6 flex flex-col gap-y-2 items-baseline">
        <span
          className={`block p-2 px-6 font-medium shadow-md ${
            stateSession === false
              ? "bg-red-300 text-red-800"
              : "bg-green-300 text-green-800"
          } text-lg`}
        >
          {stateSession === false ? "Desconectado" : "Conectado"}
        </span>

        {qrCode && <img src={qrCode} alt="QRCode" />}

        {isConnected && stateSession === false && (
          <>
            <button
              onClick={() => (isSessionOpen ? closeSession() : createSession())}
              className="text-sky-700 bg-6 shadow-sm font-medium mt-3 p-2 px-5 border hover:bg-slate-50 duration-200"
            >
              {!loadGetQrCode ? (
                isSessionOpen && isSessionConnected ? (
                  "Desligar"
                ) : (
                  "Criar conexão"
                )
              ) : (
                <LoadComponent />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
