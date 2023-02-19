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
  Checkbox,
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
    phase11: true,
    phase31: true,
    phase33: true,
    outletSchuko: true,
    outletIECC13: true,
    outletHW: true,
  });
  const [finish, setFinish] = useState(false);
  const [selectData, setSelectData] = useState([]);

  const updateInput = (value, name) => {
    console.log("updateInput - value, name", value, name);

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

  useEffect(() => {
    function getSelectTable() {
      const selectedData = [];
      let lastUps = "";
      for (let i = 1; i < runtimeConstArr.length - 1; i++) {
        const configRow = runtimeConstObj[runtimeConstArr[i][0]];
        // console.log("configRow", configRow);
        // console.log("requestState.phase11", requestState.phase11);
        // console.log("requestState.phase31", requestState.phase31);
        const time = calculateRunTime({
          power: requestState.upsSystemFullPower,
          runtime: requestState.batteryRuntime,
          fullUpsPower: configRow.full_ups_power,
          kx: configRow.kx,
          px: configRow.px,
        });

        const phaseOk =
          (requestState.phase11 && configRow.phase === "1-1") ||
          (requestState.phase31 && configRow.phase === "3-1") ||
          (requestState.phase33 && configRow.phase === "3-3");
        const outletOk =
          (requestState.outletSchuko && configRow.outlet === "schuko") ||
          (requestState.outletIECC13 && configRow.outlet === "iec") ||
          (requestState.outletHW && configRow.outlet === "hardwire");

        if (
          time >= requestState.batteryRuntime &&
          lastUps !== configRow.ups &&
          phaseOk &&
          outletOk
        ) {
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
              configRow.battery_quantity > 0
                ? +tariffConstObj[configRow.ups]?.price +
                  +configRow.battery_quantity * +tariffConstObj[configRow.battery]?.price
                : +tariffConstObj[configRow.ups]?.price,
            href: configRow.href,
          });
          lastUps = configRow.ups;
        }
      }
      // console.log("configRow-selectedData", selectedData);
      setSelectData(selectedData);
    }
    getSelectTable();
  }, [finish, requestState]);

  function onFinishClick() {
    console.log("finish");
    // console.log("runtimeConstArr", runtimeConstArr);
    // console.log("runtimeConstObj", runtimeConstObj);
    // const selectedData = [];
    // let lastUps = "";
    // for (let i = 1; i < runtimeConstArr.length - 1; i++) {
    //   const configRow = runtimeConstObj[runtimeConstArr[i][0]];
    //   // console.log("configRow", configRow);
    //   // console.log("requestState.phase11", requestState.phase11);
    //   // console.log("requestState.phase31", requestState.phase31);
    //   const time = calculateRunTime({
    //     power: requestState.upsSystemFullPower,
    //     runtime: requestState.batteryRuntime,
    //     fullUpsPower: configRow.full_ups_power,
    //     kx: configRow.kx,
    //     px: configRow.px,
    //   });

    //   const phaseOk =
    //     (requestState.phase11 && configRow.phase === "1-1") ||
    //     (requestState.phase31 && configRow.phase === "3-1");

    //   if (time >= requestState.batteryRuntime && lastUps !== configRow.ups && phaseOk) {
    //     selectedData.push({
    //       key: configRow.config,
    //       // config: displayConfig,
    //       time,
    //       upsPartNumber: configRow.ups,
    //       upsDescription: tariffConstObj[configRow.ups]?.description,
    //       batteryPartNumber: configRow.battery,
    //       batteryDescription: tariffConstObj[configRow.battery]?.description,
    //       batteryQuantity: configRow.battery_quantity,
    //       tariff:
    //         configRow.battery_quantity > 0
    //           ? +tariffConstObj[configRow.ups]?.price +
    //             +configRow.battery_quantity * +tariffConstObj[configRow.battery]?.price
    //           : +tariffConstObj[configRow.ups]?.price,
    //       href: configRow.href,
    //     });
    //     lastUps = configRow.ups;
    //   }
    // }
    // // console.log("configRow-selectedData", selectedData);
    // setSelectData(selectedData);
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
          {/* <Radio>Ds,thbnt </Radio> */}
        </Form.Item>
        {finish && (
          <>
            <Typography.Title level={3}>Опции </Typography.Title>
            <Text>Фазы вход-выход </Text>
            <Checkbox
              checked={requestState.phase11}
              onChange={(e) => updateInput(e.target.checked, "phase11")}
            >
              1-1
            </Checkbox>
            <Checkbox
              checked={requestState.phase31}
              onChange={(e) => updateInput(e.target.checked, "phase31")}
            >
              3-1
            </Checkbox>
            <Checkbox
              checked={requestState.phase33}
              onChange={(e) => updateInput(e.target.checked, "phase33")}
            >
              3-3
            </Checkbox>
            <br />
            <Text>Тип выходных розеток </Text>
            <Checkbox
              checked={requestState.outletSchuko}
              onChange={(e) => updateInput(e.target.checked, "outletSchuko")}
            >
              Schuko (Евро-розетки)
            </Checkbox>
            <Checkbox
              checked={requestState.outletIECC13}
              onChange={(e) => updateInput(e.target.checked, "outletIECC13")}
            >
              IEC C13/C19
            </Checkbox>
            <Checkbox
              checked={requestState.outletHW}
              onChange={(e) => updateInput(e.target.checked, "outletHW")}
            >
              Клеммный выход
            </Checkbox>
          </>
        )}
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
