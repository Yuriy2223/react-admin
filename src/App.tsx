import {BrowserRouter} from "react-router-dom";
import {Admin, defaultLightTheme, Resource} from "react-admin";
import {Layout} from "./Layout";
import {ProductCreate, ProductEdit, ProductShow, ProductViewWrapper} from "./components/Product";
import {OrderList, OrderShow} from "./components/Order";
import {dataProvider} from "./dataProvider";
import LoginPage from "./LoginPage";
import authProvider from "./AuthProvider";
import {WarehouseCreate, WarehouseEdit, WarehouseList, WarehouseShow} from "./components/Warehouse";
import {InventoryCreate, InventoryList} from "./components/Inventory";
import {PurchaseCreate, PurchaseEdit, PurchaseList, PurchaseShow} from "./components/Purchase";
import {InventoryProductEdit, InventoryProductList, InventoryProductShow} from "./components/InventoryProduct";
import {ShipmentCreate, ShipmentEdit, ShipmentList, ShipmentShow} from "./components/Shipment";
import {TransferCreate, TransferEdit, TransferList, TransferShow} from "./components/Transfer";
import {i18nProvider} from "./i18n/i18nProvider";
import {CustomerCreate, CustomerEdit, CustomerList, CustomerShow} from "./components/Customer";
import {SupplierCreate, SupplierEdit, SupplierList, SupplierShow} from "./components/Supplier";
import {ContractCreate, ContractEdit, ContractList, ContractShow} from "./components/Contract";
import {createTheme} from '@mui/material/styles';
import CategoryEdit from "./components/categoryComponent/CategoryEdit";
import CategoryCreate from "./components/categoryComponent/CategoryCreate";
import OrderAccountantPage from "./components/orderAccauntantList/OrderAccountantList";
import OrderEditWrapper from "./components/orderWrapper/orderEditWrapper";
import {OrderCreate} from "./components/createOrder/orderCreate/orderCreate";


const lightTheme = createTheme({
    ...defaultLightTheme,
});

export const App = () => {
    return <BrowserRouter>
        <Admin
            layout={Layout}
            dataProvider={dataProvider}
            authProvider={authProvider}
            i18nProvider={i18nProvider}
            loginPage={LoginPage}
            theme={lightTheme}
        >
            <Resource
                name="products"
                list={ProductViewWrapper}
                edit={ProductEdit}
                create={ProductCreate}
                show={ProductShow}
            />
            <Resource
                name="products/category"
                edit={CategoryEdit}
                create={CategoryCreate}
            />
            <Resource
                options={{label: 'resources.contract.name'}}
                name="contracts"
                list={ContractList}
                edit={ContractEdit}
                create={ContractCreate}
                show={ContractShow}
            />
            <Resource
                options={{label: 'resources.order.name'}}
                name="orders"
                list={OrderList}
                edit={OrderEditWrapper}
                create={OrderCreate}
                show={OrderShow}
            />
            <Resource
                name="warehouse/warehouse"
                options={{label: 'resources.warehouse.name'}}
                list={WarehouseList}
                edit={WarehouseEdit}
                create={WarehouseCreate}
                show={WarehouseShow}
            />
            <Resource
                name="warehouse/inventory"
                options={{label: 'resources.inventory.name'}}
                list={InventoryList}
                create={InventoryCreate}
            />
            <Resource
                name="warehouse/shipments/purchase"
                options={{label: 'resources.purchase.name'}}
                list={PurchaseList}
                create={PurchaseCreate}
                edit={PurchaseEdit}
                show={PurchaseShow}
            />
            <Resource
                name="warehouse/shipments/shipment"
                options={{label: 'resources.shipment.name'}}
                list={ShipmentList}
                create={ShipmentCreate}
                edit={ShipmentEdit}
                show={ShipmentShow}
            />
            <Resource
                name="warehouse/shipments/transfer"
                options={{label: 'resources.transfer.name'}}
                list={TransferList}
                create={TransferCreate}
                edit={TransferEdit}
                show={TransferShow}
            />
            <Resource
                name="warehouse/shipments/inventory-products"
                options={{label: 'resources.inventory_products.name'}}
                list={InventoryProductList}
                show={InventoryProductShow}
                edit={InventoryProductEdit}
            />
            <Resource
                name="warehouse/customer"
                options={{label: 'resources.customer_supplier.name_customer'}}
                list={CustomerList}
                create={CustomerCreate}
                edit={CustomerEdit}
                show={CustomerShow}
            />
            <Resource
                name="warehouse/supplier"
                options={{label: 'resources.customer_supplier.name_supplier'}}
                list={SupplierList}
                create={SupplierCreate}
                edit={SupplierEdit}
                show={SupplierShow}
            />
            <Resource
                name={"accountant"}
                options={{label: 'resources.order_accountant_page.name'}}
                list={OrderAccountantPage}
            />
        </Admin>
    </BrowserRouter>;
};