// import { constantsTable, supabase } from "./supabaseClient";

export function objectFromCSV(csvConst, first_column) {
  // console.log("first_column", first_column);
  const csvStrings = csvConst.split(`\n`);
  const csvArray = csvStrings.map((string) => string.split(";"));
  const csvArrayObj = csvArray.map((item) =>
    item.reduce((obj, str, index) => ({ ...obj, [csvArray[0][index]]: str }), {})
  );
  // console.log("csvArrayObj", csvArrayObj);
  const csvObj = csvArrayObj.reduce(
    (obj, val) => ({ ...obj, [val[first_column]]: val }),
    {}
  );
  // console.log("csvObj", csvObj);
  delete csvObj[first_column];
  delete csvObj[""];
  // console.log("csvObj", csvObj);
  return csvObj;
}

export function roundUp(number) {
  return Math.ceil(number);
}

export function strUSD(number) {
  number = number || 0;
  return `${(+(+number).toFixed(2)).toLocaleString()}`;
}
