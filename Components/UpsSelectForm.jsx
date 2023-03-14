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

import { log } from "@/utils/helper";

const { Text, Link } = Typography;

const UpsSelectForm = ({ requestState, updateInput, sort, setSort }) => {
  log("UpsSelectForm");

  // const [sort, setSort] = useState("price");

  return (
    <>
      <Text>Мощность нагрузки 0 - 80 000 </Text>
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
      <Text name="batteryRuntime">Время работы от АКБ (мин) </Text>
      <InputNumber
        min={0}
        max={1200}
        // step={0.02}
        value={requestState.batteryRuntime}
        onChange={(value) => updateInput(value, "batteryRuntime")}
      />
      <br />
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
      <Radio.Group
        onChange={(e) => updateInput(e.target.value, "rackMount")}
        value={requestState.rackMount}
      >
        <Radio value={"any"}>Неважно</Radio>
        <Radio value={"tower"}>только напольный</Radio>
        <Radio value={"19"}>только в стойку</Radio>
      </Radio.Group>
      {/* <Checkbox
                checked={requestState.rackMount}
                onChange={(e) => updateInput(e.target.checked, "rackMount")}
              >
                {requestState.rackMount ? "да" : "нет"}
              </Checkbox> */}
      <br />
      <Text>Карта управления SNMP (добавить) </Text>
      <Checkbox
        checked={requestState.snmpCard}
        onChange={(e) => updateInput(e.target.checked, "snmpCard")}
      >
        {requestState.snmpCard ? "да" : "нет"}
      </Checkbox>

      {/* {requestState.snmpCard && (
                <> */}
      <Text disabled={!requestState.snmpCard}>
        Датчик температуры и влажности (добавить){" "}
      </Text>
      <Checkbox
        disabled={!requestState.snmpCard}
        checked={requestState.snmpCardTempSensor && requestState.snmpCard !== false}
        onChange={(e) => updateInput(e.target.checked, "snmpCardTempSensor")}
      >
        {requestState.snmpCardTempSensor ? "да" : "нет"}
      </Checkbox>
      {/* </>
              )} */}
      <br />
      <Text>Сортировать </Text>
      <Radio.Group value={sort} onChange={(e) => setSort(e.target.value)}>
        <Radio value="price">По цене </Radio>
        <Radio value="powerReserve">По резерву мощности </Radio>
      </Radio.Group>
    </>
  );
};

export default UpsSelectForm;
