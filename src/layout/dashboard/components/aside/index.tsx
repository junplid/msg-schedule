import { useCollapse } from "react-collapsed";
import { RiAdminLine } from "react-icons/ri";
import { AiOutlineWhatsApp } from "react-icons/ai";
import { HiChevronDown } from "react-icons/hi";
import "./styles.scss";
import { IconType } from "react-icons";
import { Link, useLocation } from "react-router-dom";
import { MdOutlineDashboard, MdOutlinePeopleAlt } from "react-icons/md";
import { FiServer } from "react-icons/fi";

interface PropsCollapse_I {
  label: string;
  Icon: IconType;
  itens: {
    value: string;
    link: string;
  }[];
}

function CollapseItem(props: PropsCollapse_I) {
  const { pathname } = useLocation();
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({
    defaultExpanded: props.itens.some((e) => pathname === e.link),
  });

  return (
    <div className="w-full">
      <button
        {...getToggleProps()}
        className="flex items-center py-2 justify-between w-full"
      >
        <div
          className={`${
            props.itens.some((e) => pathname === e.link) ? "text-sky-700" : ""
          } flex items-center duration-200`}
        >
          <div className="w-6 items-center flex">
            <props.Icon className="icon-2" />
          </div>
          <span className="text-lg">{props.label}</span>
        </div>
        <div
          className={`icon-aside duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        >
          <HiChevronDown />
        </div>
      </button>
      <ul {...getCollapseProps()}>
        {props.itens.map((item) => (
          <li key={item.value} className="group">
            <Link
              to={item.link}
              className={`group-hover:text-sky-700 ${
                pathname === item.link ? "text-sky-700" : ""
              } gap-x-2 flex duration-200 w-full pl-2 py-1 items-center`}
            >
              <div
                className={`w-1 h-1 ${
                  pathname === item.link && "bg-7"
                } rounded-full`}
              />
              {item.value}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LayoutDashboardComponentAside() {
  const { pathname } = useLocation();

  return (
    <aside className="w-52 pt-11 pb-5 px-3 shadow-lg bg-6 h-screen overflow-y-auto overflow-x-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-700 text-center">
          MsgSchedule
        </h2>
      </div>
      <div className="flex flex-col">
        <Link
          to={"/panel"}
          className={`group-hover:text-sky-700 ${
            pathname === "/panel" ? "text-sky-700" : ""
          } flex duration-200 w-full py-1 items-center`}
        >
          <div className="w-6 items-center flex icon-4">
            <MdOutlineDashboard />
          </div>
          <span className="text-lg">Dashboard</span>
        </Link>
        <Link
          to={"/panel/products-plans"}
          className={`group-hover:text-sky-700 ${
            pathname === "/panel/products-plans" ? "text-sky-700" : ""
          } flex duration-200 w-full py-1 items-center`}
        >
          <div className="w-6 items-center flex icon-4">
            <FiServer />
          </div>
          <span className="text-lg">Produtos/Planos</span>
        </Link>
        <Link
          to={"/panel/customer"}
          className={`group-hover:text-sky-700 ${
            pathname === "/panel/customer" ? "text-sky-700" : ""
          } flex duration-200 w-full py-1 items-center`}
        >
          <div className="w-6 items-center flex icon-4">
            <MdOutlinePeopleAlt />
          </div>
          <span className="text-lg">Clientes</span>
        </Link>
        <CollapseItem
          Icon={AiOutlineWhatsApp}
          itens={[
            { link: "/panel/whatsapp/my-section", value: "Minha sessão" },
            { link: "/panel/whatsapp/message", value: "Mensagens" },
            { link: "/panel/whatsapp/shots", value: "Disparos" },
          ]}
          label="WhatsApp"
        />
        <CollapseItem
          Icon={RiAdminLine}
          itens={[{ link: "/panel/root/subscribers", value: "Assinantes" }]}
          label="Root"
        />
      </div>
    </aside>
  );
}
