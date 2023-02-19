import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Form,
  Radio,
  InputNumber,
  Input,
  Space,
  Card,
  Row,
  Col,
  Table,
  // Text,
} from "antd";
import { ArrowRightOutlined, CalculatorOutlined } from "@ant-design/icons";
import { runtimeConstArr, runtimeConstObj } from "../utils/upsselector/runtimeConst";

const { Text } = Typography;

const UpsSelector = () => {
  console.log("UpsSelector");
  const [requestState, setRequestState] = useState({
    upsSystemFullPower: 500,
    batteryRuntime: 5,
  });
  const [finish, setFinish] = useState(false);
  const [selectData, setSelectData] = useState([]);

  const updateInput = (value, name) => {
    console.log("updateInput - value, names", value, name);

    setRequestState({
      ...requestState,
      [name]: value,
    });
    setFinish(false);
  };

  function calculateRunTime({ power, runtime, fullUpsPower, kx, px }) {
    const load = power / fullUpsPower;
    const time = (kx * Math.pow(load, px)).toFixed(2);
    // console.log("time", time);
    return power <= fullUpsPower ? time : 0;
  }

  function onFinishClick() {
    console.log("finish");
    // console.log("runtimeConstArr", runtimeConstArr);
    // console.log("runtimeConstObj", runtimeConstObj);
    const selectedData = [];
    let lastUps = "";
    for (let i = 1; i < runtimeConstArr.length - 1; i++) {
      const conf = runtimeConstObj[runtimeConstArr[i][0]];
      // console.log('time', )
      const time = calculateRunTime({
        power: requestState.upsSystemFullPower,
        runtime: requestState.batteryRuntime,
        fullUpsPower: conf.full_ups_power,
        kx: conf.kx,
        px: conf.px,
      });

      if (time >= requestState.batteryRuntime && lastUps !== conf.ups) {
        const displayConfig =
          conf.battery_quantity > 0
            ? `${conf.ups} + ${conf.battery_quantity} x ${conf.battery}`
            : `${conf.ups}`;
        selectedData.push({ key: conf.conig, config: displayConfig, time });
        lastUps = conf.ups;
      }
      // console.log("conf-time", conf.config, time);
    }
    setSelectData(selectedData);
    setFinish(true);
  }

  const selectDataColumns = [
    {
      title: "Конфигурация",
      key: "config",
      dataIndex: "config",
      width: "25%",
    },
    {
      title: "Расчетное время(мин)",
      key: "time",
      dataIndex: "time",
      width: "25%",
    },
  ];

  return (
    <>
      <Card>
        <Typography.Title level={3}>Выбор ИБП </Typography.Title>
        <Form.Item>
          <label>Задайте мощность нагрузки (Вт) </label>
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
          <Button
            type="primary"
            onClick={onFinishClick}
            // disabled={requestState.upsSystemFullPower > maxSystemPowerInput}
          >
            <ArrowRightOutlined />
            Подобрать ИБП
          </Button>
        </Form.Item>
      </Card>
      {finish && (
        <Card>
          <>
            <Typography.Title level={3}>Предлагаемые конфгурации</Typography.Title>
            <Table
              dataSource={selectData}
              columns={selectDataColumns}
              size="small"
              scroll={{ y: 300 }}
              pagination={false}
            />
          </>
        </Card>
      )}
    </>
  );
};

export default UpsSelector;
