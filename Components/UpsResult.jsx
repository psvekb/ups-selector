import React, { useContext, useEffect, useState } from "react";
import {
  Typography,
  Form,
  Radio,
  InputNumber,
  Card,
  Table,
  Checkbox,
  Collapse,
} from "antd";
import { runtimeConstArr, runtimeConstObj } from "../utils/upsselector/runtimeConst";
import { tariffConstObj } from "@/utils/upsselector/tariffConst";
import { strUSD } from "@/utils/appConsts";
import { useRouter } from "next/router";
import LoadingScreen from "./LoadingScreeen";
import Head from "next/head";
import { log } from "@/utils/helper";

const { Text, Link } = Typography;

function getQueryVariable(query, variable) {
  // var query = window.location.search.substring(1);
  var vars = query.slice(query.indexOf("?") + 1).split("&");
  // var vars = query.slice(query.indexOf("/") + 1).split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  // console.log("Query variable %s not found", variable);
}

const UpsResult = () => {
  // console.log("UpsResult");
  log("UpsResult");
  const router = useRouter();
  // console.log("UpsResult,router", router, "router.query", router.query);
  // console.log("UpsResult,router-asPath", router.asPath);
  // console.log("UpsResult,power", getQueryVariable("power"));
  // console.log("UpsResult,time", getQueryVariable("time"));

  const [loading, setLoading] = useState(true);
  // const [loadingQuery, setLoadingQuery] = useState(true);
  const [requestState, setRequestState] = useState({
    upsSystemFullPower: +getQueryVariable(router.asPath, "power"),
    batteryRuntime: +getQueryVariable(router.asPath, "time"),
    measure: getQueryVariable(router.asPath, "measure"),
    pF: +getQueryVariable(router.asPath, "pF"),
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

  function calculateRunTime({ power, fullUpsPowerW, kx, px }) {
    const load = power / fullUpsPowerW;
    const time = (kx * Math.pow(load, px)).toFixed(2);
    // console.log("time", time);
    return power <= fullUpsPowerW ? time : 0;
  }

  // console.log("requestState 1", requestState, loading, router.query);

  useEffect(() => {
    setLoading(false);
    // console.log(requestState);

    function getSelectTable() {
      const selectedData = [];
      let lastUps = "";
      for (let i = 1; i < runtimeConstArr.length - 1; i++) {
        const configRow = runtimeConstObj[runtimeConstArr[i][0]];
        // console.log("configRow", configRow);

        const time = calculateRunTime({
          power:
            requestState.measure === "W"
              ? requestState.upsSystemFullPower
              : requestState.upsSystemFullPower * requestState.pF,
          fullUpsPowerW: configRow.full_ups_power_w,
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
          (requestState.rackMount == "tower" && configRow.mount === "tower") ||
          requestState.rackMount == "any" ||
          configRow.mount === "convertible" ||
          (requestState.rackMount == "19" && configRow.mount === "rack");
        const snmpOk =
          configRow.card_snmp_installed === "1" ||
          (requestState.snmpCard && configRow.card_snmp_option !== "no") ||
          (!requestState.snmpCard && configRow.card_snmp_installed === "0");
        const powerOk =
          requestState.upsSystemFullPower * requestState.pF <=
            configRow.full_ups_power_w &&
          requestState.upsSystemFullPower <= configRow.full_ups_power_va;

        // console.log("configRow", configRow.config, configRow);
        if (
          time >= requestState.batteryRuntime &&
          lastUps !== configRow.ups &&
          phaseOk &&
          outletOk &&
          rackOk &&
          snmpOk &&
          powerOk
        ) {
          // console.log("configRow", configRow);
          const configSource = [
            {
              partNumber: (
                <Link href={configRow.href} target="_blank">
                  <strong>{configRow.ups}</strong>{" "}
                </Link>
              ),
              description: tariffConstObj[configRow.ups]?.description,
              quantity: 1,
              price: +tariffConstObj[configRow.ups]?.price,
              summary: +tariffConstObj[configRow.ups]?.price,
            },
          ];
          if (configRow.battery_quantity > 0) {
            configSource.push({
              partNumber: configRow.battery,
              description: tariffConstObj[configRow.battery]?.description,
              quantity: +configRow.battery_quantity,
              price: +tariffConstObj[configRow.battery]?.price,
              summary:
                +tariffConstObj[configRow.battery]?.price * configRow.battery_quantity,
            });
          }
          if (requestState.snmpCard && configRow.card_snmp_installed === "0") {
            configSource.push({
              partNumber: configRow.card_snmp_option,
              description: tariffConstObj[configRow.card_snmp_option]?.description,
              quantity: 1,
              price: +tariffConstObj[configRow.card_snmp_option]?.price,
              summary: +tariffConstObj[configRow.card_snmp_option]?.price,
            });
          }
          if (requestState.snmpCardTempSensor && requestState.snmpCard) {
            configSource.push({
              partNumber: configRow.card_snmp_temp_sensor,
              description: tariffConstObj[configRow.card_snmp_temp_sensor]?.description,
              quantity: 1,
              price: +tariffConstObj[configRow.card_snmp_temp_sensor]?.price,
              summary: +tariffConstObj[configRow.card_snmp_temp_sensor]?.price,
            });
          }
          if (requestState.rackMount === "19") {
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
                price: +tariffConstObj[configRow.rail_kit1]?.price,
                summary: +tariffConstObj[configRow.rail_kit1]?.price * railKit1_q,
              });
            }
            if (railKit2_q > 0) {
              configSource.push({
                partNumber: configRow.rail_kit2,
                description: tariffConstObj[configRow.rail_kit2]?.description,
                quantity: railKit2_q,
                price: +tariffConstObj[configRow.rail_kit2]?.price,
                summary: +tariffConstObj[configRow.rail_kit2]?.price * railKit2_q,
              });
            }
          }
          const price = configSource.reduce((sum, item) => (sum += item.summary), 0);
          selectedData.push({
            key: configRow.config,
            config: configRow.config,
            configSource,
            time,
            price,
            units: configRow.units,
            href: configRow.href,
            powerReserve: Math.round(
              (1 -
                (requestState.upsSystemFullPower / configRow.full_ups_power_w) *
                  requestState.pF) *
                100
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
  }, [requestState, sort, router.query, loading]);

  // function onFinishClick() {
  //   console.log("finish");
  //   setFinish(true);
  // }

  const headerConfigSource = [
    {
      partNumber: "??????????????",
      description: "????????????????",
      quantity: "??????-????",
    },
  ];
  const selectConfigColumns = [
    {
      title: "??????????????",
      key: "partNumber",
      dataIndex: "partNumber",
      width: 140,
    },
    {
      title: "??????-????",
      key: "quantity",
      dataIndex: "quantity",
      width: 10,
    },
    {
      title: "????????????????",
      key: "description",
      dataIndex: "description",
      // width: "50%",
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
      // title: "????????????????????????",
      key: "config",
      dataIndex: "config",
      // width: "50%",
      render: (text, record, index) => (
        <div style={{ border: "solid", borderColor: "lightgray" }}>
          <Text>
            ???????????????????????? ?????? ????????????????{" "}
            <strong>
              {" "}
              {requestState.upsSystemFullPower} {requestState.measure === "W" && "????"}
              {requestState.measure === "VA" &&
                "???? (pF=" +
                  requestState.pF +
                  ", " +
                  Math.round(requestState.upsSystemFullPower * requestState.pF) +
                  " ????)"}
              , {requestState.batteryRuntime} ??????
            </strong>
            ,{requestState.rackMount !== "any" && "?????? ?????????????????? "}
            <strong>
              {requestState.rackMount == "19" &&
                "???????????? 19`` (" + selectData[index].units + "U)"}
              {requestState.rackMount == "tower" && "??????????"}
            </strong>
            . ?????????????????? ?????????? ?????????????????? <strong>{selectData[index].time} ??????</strong> ,
            ???????????? ???? ???????????????? <strong>{selectData[index].powerReserve}%</strong>
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
      title: "???????? ??????????, ?????? (?? ??????)",
      key: "price",
      dataIndex: "price",
      width: 100,
      align: "right",
      render: (text, record, index) => <>{strUSD(text)}</>,
    },
  ];

  return (
    <>
      <Head>
        <title>Systeme UPS Selector</title>
        {/* <meta name="description" content="Generated by create next app" /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/systeme.ico" />
      </Head>
      {!loading ? (
        <Card>
          <Collapse bordered={false} defaultActiveKey={["1"]}>
            <Collapse.Panel header={"?????????? ????????????"}>
              <Text>???????????????? ???????????????? 0 - 80 000 </Text>
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
                <Radio value={"W"}>????</Radio>
                <Radio value={"VA"}>????</Radio>
                {/* <Radio value={"kVA"}>??????</Radio> */}
              </Radio.Group>
              {requestState.measure !== "W" && (
                <>
                  <br />
                  <Text>???????????????? ?????????????????????? ???????????????? ????????????????</Text>
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
              <Text name="batteryRuntime">?????????? ???????????? ???? ?????? (??????) </Text>
              <InputNumber
                min={0}
                max={1200}
                // step={0.02}
                value={requestState.batteryRuntime}
                onChange={(value) => updateInput(value, "batteryRuntime")}
              />
              <br />
              <Text>???????? ????????-?????????? </Text>
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
              <Text>?????? ???????????????? ?????????????? </Text>
              <Checkbox
                checked={requestState.outletSchuko}
                onChange={(e) => updateInput(e.target.checked, "outletSchuko")}
              >
                Schuko (????????-??????????????)
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
                ???????????????? ??????????
              </Checkbox>
              <br />
              <Text>?????????????????? ?? ???????????? 19`` </Text>
              <Radio.Group
                onChange={(e) => updateInput(e.target.value, "rackMount")}
                value={requestState.rackMount}
              >
                <Radio value={"any"}>??????????????</Radio>
                <Radio value={"tower"}>???????????? ??????????????????</Radio>
                <Radio value={"19"}>???????????? ?? ????????????</Radio>
              </Radio.Group>
              {/* <Checkbox
                checked={requestState.rackMount}
                onChange={(e) => updateInput(e.target.checked, "rackMount")}
              >
                {requestState.rackMount ? "????" : "??????"}
              </Checkbox> */}
              <br />
              <Text>?????????? ???????????????????? SNMP (????????????????) </Text>
              <Checkbox
                checked={requestState.snmpCard}
                onChange={(e) => updateInput(e.target.checked, "snmpCard")}
              >
                {requestState.snmpCard ? "????" : "??????"}
              </Checkbox>

              {/* {requestState.snmpCard && (
                <> */}
              <Text disabled={!requestState.snmpCard}>
                ???????????? ?????????????????????? ?? ?????????????????? (????????????????){" "}
              </Text>
              <Checkbox
                disabled={!requestState.snmpCard}
                checked={
                  requestState.snmpCardTempSensor && requestState.snmpCard !== false
                }
                onChange={(e) => updateInput(e.target.checked, "snmpCardTempSensor")}
              >
                {requestState.snmpCardTempSensor ? "????" : "??????"}
              </Checkbox>
              {/* </>
              )} */}
              <br />
              <Text>?????????????????????? </Text>
              <Radio.Group value={sort} onChange={(e) => setSort(e.target.value)}>
                <Radio value="price">???? ???????? </Radio>
                <Radio value="powerReserve">???? ?????????????? ???????????????? </Radio>
              </Radio.Group>
            </Collapse.Panel>
          </Collapse>

          <Typography.Title level={3}>
            ???????????????????????? ???????????????????????? ?????? ?? ???????????????????????????? ??????????????
          </Typography.Title>
          {selectData.length != 0 && (
            <Table
              dataSource={selectData}
              columns={selectDataColumns}
              size="small"
              // scroll={{ y: 600 }}
              pagination={false}
            />
          )}
          {selectData.length == 0 && (
            <Text>
              ?????????????????? ???????????????????????? ???? ??????????????, ???????????????????? ?????????????????? ?????????? ?????? ????????????????
            </Text>
          )}
        </Card>
      ) : (
        <LoadingScreen />
      )}
    </>
  );
};

export default UpsResult;
