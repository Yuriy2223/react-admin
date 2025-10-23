import {useRedirect, useTranslate} from "react-admin";
import React, {useEffect, useState} from "react";
import apiUrl, {dataProvider} from "../../dataProvider";
import {
    ContractSelect,
    CustomerSelect,
    DeliveryAddress,
    WarehouseSelect
} from "../createOrder/orderComponents/orderComponents";
import {Product} from "../createOrder/orderCreate/orderCreate";
import {Button} from "react-bootstrap";
import authProvider from "../../AuthProvider";
import {DownloadComponent} from "../createOrder/orderCreate/DownloadComponent";
import Tooltip from '@mui/material/Tooltip';


interface OrderProductData {
    product: number;
}

interface OrderExpenditureInvoice {
    id: number;
    order: number;
    contract: number | undefined;
    customer: number | undefined;
    warehouse: number | undefined;
    address: string | undefined;
    expenditure_invoices: ExpenditureInvoicesRow[];

    [key: string]: any;
}

const ExpenditureInvoices = ({orderId}: { orderId: string | undefined }) => {
    const [expId, setExpId] = useState(1);
    const [orderExpenditureInvoices, setOrderExpenditureInvoices] = useState<OrderExpenditureInvoice[]>([]);
    const [contract, setContract] = useState();
    const [customer, setCustomer] = useState();
    const [orderProducts, setOrderProducts] = useState<OrderProductData[]>([]);
    const [isIsExistingInvoices, setIsExistingInvoices] = useState(false);
    const redirect = useRedirect();

    const translate = useTranslate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const {data} = await dataProvider.getOne('orders', {id: orderId});
                setContract(data.contract);
                setCustomer(data.customer);
                setOrderProducts(data.products || []);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        const fetchExpenditureInvoices = async () => {
            try {
                const response = await fetch(apiUrl + `/orders/expenditure/${orderId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authProvider.getToken()}`,
                    },
                });

                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    setIsExistingInvoices(true);
                    setOrderExpenditureInvoices(data);
                } else {
                    setIsExistingInvoices(false);
                    setOrderExpenditureInvoices([]);
                }

            } catch (error) {
                console.error("Can't find invoices for order:", error);
            }
        }
        fetchOrder();
        fetchExpenditureInvoices();
    }, [orderId]);

    const createExpInvoice = () => {
        const newExpInvoice: OrderExpenditureInvoice = {
            id: expId,
            order: Number(orderId),
            contract: undefined,
            customer: undefined,
            warehouse: undefined,
            address: undefined,
            expenditure_invoices: [],
        };
        const updatedOrderExpInvoices = [...orderExpenditureInvoices, newExpInvoice];
        setOrderExpenditureInvoices(updatedOrderExpInvoices);
        setExpId((prevState) => prevState + 1);
    };

    const handleSubmit = async () => {
        isIsExistingInvoices ? await updateExportDocuments(orderExpenditureInvoices) : await saveExpenditureInvoices(orderExpenditureInvoices);
        redirect("/orders");
    };

    const saveExpenditureInvoices = async (requestData: OrderExpenditureInvoice[]) => {
        try {
            console.log("requestData", JSON.stringify(requestData));
            const response = await fetch(apiUrl + `/orders/expenditure`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                console.error(`Error saving expenditure invoices: ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("Saved expenditure invoices:", data);
        } catch (error) {
            console.error("Error saving expenditure invoices:", error);
        }
    };

    const updateExportDocuments = async (requestData: OrderExpenditureInvoice[]) => {
        try {

            const requestBody = {
                invoices: requestData,
            }

            const response = await fetch(apiUrl + `/orders/expenditure/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: JSON.stringify(requestBody),
            });
            console.log("requestData", JSON.stringify(requestData));

            if (!response.ok) {
                console.error(`Error saving expenditure invoices: ${response.status}`);
                return;
            }
            console.log("Updated expenditure invoices:");
        } catch (error) {
            console.error("Error saving expenditure invoices:",);
        }
    };
    const handleInvoiceCardChange = (index: number, name: keyof OrderExpenditureInvoice, value: number | ExpenditureInvoicesRow[]) => {
        const updatedExpInvoices = [...orderExpenditureInvoices];
        updatedExpInvoices[index][name] = value;
        setOrderExpenditureInvoices(updatedExpInvoices);
    }

    return (
        <div>
            <div style={{display: 'flex', gap: '20px'}}>
                <Button onClick={createExpInvoice}>{translate("resources.order.fields.create_exp_inv")}</Button>
                <Button variant={'success'} onClick={handleSubmit}>{translate("resources.order.fields.save")}</Button>
            </div>

            <div>
                <div>
                    <h1>{translate("resources.order.fields.expenditure_invoices")}</h1>
                </div>
                {}
                {orderExpenditureInvoices.length > 0 && orderExpenditureInvoices.map((expInvoice, index) => (
                    <div key={expInvoice.id}
                         style={{
                             background: index % 2 === 0
                                 ? "rgba(255,255,255,0.6)"
                                 : "rgba(232,218,218,0.6)",
                             border: "1px solid black",
                             borderRadius: "5px",
                             padding: "10px",
                             marginBottom: "10px",
                         }}>
                        <ExpenditureInvoiceCard
                            key={expInvoice.id}
                            expInvoice={expInvoice}
                            orderContract={contract}
                            orderCustomer={customer}
                            orderProducts={orderProducts}
                            updateCard={(name, value) => {
                                handleInvoiceCardChange(index, name, value)
                            }}
                            deleteCard={(value) => {
                                const updatedExpInvoices = orderExpenditureInvoices.filter((expInvoice) => expInvoice.id !== value);
                                setOrderExpenditureInvoices(updatedExpInvoices);
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const ExpenditureInvoiceCard = ({orderContract, orderCustomer, expInvoice, orderProducts, updateCard, deleteCard}: {
    orderCustomer: number | undefined,
    orderContract: number | undefined,
    expInvoice: OrderExpenditureInvoice,
    orderProducts: OrderProductData[],
    updateCard: (name: string, value: number | ExpenditureInvoicesRow[]) => void;
    deleteCard: (value: number) => void;
}) => {
    const [customer, setCustomer] = useState(expInvoice.customer);
    const [contract, setContract] = useState(expInvoice.contract);
    const [warehouse, setWarehouse] = useState(expInvoice.warehouse);
    const [address, setAddress] = useState(expInvoice.address);
    const [expenditureInvoicesRow, setExpenditureInvoicesRow] = useState(expInvoice.expenditure_invoices);
    const translate = useTranslate();

    return (
        <div>
            <div>
                <CustomerSelect customer={customer ? customer : orderCustomer}
                                handleCustomerChange={(e: any) => {
                                    setCustomer(e)
                                    updateCard("customer", e)
                                }}
                />
            </div>
            <div>
                <ContractSelect contract={contract ? contract : orderContract}
                                handleContractChange={(e: any) => {
                                    setContract(e)
                                    updateCard("contract", e)
                                }}
                />
            </div>
            <div>
                <WarehouseSelect warehouse={warehouse}
                                 handleWarehouseChange={(e: any) => {
                                     setWarehouse(e)
                                     updateCard("warehouse", e)
                                 }}
                />
            </div>
            <div>
                <DeliveryAddress address={address}
                                 handleAddressChange={(e: any) => {
                                     setAddress(e)
                                     updateCard("address", e)
                                 }}
                />
            </div>
            <div className={'border p-2'}>
                <ExpenditureRows orderProducts={orderProducts}
                                 rows={expenditureInvoicesRow}
                                 handleRowsChange={(rows) => {
                                     setExpenditureInvoicesRow(rows)
                                     updateCard("expenditure_invoices", rows)
                                 }}
                />
            </div>
            <div className={'d-flex gap-1'}>
                <Button
                    style={{
                        margin: '10px',
                    }}
                    variant={'danger'}
                    onClick={() => deleteCard(expInvoice.id)}>
                    {translate('resources.delete')}
                </Button>

                <Tooltip title="Збережіть перед завантаженням" arrow>
                    <span>
                        <DownloadComponent
                            downloadUrl={apiUrl + `/orders/pdf`}
                            entity={'expenditure'}
                            recordId={expInvoice.id}
                            disabled={false}
                        />
                    </span>
                </Tooltip>
            </div>
        </div>
    )
}


interface ExpenditureInvoicesRow {
    id: number;
    product: number | undefined;
    quantity: number;
    price: number;
}

const ExpenditureRows = ({orderProducts, rows, handleRowsChange}: {
    orderProducts: OrderProductData[],
    rows: ExpenditureInvoicesRow[],
    handleRowsChange: (rows: ExpenditureInvoicesRow[]) => void
}) => {
    const [id, setId] = useState(1);
    const [products, setProducts] = useState<Product[]>([]);
    const [expenditureInvoicesRows, setExpenditureInvoicesRows] = useState<ExpenditureInvoicesRow[]>(rows);
    const translate = useTranslate();

    useEffect(() => {
        const fetchProducts = async () => {
            if (orderProducts.length === 0) return;

            try {
                const {data} = await dataProvider.getList('products', {
                    filter: {id: orderProducts.map((product) => product.product)},
                    pagination: {page: 1, perPage: 100},
                    sort: {field: 'id', order: 'ASC'},
                });

                setProducts(data || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, [orderProducts]);

    const handleChange = (index: number, field: 'quantity' | 'price' | 'product', value: number) => {
        const updatedProducts = [...expenditureInvoicesRows];
        updatedProducts[index][field] = value;
        setExpenditureInvoicesRows(updatedProducts);
        handleRowsChange(updatedProducts);
    };

    const handleAddRow = () => {
        setExpenditureInvoicesRows([...expenditureInvoicesRows, {id: id, product: undefined, quantity: 0, price: 0}]);
        setId((prevState) => prevState + 1);
    };

    const handleDeleteRow = (index: number) => {
        const updatedProducts = expenditureInvoicesRows.filter((product, i) => i !== index);
        setExpenditureInvoicesRows(updatedProducts);
    };

    return (
        <div>
            <h2>{translate('resources.order.fields.products')}</h2>

            <table style={{
                marginBottom: '20px',
                borderCollapse: 'separate',
                borderSpacing: '10px 5px'
            }}>
                <thead>
                <tr>
                    <th style={{padding: '8px'}}>Продукт</th>
                    <th style={{padding: '8px'}}>Кількість</th>
                    <th style={{padding: '8px'}}>Сума без ПДВ, за шт</th>
                    <th style={{padding: '8px'}}></th>
                </tr>
                </thead>
                <tbody>
                {expenditureInvoicesRows.map((product, index) => (
                    <tr key={product.id}>
                        <td>
                            <select
                                id={`product-select-${product.id}`}
                                value={product.product || ''}
                                onChange={(e) => handleChange(index, 'product', Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="" disabled>
                                    {translate('resources.order.fields.select_a_product')}
                                </option>
                                {products.map((prod) => (
                                    <option key={prod.id} value={prod.id}>
                                        {prod.name}
                                    </option>
                                ))}
                            </select>
                        </td>
                        <td>
                            <input
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                type="number"
                                value={product.quantity}
                                onChange={(e) => handleChange(index, 'quantity', Number(e.target.value))}
                                min={0}
                            />
                        </td>
                        <td>
                            <input
                                style={{
                                    width: '100%',
                                    height: '40px',
                                    padding: '8px',
                                    fontSize: '16px',
                                    boxSizing: 'border-box'
                                }}
                                type="number"
                                value={product.price}
                                step={0.01}
                                onChange={(e) => handleChange(index, 'price', Number(e.target.value))}
                                min={0}
                            />
                        </td>
                        <td>
                            <Button style={{marginLeft: '15px'}} variant={'danger'}
                                    onClick={() => handleDeleteRow(index)}>
                                {translate('resources.order.fields.delete_row')}
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Button variant={'success'} onClick={handleAddRow}>
                {translate('resources.order.fields.add_row')}
            </Button>
        </div>
    );
};

export default ExpenditureInvoices;
