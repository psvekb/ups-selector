import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Form,
  InputNumber,
  Card,
  Radio,
  Layout,
  Space,
  Table,
} from "antd";
import { ArrowRightOutlined, CalculatorOutlined } from "@ant-design/icons";
const { Header, Footer, Sider, Content } = Layout;

import LoadingScreen from "./LoadingScreeen";
import { useRouter } from "next/router";
import Link from "next/link";
import { getQueryVariable, log } from "@/utils/helper";
import UpsSelectForm from "./UpsSelectForm";
import { HeaderSysteme } from "./HeaderSysteme";
import { getSelectTable } from "@/utils/upsselector/upsCalc";
import { strUSD } from "@/utils/appConsts";
import { selectDataColumns } from "@/utils/upsselector/tableHeaders";

const { Paragraph, Text } = Typography;

const UpsRequestResult = () => {
  log("UpsRequestResult");
  // console.log("UpsRequest");
  // const [requestState, setRequestState] = useState({
  //   upsSystemFullPower: 450,
  //   batteryRuntime: 0,
  //   measure: "W",
  //   pF: 1,
  // });
  // const [finish, setFinish] = useState(false);

  const [loading, setLoading] = useState(true);
  const [finish, setFinish] = useState(false);
  const router = useRouter();

  const [requestState, setRequestState] = useState({
    upsSystemFullPower: +getQueryVariable(router.asPath, "power") || 450,
    batteryRuntime: +getQueryVariable(router.asPath, "time") || 0,
    measure: getQueryVariable(router.asPath, "measure") || "W",
    pF: +getQueryVariable(router.asPath, "pF") || 1,
    phase11: true,
    phase31: true,
    phase33: true,
    outletSchuko: true,
    outletIECC13: true,
    outletHW: true,
    rackMount: "any",
    snmpCard: false,
    snmpCardTempSensor: false,
  });
  const [selectData, setSelectData] = useState([]);
  const [sort, setSort] = useState("price");

  useEffect(() => {
    setLoading(false);
    // setTimeout(() => setLoading(false), 300);
    setSelectData(getSelectTable({ requestState, sort }));
  }, [requestState, sort, loading]);

  const updateInput = (value, name) => {
    log("updateInput - value, name", value, name);
    setRequestState({
      ...requestState,
      [name]: value,
    });
    if (name == "measure" && value !== "W") {
      setRequestState((state) => ({
        ...state,
        pF: 0.6,
      }));
    }
    if (name == "measure" && value === "W") {
      setRequestState((state) => ({
        ...state,
        pF: 1,
      }));
    }
  };

  function onFinishClick() {
    log("onFinishClick");
    setFinish(true);
  }

  return (
    <>
      {!loading ? (
        <>
          <HeaderSysteme />
          <Card>
            <Typography.Title level={4}>
              Подбор 1-фазных и 3-фазных ИБП по мощности нагрузки
            </Typography.Title>
            <UpsSelectForm
              requestState={requestState}
              updateInput={updateInput}
              sort={sort}
              setSort={setSort}
            />
            <br />
            {!finish && (
              <Button type="link" onClick={onFinishClick}>
                <ArrowRightOutlined />
                Подобрать ИБП
              </Button>
            )}
            {finish && (
              <>
                <Typography.Title level={3}>
                  Предлагаемые конфигурации ИБП и дополнительных батарей
                </Typography.Title>
                {selectData.length != 0 && (
                  <Table
                    dataSource={selectData}
                    columns={selectDataColumns({ requestState, selectData })}
                    size="small"
                    // scroll={{ y: 600 }}
                    pagination={false}
                  />
                )}
                {selectData.length == 0 && (
                  <Text>
                    Требуемая конфигурация не найдена, попробуйте уменьшить время,
                    мощность или изменить опции
                  </Text>
                )}
              </>
            )}
          </Card>
        </>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default UpsRequestResult;
