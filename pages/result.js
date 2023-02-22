import UpsResult from "@/Components/UpsResult";

// export async function getServerSideProps(context) {
//   console.log("getServerSideProps", context);
//   return {
//     props: {}, // will be passed to the page component as props
//   };
// }

export default function Result(props) {
  // console.log("Result", props);
  return (
    <>
      <UpsResult />
    </>
  );
}
