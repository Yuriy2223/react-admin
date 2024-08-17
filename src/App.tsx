// import {
//   Admin,
//   Resource,
//   ListGuesser,
//   // EditGuesser,
//   // ShowGuesser,
// } from "react-admin";
import { Admin, Resource } from "react-admin";
import { UserList } from "./users";
import { Layout } from "./Layout";
import { dataProvider } from "./dataProvider";

export const App = () => (
  <Admin layout={Layout} dataProvider={dataProvider}>
     {/* <Resource name="users" list={ListGuesser} /> */}
     <Resource name="users" list={UserList} />
  </Admin>
);
