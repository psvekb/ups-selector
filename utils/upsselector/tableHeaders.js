import { Table, Typography } from "antd";
import { strUSD } from "../appConsts";
const { Paragraph, Text } = Typography;

export const headerConfigSource = [
  {
    partNumber: "Артикул",
    description: "Описание",
    quantity: "Кол-во",
  },
];
export const selectConfigColumns = [
  {
    title: "Артикул",
    key: "partNumber",
    dataIndex: "partNumber",
    width: 140,
  },
  {
    title: "Кол-во",
    key: "quantity",
    dataIndex: "quantity",
    width: 10,
  },
  {
    title: "Описание",
    key: "description",
    dataIndex: "description",
    // width: "50%",
  },
];
export const selectDataColumns = ({ requestState, selectData }) => [
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
    // width: "50%",
    render: (text, record, index) => (
      <div style={{ border: "solid", borderColor: "lightgray" }}>
        <Text>
          Конфигурация для мощности{" "}
          <strong>
            {" "}
            {requestState.upsSystemFullPower} {requestState.measure === "W" && "Вт"}
            {requestState.measure === "VA" &&
              "ВА (pF=" +
                requestState.pF +
                ", " +
                Math.round(requestState.upsSystemFullPower * requestState.pF) +
                " Вт)"}
            , {requestState.batteryRuntime} мин
          </strong>
          ,{requestState.rackMount !== "any" && "тип установки "}
          <strong>
            {requestState.rackMount == "19" &&
              "стойка 19`` (" + selectData[index].units + "U)"}
            {requestState.rackMount == "tower" && "башня"}
          </strong>
          . Расчетное время автономии <strong>{selectData[index].time} мин</strong> ,
          резерв по мощности <strong>{selectData[index].powerReserve}%</strong>
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
    title: "Сумма Тариф, руб (с НДС)",
    key: "price",
    dataIndex: "price",
    width: 100,
    align: "right",
    render: (text, record, index) => <>{strUSD(text)}</>,
  },
];
