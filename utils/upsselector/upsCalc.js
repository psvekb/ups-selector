import { Typography } from "antd";
import { runtimeConstArr, runtimeConstObj } from "./runtimeConst";
import { tariffConstObj } from "./tariffConst";

export function calculateRunTime({ power, fullUpsPowerW, kx, px }) {
  const load = power / fullUpsPowerW;
  const time = (kx * Math.pow(load, px)).toFixed(2);
  // console.log("time", time);
  return power <= fullUpsPowerW ? time : 0;
}

export function getSelectTable({ requestState, sort }) {
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
      requestState.upsSystemFullPower * requestState.pF <= configRow.full_ups_power_w &&
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
            <Typography.Link href={configRow.href} target="_blank">
              <strong>{configRow.ups}</strong>{" "}
            </Typography.Link>
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
          summary: +tariffConstObj[configRow.battery]?.price * configRow.battery_quantity,
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
