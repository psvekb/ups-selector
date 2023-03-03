import React, { useContext, useEffect, useState } from "react";
import { Button, Typography, Form, InputNumber, Card, Radio } from "antd";
import { ArrowRightOutlined, CalculatorOutlined } from "@ant-design/icons";

import LoadingScreen from "./LoadingScreeen";
import { useRouter } from "next/router";
import Link from "next/link";

const { Paragraph, Text } = Typography;

const UpsRequest = () => {
  console.log("UpsRequest");
  const [requestState, setRequestState] = useState({
    upsSystemFullPower: 450,
    batteryRuntime: 0,
    measure: "W",
    pF: 1,
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
    console.log("finish");
    // setFinish(true);
    const href = {
      pathname: "/result",
      query: {
        power: requestState.upsSystemFullPower,
        time: requestState.batteryRuntime,
        measure: requestState.measure,
        pF: requestState.pF,
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
            <Text>Задайте мощность нагрузки 0 - 80 000 </Text>
            <InputNumber
              min={1}
              // status={requestState.upsSystemFullPower > maxSystemPowerInput && "error"}
              value={requestState.upsSystemFullPower}
              onChange={(e) => updateInput(e, "upsSystemFullPower")}
            />
            <Radio.Group
              onChange={(e) => updateInput(e.target.value, "measure")}
              value={requestState.measure}
            >
              <Radio value={"W"}>Вт</Radio>
              <Radio value={"VA"}>ВА</Radio>
              {/* <Radio value={"kVA"}>кВА</Radio> */}
            </Radio.Group>
            {requestState.measure !== "W" && (
              <>
                <br />
                <Text>выберите коэффициент мощности нагрузки</Text>
                <Radio.Group
                  onChange={(e) => updateInput(e.target.value, "pF")}
                  value={requestState.pF}
                >
                  <Radio value={1}>1.0</Radio>
                  <Radio value={0.9}>0.9</Radio>
                  <Radio value={0.8}>0.8</Radio>
                  <Radio value={0.7}>0.7</Radio>
                  <Radio value={0.6}>0.6</Radio>
                </Radio.Group>
              </>
            )}
            <br />
            <Text name="batteryRuntime"> Задайте время работы от АКБ (мин) </Text>
            <InputNumber
              min={0}
              max={1200}
              // step={0.2}
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
                  measure: requestState.measure,
                  pF: requestState.pF,
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
