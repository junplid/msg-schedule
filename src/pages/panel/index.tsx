import { useEffect, useState } from "react";
import { PiUsersBold, PiUsersThreeBold } from "react-icons/pi";
import mainAPI from "../../providers/api.provider";
import { useSelector } from "react-redux";
import { propsInitialState } from "../../reducers/auth.reducer";
import { CiBoxes } from "react-icons/ci";
import { TbAlignBoxLeftMiddle, TbMessages } from "react-icons/tb";
import { LiaUsersSolid } from "react-icons/lia";
import { BiMessageSquareDots } from "react-icons/bi";
import { Bar } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import Skeleton from "react-loading-skeleton";
import { AiOutlineWhatsApp } from "react-icons/ai";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface resultFinanceSubs_I {
  id: number;
  payday: Date;
  price: string;
}

interface data_I {
  customerRoot?: number;
  subsRoot?: number;
  plansRoot?: number;
  productsRoot?: number;
  messagesRoot?: number;
  messagesUser: number;
  customerUser: number;
  productsUser: number;
  plansUser: number;
  statisticsCustomerRoot?: {
    data: number[];
    labels: string[];
  };
  statisticsSubscribersRoot?: {
    data: number[];
    labels: string[];
  };
  statisticsCustomerUser: {
    data: number[];
    labels: string[];
  };
  statisticsSubsFinanceRoot?: {
    data: number[];
    labels: string[];
  };
  statisticsCustomersFinanceUser: {
    data: number[];
    labels: string[];
  };
  amountSessionWhatsAppOnlineRoot?: number;
}

