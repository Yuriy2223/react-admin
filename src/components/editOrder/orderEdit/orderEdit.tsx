import React, {useEffect, useMemo, useState} from "react";
import "../../createOrder/orderCreate/orderCreate.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import {Accordion, Button} from "react-bootstrap";
import authProvider from "../../../AuthProvider";
import {InvSupplyData} from "../../createOrder/orderProducts/orderProducts";
import {
    ContractSelect,
    CustomerSelect,
    OrderStatusSelect,
    PaymentTypeSelect
} from "../../createOrder/orderComponents/orderComponents";
import {OrderEditComponentList} from "../orderProductsEdit/orderProductsEdit";
import {OrderProductEditData, Product} from "../../createOrder/orderCreate/orderCreate";
import {AdditionalPurchaseData} from "../../createOrder/additionalPurchaseItem/additionalPurchaseItem";
import {SimpleForm, useDataProvider, useTranslate} from "react-admin";
import FileUploaderComponent from "../../../FileUploaderComponent";
import {DownloadComponent} from "../../createOrder/orderCreate/DownloadComponent";
import CommentBlock from "../../CommentBlock";
import {Document} from "../../exportDocuments/exportDocuments";

export const OrderEdit = ({id}: {
    id: string | undefined;
}) => {
    const translate = useTranslate();
    const [contract, setContract] = useState();
    const [loading, setLoading] = useState(true);
    const [media, setMedia] = useState<number[]>([]);
    const [customer, setCustomer] = useState<number>();
    const [payment, setPayment] = useState<string>("COD");
    const [status, setStatus] = useState<string>("PENDING");
    const [products, setProducts] = useState<Product[]>([]);
    const [documents, setDocuments] = useState<Document[] | number[]>([]);
    const [isReadyForPrint, setIsReadyForPrint] = useState<boolean>(true);
    const [orderProducts, setOrderProducts] = useState<OrderProductEditData[]>([]);

    const token = useMemo(() => authProvider.getToken(), []);

    const [finalId, setFinalId] = useState<string | number | null>(null);

    useEffect(() => {
        if (id) {
            setFinalId(id);
        }
    }, [documents]);

    useEffect(() => {
        console.log(documents);
    }, [documents])

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const {data} = await dataProvider.getOne('orders', {id});
                setContract(data.contract);
                setCustomer(data.customer);
                setStatus(data.order_status);
                setPayment(data.payment_type);
                setOrderProducts(data.products);
                setDocuments(data.documents);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrder();
    }, [id, token]);

    const dataProvider = useDataProvider();

    const handleFileUpload = (fileIds: string[]) => {
        setDocuments(fileIds.map((id) => parseInt(id)));
    };

    const handleOrderProductsChange = (index: number, field: string, value: any) => {
        const updated = [...orderProducts];
        updated[index] = {...updated[index], [field]: value};
        setOrderProducts(updated);
        setIsReadyForPrint(false);
    };

    const addProduct = () => {
        const newProduct: OrderProductEditData = {
            id: undefined,
            product: undefined,
            inventory_supply: [],
            additional_purchase: [],
            delivery_date: undefined,
            delivery_price: 0,
            price: 0,
            target_quantity: 0
        };
        setOrderProducts([...orderProducts, newProduct]);
    };

    const calculateInventorySupplyQuantity = (inventorySupply: InvSupplyData[]) => {
        return inventorySupply.reduce((total, item) => {
            let quantity = item.chosen_quantity || 0;
            return total + quantity;
        }, 0);
    }

    const calculateInventorySupplyPrice = (inventorySupply: InvSupplyData[]) => {
        return inventorySupply.reduce((total, item) => {
            let quantity = item.chosen_quantity || 0;
            return total + quantity * item.price;
        }, 0);
    }

    const calculateAdditionalPurchaseQuantity = (additionalPurchase: AdditionalPurchaseData[]) => {
        if (additionalPurchase !== undefined && additionalPurchase.length > 0) {
            return additionalPurchase.reduce((total, item) => {
                    return total + item.proposal.reduce((totalProposal, item) => {
                        return totalProposal + (item.chosen_quantity || 0);
                    }, 0);
                }
                , 0);
        } else {
            return 0;
        }
    }
    const calculateAdditionalPurchasePrice = (additionalPurchase: AdditionalPurchaseData[]) => {
        if (additionalPurchase !== undefined && additionalPurchase.length > 0) {
            return additionalPurchase.reduce((total, item) => {
                return total + item.proposal.reduce((totalProposal, item) => {
                    return totalProposal + (item.price || 0) * (item.chosen_quantity || 0);
                }, 0);
            }, 0);
        } else {
            return 0;
        }
    }

    const calculateAllProductsQuantity = () => {
        let totalQuantity = 0;
        orderProducts.forEach((product) => {
            totalQuantity += calculateInventorySupplyQuantity(product.inventory_supply);
            totalQuantity += calculateAdditionalPurchaseQuantity(product.additional_purchase);
        });
        return totalQuantity;
    }

    const calculateAllProductsPrice = () => {
        let totalQuantity = 0;
        orderProducts.forEach((product) => {
            totalQuantity += calculateInventorySupplyPrice(product.inventory_supply);
            totalQuantity += calculateAdditionalPurchasePrice(product.additional_purchase);
        });
        return totalQuantity;
    }

    const calculateAllProductsDelivery = () => {
        let totalDelivery = 0;
        orderProducts.forEach((product) => {
            totalDelivery += product.delivery_price || 0;
            totalDelivery += calculateAdditionalPurchaseDelivery(product.additional_purchase);
        });
        return totalDelivery;
    }

    const calculateAdditionalPurchaseDelivery = (additionalPurchase: AdditionalPurchaseData[]) => {
        if (additionalPurchase !== undefined && additionalPurchase.length > 0) {
            return additionalPurchase.reduce((total, item) => {
                return total + item.proposal.reduce((totalProposal, item) => {
                    return totalProposal + (item.delivery_price || 0);
                }, 0);
            }, 0);
        } else {
            return 0;
        }
    }
    const calculateTotalProducts = () => {
        return calculateAllProductsPrice() + calculateAllProductsDelivery();
    }

    const calculateTotalPriceForCustomer = () => {
        return orderProducts.reduce((total, product) => {
            return total + (product.price || 0);
        }, 0);
    }
    const editOrder = async () => {

        let body = JSON.stringify({
            customer: customer,
            contract: contract,
            order_status: status,
            payment_type: payment,
            products: orderProducts.map((product) => {
                product.additional_purchase = product.additional_purchase.map((additionalPurchase) => {

                    additionalPurchase.proposal = additionalPurchase.proposal.map((proposal) => {
                        proposal.additional_documents = proposal.additional_documents?.map((doc: any) => {

                            if (doc.id !== undefined) {
                                return doc.id;
                            } else {
                                return doc;
                            }
                        });
                        return proposal;

                    });
                    return additionalPurchase;
                });
                return product;
            }),
            media: media,
            documents: documents.map((doc) =>
                typeof doc === "number" ? doc : doc.id
            ),
        });

        console.log(body);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: body,
            });
            if (!response.ok) throw new Error("Failed to edit order");
            setIsReadyForPrint(true);
            alert("Order edited successfully!");
        } catch (error) {
            alert("Failed to edit order");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/products`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authProvider.getToken()}`,
                        },
                    }
                );
                const data = await response.json();
                setProducts(data);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [orderProducts]);

    return (
        <div className="order-create">
            <div className="order-settings">
                <h2>{translate('resources.main_order_settings')}</h2>
                <CustomerSelect customer={customer} handleCustomerChange={(e: any) => {
                    setCustomer(e);
                    setIsReadyForPrint(false);
                }
                }/>
                <ContractSelect contract={contract} handleContractChange={(e: any) => {
                    setContract(e);
                    setIsReadyForPrint(false);
                }}/>
                <OrderStatusSelect orderStatus={status}
                                   handleOrderStatusChange={(e: any) => {
                                       setStatus(e);
                                       setIsReadyForPrint(false);
                                   }}/>
                <PaymentTypeSelect orderPayment={payment}
                                   handleOrderPaymentChange={(e: any) => {
                                       setPayment(e);
                                       setIsReadyForPrint(false);
                                   }}/>
                <SimpleForm toolbar={false}>
                    {finalId !== null && documents !== undefined && (
                        <FileUploaderComponent
                            id={finalId}
                            source="documents"
                            files={documents}
                            uploadEndpoint="orders"
                            label={translate("resources.documents")}
                            onChange={(fileIds) => handleFileUpload(fileIds)}
                        />
                    )}
                </SimpleForm>


                <div className={'mt-3'}>
                    <Button
                        style={{
                            borderRadius: '8px',
                            padding: '8px 16px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#115293';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976d2';
                        }}
                        onClick={addProduct}>{translate('resources.order.fields.add_product')}
                    </Button>

                    <DownloadComponent
                        downloadUrl={`${import.meta.env.VITE_API_URL}/orders/pdf`}
                        recordId={id}
                        entity={"order"}
                        disabled={!isReadyForPrint}
                    />
                </div>

            </div>

            <div className={"statistics"}>
                <div className={"p-2"}>
                    <strong>{translate('resources.order.fields.all_order_quantity')}</strong><br/>
                    <span>{calculateAllProductsQuantity()}</span>
                </div>
                <div className="p-2">
                    <strong>{translate('resources.order.fields.all_order_price')}</strong><br/>
                    <span>{calculateAllProductsPrice().toFixed(2)}</span>
                </div>
                <div className="p-2">
                    <strong>{translate('resources.order.fields.all_delivery_price')}</strong><br/>
                    <span>{calculateAllProductsDelivery().toFixed(2)}</span>
                </div>
                <div className="p-2">
                    <strong>{translate('resources.order.fields.total_price')}</strong><br/>
                    <strong>Total price: </strong><br/>
                    <span>{calculateTotalProducts().toFixed(2)}</span>
                </div>

                <div className="p-2">
                    <strong>{translate('resources.order.fields.total_customer_price')}</strong><br/>
                    <span>{calculateTotalPriceForCustomer().toFixed(2)}</span>
                </div>
            </div>

            <div>
                <Accordion className={'accordion-form'}>
                    {orderProducts.map((product, index) => (
                        <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>
                                {
                                    orderProducts[index].product
                                        ? products.filter(p => p.id === orderProducts[index].product)[0]?.name
                                        : `${translate('resources.order.fields.product')} ${index + 1}`
                                }
                            </Accordion.Header>
                            <Accordion.Body>
                                <OrderEditComponentList
                                    key={index}
                                    productData={product}
                                    updateProduct={(field, value) => handleOrderProductsChange(index, field, value)}
                                    removeOrderProduct={() => {
                                        const updatedProducts = orderProducts.filter((product, i) => i !== index);
                                        setOrderProducts(updatedProducts);
                                    }}
                                />
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>

            <div className="order-create-submit">
                <Button variant={"warning"} onClick={editOrder}>
                    {translate('resources.order.fields.edit_order')}
                </Button>
            </div>

            {id ? <CommentBlock orderId={id}/> : null}

        </div>
    );
};
