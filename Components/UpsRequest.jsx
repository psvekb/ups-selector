import React, { useContext, useEffect, useState } from "react";
import { Button, Typography, Form, InputNumber, Card } from "antd";
import { ArrowRightOutlined, CalculatorOutlined } from "@ant-design/icons";

import LoadingScreen from "./LoadingScreeen";
import { useRouter } from "next/router";
import Link from "next/link";

// const { Paragraph, Text } = Typography;

const UpsRequest = () => {
  console.log("UpsRequest");
  const [requestState, setRequestState] = useState({
    upsSystemFullPower: 500,
    batteryRuntime: 5,
    // phase11: true,
    // phase31: true,
    // phase33: true,
    // outletSchuko: true,
    // outletIECC13: true,
    // outletHW: true,
    // rackMount: false,
    // snmpCard: false,
  });
  // const [finish, setFinish] = useState(false);

  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
    setTimeout(() => setLoading(false), 300);
  }, []);

  const updateInput = (value, name) => {
    // console.log("updateInput - value, name", value, name);
    setRequestState({
      ...requestState,
      [name]: value,
    });
  };

  function onFinishClick() {
    console.log("finish");
    // setFinish(true);
    const href = {
      pathname: "/result",
      query: {
        power: requestState.upsSystemFullPower,
        time: requestState.batteryRuntime,
      },
    };
    // router.push("/result");
    router.push(href);
  }

  return (
    <>
      {!loading ? (
        <Card>
          <Typography.Title level={2}>Systeme Electric</Typography.Title>
          <Typography.Title level={3}>
            Выбор 1-фазных и 3-фазных ИБП по мощности нагрузки
          </Typography.Title>
          <Form.Item>
            <label>Задайте мощность нагрузки 0 - 80 000(Вт) </label>
            <InputNumber
              min={1}
              // status={requestState.upsSystemFullPower > maxSystemPowerInput && "error"}
              value={requestState.upsSystemFullPower}
              onChange={(e) => updateInput(e, "upsSystemFullPower")}
            />
            <br />
            <label name="batteryRuntime"> Задайте время работы от АКБ (мин) </label>
            <InputNumber
              min={1}
              max={1200}
              // defaultValue={5}
              value={requestState.batteryRuntime}
              onChange={(value) => updateInput(value, "batteryRuntime")}
            />
            <br />
            {/* <Button
              type="primary"
              onClick={onFinishClick}
              // disabled={requestState.upsSystemFullPower > maxSystemPowerInput}
            >
              <ArrowRightOutlined />
              Подобрать ИБП
            </Button> */}
            <Link
              href={{
                pathname: "/result",
                query: {
                  power: requestState.upsSystemFullPower,
                  time: requestState.batteryRuntime,
                },
              }}
            >
              <Button type="link">
                <ArrowRightOutlined />
                Подобрать ИБП
              </Button>
            </Link>
          </Form.Item>
        </Card>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default UpsRequest;