const labels2: { [x: number]: string } = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};
export default function PagePanel() {
  const [data, setData] = useState<data_I>({} as data_I);
  const auth = useSelector(
    (state: any): propsInitialState => state._root.entries[0][1]
  );

  useEffect(() => {
    (async () => {
      const data: data_I = {} as data_I;
      if (auth.user?.type === "root") {
        const [
          { data: subcribersRoot },
          { data: productsRoot },
          { data: plansRoot },
          { data: messagesRoot },
          { data: customersRoot },
          { data: statisticsCustomersRoot },
          { data: statisticsSubscribersRoot },
          { data: statisticsFinanceSubsRoot },
          { data: AmountSessionWhatsAppRoot },
        ] = await Promise.all([
          mainAPI.get("/v1/user/get/count-subcribers-root"),
          mainAPI.get("/v1/user/get/count-products-root"),
          mainAPI.get("/v1/user/get/count-plans-root"),
          mainAPI.get("/v1/user/get/count-messages-root"),
          mainAPI.get("/v1/user/get/count-customers-root"),
          mainAPI.get("/v1/user/get/statistics-count-customers-root"),
          mainAPI.get("/v1/user/get/statistics-count-subscribers-root"),
          mainAPI.get("/v1/user/get/statistics-finance-subscribers-root"),
          mainAPI.get("/v1/user/get/amount-session-whatsapp"),
        ]);
        const labelsCust: string[] = [];
        const countsCust: { [x: string]: number } = {};

        const labelsSubs: string[] = [];
        const countsSubs: { [x: string]: number } = {};

        const labelsFinance: string[] = [];
        const countsFinance: { [x: string]: number } = {};

        statisticsSubscribersRoot.data.forEach((obj: any) => {
          const da = String(Object.values(obj)[1])
            .match(/[0-9]{4}\-[0-9]{2}/)![0]
            .split("-");
          const key = labels2[Number(da[1])] + da[0].slice(2, 4);
          Object.assign(countsSubs, {
            [key]: countsSubs[key] !== undefined ? countsSubs[key] + 1 : 1,
          });
          if (!labelsSubs.includes(key)) {
            labelsSubs.push(key);
          }
        });

        statisticsCustomersRoot.data.forEach((obj: any) => {
          const da = String(Object.values(obj)[1])
            .match(/[0-9]{4}\-[0-9]{2}/)![0]
            .split("-");
          const key = labels2[Number(da[1])] + da[0].slice(2, 4);
          Object.assign(countsCust, {
            [key]: countsCust[key] !== undefined ? countsCust[key] + 1 : 1,
          });
          if (!labelsCust.includes(key)) {
            labelsCust.push(key);
          }
        });

        statisticsFinanceSubsRoot.data.forEach((obj: resultFinanceSubs_I) => {
          const da = String(Object.values(obj)[1])
            .match(/[0-9]{4}\-[0-9]{2}/)![0]
            .split("-");
          const key = labels2[Number(da[1])] + da[0].slice(2, 4);
          if (!labelsFinance.includes(key)) labelsFinance.push(key);
          Object.assign(countsFinance, {
            [key]:
              countsFinance[key] !== undefined
                ? countsFinance[key] + Number(obj.price)
                : Number(obj.price),
          });
        });

        const dataC = labelsCust.map((l) => countsCust[l]);
        const dataS = labelsSubs.map((l) => countsSubs[l]);
        const dataFS = labelsFinance.map((l) => countsFinance[l]);

        Object.assign(data, {
          amountSessionWhatsAppOnlineRoot: AmountSessionWhatsAppRoot.data,
          customerRoot: customersRoot.data,
          messagesRoot: messagesRoot.data,
          plansRoot: plansRoot.data,
          productsRoot: productsRoot.data,
          subsRoot: subcribersRoot.data,
          statisticsCustomerRoot: {
            data: dataC.slice(-6),
            labels: labelsCust.slice(-6),
          },
          statisticsSubscribersRoot: {
            data: dataS.slice(-6),
            labels: labelsSubs.slice(-6),
          },
          statisticsSubsFinanceRoot: {
            data: dataFS.slice(-6),
            labels: labelsFinance.slice(-6),
          },
        } as data_I);
      }
      const [
        { data: customersUser },
        { data: messagesUser },
        { data: statisticsCustomersUser },
        { data: productsUser },
        { data: plansUser },
        { data: statisticsFinanceCustomersUser },
      ] = await Promise.all([
        mainAPI.get("/v1/user/get/count-customers-user"),
        mainAPI.get("/v1/user/get/count-messages-user"),
        mainAPI.get("/v1/user/get/statistics-count-customers-user"),
        mainAPI.get("/v1/user/get/count-products-user"),
        mainAPI.get("/v1/user/get/count-plans-user"),
        mainAPI.get("/v1/user/get/statistics-finance-customers-user"),
      ]);

      const labels: string[] = [];
      const counts: { [x: string]: number } = {};

      const labelsFinance: string[] = [];
      const countsFinance: { [x: string]: number } = {};

      statisticsCustomersUser.data.forEach((obj: any) => {
        const da = String(Object.values(obj)[1])
          .match(/[0-9]{4}\-[0-9]{2}/)![0]
          .split("-");
        const key = labels2[Number(da[1])] + da[0].slice(2, 4);
        Object.assign(counts, {
          [key]: counts[key] !== undefined ? counts[key] + 1 : 1,
        });
        if (!labels.includes(key)) {
          labels.push(key);
        }
      });

      statisticsFinanceCustomersUser.data.forEach(
        (obj: resultFinanceSubs_I) => {
          const da = String(Object.values(obj)[1])
            .match(/[0-9]{4}\-[0-9]{2}/)![0]
            .split("-");
          const key = labels2[Number(da[1])] + da[0].slice(2, 4);
          if (!labelsFinance.includes(key)) labelsFinance.push(key);
          Object.assign(countsFinance, {
            [key]:
              countsFinance[key] !== undefined
                ? countsFinance[key] + Number(obj.price)
                : Number(obj.price),
          });
        }
      );

      const dataf = labels.map((l) => counts[l]);
      const dataFS = labelsFinance.map((l) => countsFinance[l]);

      setData({
        ...data,
        customerUser: customersUser.data,
        messagesUser: messagesUser.data,
        productsUser: productsUser.data,
        plansUser: plansUser.data,
        statisticsCustomerUser: {
          data: dataf.slice(-6),
          labels: labels.slice(-6),
        },
        statisticsCustomersFinanceUser: {
          data: dataFS.slice(-6),
          labels: labelsFinance.slice(-6),
        },
      });
    })();
  }, []);

  return (
    <div className="flex flex-col gap-y-6">
      {auth.user?.type === "root" && (
        <div>
          <h3 className="font-bold mb-6 text-xl">Dados root</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(370px,1fr))] gap-5 w-full h-full">
            {data?.amountSessionWhatsAppOnlineRoot !== undefined ? (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <AiOutlineWhatsApp size={48} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium">Sessões WhatsApp</h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.amountSessionWhatsAppOnlineRoot}
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={157}
              />
            )}
            {data?.subsRoot !== undefined ? (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <LiaUsersSolid size={50} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium">Assinantes</h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.subsRoot}
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={157}
              />
            )}
            {data?.customerRoot !== undefined ? (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <PiUsersThreeBold size={50} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium">Clientes</h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.customerRoot}
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={157}
              />
            )}
            {data?.productsRoot !== undefined ? (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <CiBoxes size={50} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium">
                    Produtos/Serviços
                  </h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.productsRoot}
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={157}
              />
            )}
            {data?.plansRoot !== undefined ? (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <TbAlignBoxLeftMiddle size={50} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium">Planos</h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.plansRoot}
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={157}
              />
            )}
            {data?.messagesRoot !== undefined ? (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <TbMessages size={50} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium">Mensagens</h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.messagesRoot}
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={157}
              />
            )}
          </div>
          <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(370px,1fr))] gap-5 w-full h-full">
            {data.statisticsSubscribersRoot?.data ? (
              <article className="flex flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-2 w-full shadow-md">
                <Bar
                  options={{
                    responsive: true,
                    animation: false,
                    plugins: {
                      legend: {
                        display: false,
                        position: "top" as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }}
                  data={{
                    labels: data.statisticsSubscribersRoot.labels,
                    datasets: [
                      {
                        data: data.statisticsSubscribersRoot.data,
                        backgroundColor: "#003496",
                      },
                    ],
                  }}
                />
                <span className="text-sky-800 font-medium text-xl">
                  Assinantes nos últimos 6 meses
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={224}
              />
            )}
            {data.statisticsCustomerRoot?.data ? (
              <article className="flex flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-2 w-full shadow-md">
                <Bar
                  options={{
                    responsive: true,
                    animation: false,
                    plugins: {
                      legend: {
                        display: false,
                        position: "top" as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }}
                  data={{
                    labels: data.statisticsCustomerRoot.labels,
                    datasets: [
                      {
                        data: data.statisticsCustomerRoot.data,
                        backgroundColor: "#003496",
                      },
                    ],
                  }}
                />
                <span className="text-sky-800 font-medium text-xl">
                  Total clientes nos últimos 6 meses
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={224}
              />
            )}
            {data.statisticsSubsFinanceRoot?.data ? (
              <article className="flex flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-2 w-full shadow-md">
                <Bar
                  options={{
                    responsive: true,
                    animation: false,
                    plugins: {
                      legend: {
                        display: false,
                        position: "top" as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }}
                  data={{
                    labels: data.statisticsSubsFinanceRoot.labels,
                    datasets: [
                      {
                        data: data.statisticsSubsFinanceRoot.data,
                        backgroundColor: "#003496",
                      },
                    ],
                  }}
                />
                <span className="text-sky-800 font-medium text-base">
                  Receita nos últimos 6 meses com assinantes
                </span>
              </article>
            ) : (
              <Skeleton
                borderRadius={0}
                baseColor="#d4d7dc"
                highlightColor="#f4f8ff"
                width={"100%"}
                height={224}
              />
            )}
          </div>
        </div>
      )}
      <div>
        <h3 className="font-bold mb-6 text-xl">Dashboard</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(370px,1fr))] gap-5 w-full h-full">
          {data?.customerUser !== undefined ? (
            <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
              <div className="flex flex-col items-center">
                <PiUsersBold size={45} className="text-sky-800" />
                <h1 className="text-sky-800 font-medium">Clientes</h1>
              </div>
              <span className="text-sky-800 font-medium text-2xl">
                {data.customerUser}
              </span>
            </article>
          ) : (
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={157}
            />
          )}
          {data?.messagesUser !== undefined ? (
            <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
              <div className="flex flex-col items-center">
                <BiMessageSquareDots size={50} className="text-sky-800" />
                <h1 className="text-sky-800 font-medium">Mensagens</h1>
              </div>
              <span className="text-sky-800 font-medium text-2xl">
                {data.messagesUser}
              </span>
            </article>
          ) : (
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={157}
            />
          )}
          {data?.productsUser !== undefined ? (
            <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
              <div className="flex flex-col items-center">
                <CiBoxes size={50} className="text-sky-800" />
                <h1 className="text-sky-800 font-medium">Produtos</h1>
              </div>
              <span className="text-sky-800 font-medium text-2xl">
                {data.productsUser}
              </span>
            </article>
          ) : (
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={157}
            />
          )}
          {data?.plansUser !== undefined ? (
            <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
              <div className="flex flex-col items-center">
                <TbAlignBoxLeftMiddle size={50} className="text-sky-800" />
                <h1 className="text-sky-800 font-medium">Planos</h1>
              </div>
              <span className="text-sky-800 font-medium text-2xl">
                {data.plansUser}
              </span>
            </article>
          ) : (
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={157}
            />
          )}
          {/* {data?.messagesUser !== undefined && (
              <article className="flex flex-grow-1 flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-6 w-full shadow-md">
                <div className="flex flex-col items-center">
                  <BiMessageSquareDots size={50} className="text-sky-800" />
                  <h1 className="text-sky-800 font-medium"> produtos</h1>
                </div>
                <span className="text-sky-800 font-medium text-2xl">
                  {data.messagesUser}
                </span>
              </article>
            )} */}
        </div>
        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(370px,1fr))] gap-5 w-full h-full">
          {data.statisticsCustomerUser?.data ? (
            <article className="flex flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-2 w-full shadow-md">
              <Bar
                options={{
                  responsive: true,
                  animation: false,
                  plugins: {
                    legend: {
                      display: false,
                      position: "top" as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
                data={{
                  labels: data.statisticsCustomerUser.labels,
                  datasets: [
                    {
                      data: data.statisticsCustomerUser.data,
                      backgroundColor: "#003496",
                    },
                  ],
                }}
              />
              <span className="text-sky-800 font-medium text-xl">
                clientes nos últimos 6 meses
              </span>
            </article>
          ) : (
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={224}
            />
          )}
          {data.statisticsCustomersFinanceUser?.data ? (
            <article className="flex flex-1 gap-y-1 shadow-slate-200/40 justify-center flex-col items-center bg-white p-2 w-full shadow-md">
              <Bar
                options={{
                  responsive: true,
                  animation: false,
                  plugins: {
                    legend: {
                      display: false,
                      position: "top" as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
                data={{
                  labels: data.statisticsCustomersFinanceUser.labels,
                  datasets: [
                    {
                      data: data.statisticsCustomersFinanceUser.data,
                      backgroundColor: "#003496",
                    },
                  ],
                }}
              />
              <span className="text-sky-800 font-medium text-xl">
                Receita nos últimos 6 meses
              </span>
            </article>
          ) : (
            <Skeleton
              borderRadius={0}
              baseColor="#d4d7dc"
              highlightColor="#f4f8ff"
              width={"100%"}
              height={224}
            />
          )}
        </div>
      </div>
    </div>
  );
}
