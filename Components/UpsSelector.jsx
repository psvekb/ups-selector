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
  Collapse,
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
    rackMount: false,
    snmpCard: false,
  });
  const [finish, setFinish] = useState(false);
  const [selectData, setSelectData] = useState([]);
  const [sort, setSort] = useState("price");

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
        const rackOk =
          (requestState.rackMount == false && configRow.mount === "tower") ||
          configRow.mount === "convertible" ||
          (requestState.rackMount == true && configRow.mount === "rack");
        // const snmpPreInstalledOk =
        //   (requestState.snmpCard && configRow.card_snmp_installed === "1") ||
        //   (!requestState.snmpCard && configRow.card_snmp_installed === "0");

        if (
          time >= requestState.batteryRuntime &&
          lastUps !== configRow.ups &&
          phaseOk &&
          outletOk &&
          rackOk
          // snmpPreInstalledOk
        ) {
          // console.log("configRow", configRow);
          const railKitPrice =
            configRow.rail_kit1_q > 0 && requestState.rackMount
              ? +configRow.rail_kit1_q * +tariffConstObj[configRow.rail_kit1]?.price
              : 0 + configRow.rail_kit2_q > 0 && requestState.rackMount
              ? +configRow.rail_kit2_q * +tariffConstObj[configRow.rail_kit2]?.price
              : 0;
          const configSource = [
            {
              partNumber: (
                <Link href={configRow.href} target="_blank">
                  <strong>{configRow.ups}</strong>{" "}
                </Link>
              ),
              description: tariffConstObj[configRow.ups]?.description,
              quantity: 1,
            },
          ];
          if (configRow.battery_quantity > 0) {
            configSource.push({
              partNumber: configRow.battery,
              description: tariffConstObj[configRow.battery]?.description,
              quantity: configRow.battery_quantity,
            });
          }
          if (requestState.rackMount) {
            let railKit1_q = +configRow.rail_kit1_q;
            let railKit2_q = +configRow.rail_kit2_q;
            if (configRow.rail_kit1 === configRow.rail_kit2) {
              railKit1_q += railKit2_q;
              railKit2_q = 0;
            }
            if (railKit1_q > 0) {
              configSource.push({
                partNumber: configRow.rail_kit1,
                description: tariffConstObj[configRow.rail_kit1]?.description,
                quantity: railKit1_q,
              });
            }
            if (railKit2_q > 0) {
              configSource.push({
                partNumber: configRow.rail_kit2,
                description: tariffConstObj[configRow.rail_kit2]?.description,
                quantity: railKit2_q,
              });
            }
          }
          selectedData.push({
            key: configRow.config,
            config: configRow.config,
            configSource,
            time,
            price:
              configRow.battery_quantity > 0
                ? +tariffConstObj[configRow.ups]?.price +
                  +configRow.battery_quantity *
                    +tariffConstObj[configRow.battery]?.price +
                  railKitPrice
                : +tariffConstObj[configRow.ups]?.price + railKitPrice,
            href: configRow.href,
            powerReserve: Math.round(
              (1 - requestState.upsSystemFullPower / configRow.full_ups_power) * 100
            ),
          });

          lastUps = configRow.ups;
        }
      }
      // console.log("configRow-selectedData", selectedData);
      selectedData.sort((a, b) => a[sort] - b[sort]);
      // console.log("configRow-selectedData", selectedData);
      return selectedData;
      // setSelectData(selectedData);
    }
    setSelectData(getSelectTable());
  }, [finish, requestState, sort]);

  function onFinishClick() {
    console.log("finish");
    setFinish(true);
  }

  const headerConfigSource = [
    {
      partNumber: "Артикул",
      description: "Описание",
      quantity: "Кол-во",
    },
  ];
  const selectConfigColumns = [
    {
      title: "Артикул",
      key: "partNumber",
      dataIndex: "partNumber",
      width: "7%",
    },
    {
      title: "Кол-во",
      key: "quantity",
      dataIndex: "quantity",
      width: "3%",
    },
    {
      title: "Описание",
      key: "description",
      dataIndex: "description",
      width: "50%",
    },
  ];

  const selectDataColumns = [
    {
      title: (
        <Table
          dataSource={headerConfigSource}
          columns={selectConfigColumns}
          showHeader={false}
          pagination={false}
        />
      ),
      // title: "Конфигурация",
      key: "config",
      dataIndex: "config",
      width: "50%",
      render: (text, record, index) => (
        <div style={{ border: "solid", borderColor: "lightgray" }}>
          <Text>
            Конфигурация для мощности {requestState.upsSystemFullPower} Вт,{" "}
            {requestState.batteryRuntime} мин, тип установки{" "}
            <strong>{requestState.rackMount ? "стойка 19``" : "башня"}</strong>. Расчетное
            время автономии <strong>{selectData[index].time} мин</strong> , резерв по
            мощности <strong>{selectData[index].powerReserve}%</strong>
          </Text>
          <Table
            dataSource={selectData[index].configSource}
            columns={selectConfigColumns}
            showHeader={false}
            pagination={false}
          />
        </div>
      ),
    },
    {
      title: "Цена Тариф, руб (с НДС)",
      key: "price",
      dataIndex: "price",
      width: "5%",
      align: "right",
      render: (text, record, index) => <>{strUSD(text)}</>,
    },
  ];

  return (
    <>
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
            {/* <Typography.Title level={3}>Опции </Typography.Title> */}
            <Collapse bordered={false} defaultActiveKey={["1"]}>
              <Collapse.Panel header={"Опции выбора"}>
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
                <br />
                <Text>Установка в стойку 19`` </Text>
                <Checkbox
                  checked={requestState.rackMount}
                  onChange={(e) => updateInput(e.target.checked, "rackMount")}
                >
                  {requestState.rackMount ? "да" : "нет"}
                </Checkbox>
                {/* <br />
            <Text>Карта управления SNMP добавить </Text>
            <Checkbox
            checked={requestState.snmpCard}
            onChange={(e) => updateInput(e.target.checked, "snmpCard")}
            >
            {requestState.snmpCard ? "да" : "нет"}
          </Checkbox> */}
                <br />
                <Text>Сортировать </Text>
                <Radio.Group value={sort} onChange={(e) => setSort(e.target.value)}>
                  <Radio value="price">По цене </Radio>
                  <Radio value="powerReserve">По резерву мощности </Radio>
                </Radio.Group>
              </Collapse.Panel>
            </Collapse>
          </>
        )}
        {finish && (
          <>
            <Typography.Title level={3}>
              Предлагаемые конфигурации ИБП и дополнительных батарей
            </Typography.Title>
            <Table
              dataSource={selectData}
              columns={selectDataColumns}
              size="small"
              scroll={{ y: 600 }}
              pagination={false}
            />
          </>
        )}
      </Card>
    </>
  );
};

export default UpsSelector;
