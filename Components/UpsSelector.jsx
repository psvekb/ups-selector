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
import { tariffConstObj } from "@/utils/upsselector/tariffConst";
import { strUSD } from "@/utils/appConsts";

const { Paragraph, Text, Link } = Typography;

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
    // setFinish(false);
    onFinishClick();
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
      const configRow = runtimeConstObj[runtimeConstArr[i][0]];
      // console.log('time', )
      const time = calculateRunTime({
        power: requestState.upsSystemFullPower,
        runtime: requestState.batteryRuntime,
        fullUpsPower: configRow.full_ups_power,
        kx: configRow.kx,
        px: configRow.px,
      });

      if (time >= requestState.batteryRuntime && lastUps !== configRow.ups) {
        // const displayConfig =
        //   configRow.battery_quantity > 0
        //     ? `1\t${configRow.ups}\t${tariffConstObj[configRow.ups]?.description}\n${
        //         configRow.battery_quantity
        //       }\t${configRow.battery}\t${tariffConstObj[configRow.battery]?.description}`
        //     : `1\t${configRow.ups}\t${tariffConstObj[configRow.ups]?.description}`;
        selectedData.push({
          key: configRow.config,
          // config: displayConfig,
          time,
          upsPartNumber: configRow.ups,
          upsDescription: tariffConstObj[configRow.ups]?.description,
          batteryPartNumber: configRow.battery,
          batteryDescription: tariffConstObj[configRow.battery]?.description,
          batteryQuantity: configRow.battery_quantity,
          tariff:
            +tariffConstObj[configRow.ups]?.price +
            +configRow.battery_quantity * +tariffConstObj[configRow.battery]?.price,
          href: configRow.href,
        });
        lastUps = configRow.ups;
      }
    }
    console.log("configRow-selectedData", selectedData);
    setSelectData(selectedData);
    setFinish(true);
  }

  const selectDataColumns = [
    {
      title: "Конфигурация",
      key: "config",
      dataIndex: "config",
      width: "50%",
      render: (text, record, index) => (
        <>
          <Link href={selectData[index].href} target="_blank">
            <strong>{selectData[index].upsPartNumber}</strong>{" "}
          </Link>
          <Text>{selectData[index].upsDescription}</Text>
          <br />
          {selectData[index].batteryQuantity > 0 && (
            <>
              <Text>
                {selectData[index].batteryQuantity}
                {"x "}
                <strong>{selectData[index].batteryPartNumber}</strong>{" "}
                {selectData[index].batteryDescription}
              </Text>
            </>
          )}
        </>
      ),
    },
    {
      title: "Расчетное время (мин)",
      key: "time",
      dataIndex: "time",
      width: "5%",
    },
    {
      title: "Цена Тариф, руб (с НДС)",
      key: "tariff",
      dataIndex: "tariff",
      width: "5%",
      render: (text, record, index) => <>{strUSD(text)}</>,
    },
  ];

  return (
    <>
      <Card>
        <Typography.Title level={3}>Выбор ИБП по мощности нагрузки</Typography.Title>
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
