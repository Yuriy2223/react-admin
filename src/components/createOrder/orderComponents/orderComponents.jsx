import React, {useEffect, useState} from 'react';
import authProvider from "../../../AuthProvider";
import {useTranslate} from "react-admin";

export const OrderStatusSelect = ({orderStatus, handleOrderStatusChange}) => {
    const translate = useTranslate();
    return (
        <div className="reference-input">
            <label htmlFor="order-status-select">{translate('resources.order.fields.order_status')}</label>
            <select
                id="order-status-select"
                value={orderStatus || ''}
                onChange={(e) => handleOrderStatusChange(e.target.value)}
                style={{width: '100%', padding: '8px', fontSize: '16px'}}
            >
                <option value="PENDING">{translate('resources.statuses.PENDING')}</option>
                <option value="CONFIRMED">{translate('resources.statuses.CONFIRMED')}</option>
                <option value="CANCELLED">{translate('resources.statuses.CANCELLED')}</option>
                <option value="SHIPPED">{translate('resources.statuses.SHIPPED')}</option>
                <option value="DELIVERED">{translate('resources.statuses.DELIVERED')}</option>
                <option value="COMPLETED">{translate('resources.statuses.COMPLETED')}</option>
            </select>
        </div>
    );
}

export const PaymentTypeSelect = ({orderPayment, handleOrderPaymentChange}) => {
    const translate = useTranslate();
    return (
        <div className="reference-input">
            <label htmlFor="order-status-select">{translate('resources.contract.fields.payment_type')}</label>
            <select
                id="order-status-select"
                value={orderPayment || ''}
                onChange={(e) => handleOrderPaymentChange(e.target.value)}
                style={{width: '100%', padding: '8px', fontSize: '16px'}}
            >
                <option value="COD">{translate('resources.contract.fields.payment_types.cod')}</option>
                <option value="ADV">{translate('resources.contract.fields.payment_types.adv')}</option>
            </select>
        </div>
    );
}

export const ContractSelect = ({contract, handleContractChange}) => {
    const translate = useTranslate();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            const fetchContracts = async () => {
                    try {
                        setLoading(true);
                        const response = await fetch(
                            `${import.meta.env.VITE_API_URL}/contracts`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization:
                                        `Bearer ${authProvider.getToken()}`,
                                },
                            }
                        );
                        const data = await response.json();
                        setContracts(data);
                    } catch
                        (error) {
                        console.error('Error fetching customers:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            ;
            fetchContracts();
        }, []
    );

    return (
        <div className="reference-input">
            <label htmlFor="contract-select">{translate('resources.contract.fields.name')}</label>
            {loading ? (
                <p>Loading contracts...</p>
            ) : (
                <select
                    id="contract-select"
                    value={contract || ''}
                    onChange={(e) => handleContractChange(e.target.value)}
                    style={{width: '100%', padding: '8px', fontSize: '16px'}}
                >
                    <option value="" disabled>
                        {translate('resources.order.fields.select_a_contract')}
                    </option>
                    {contracts.map((cust) => (
                        <option key={cust.id} value={cust.id}>
                            {cust.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};

export const CustomerSelect = ({customer, handleCustomerChange}) => {
    const translate = useTranslate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            const fetchCustomers = async () => {
                    try {
                        setLoading(true);
                        const response = await fetch(
                            `${import.meta.env.VITE_API_URL}/warehouse/customer`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization:
                                        `Bearer ${authProvider.getToken()}`,
                                },
                            }
                        );
                        const data = await response.json();
                        setCustomers(data);
                    } catch
                        (error) {
                        console.error('Error fetching customers:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            ;
            fetchCustomers();
        }, []
    );

    return (
        <div className="reference-input">
            <label htmlFor="customer-select">{translate('resources.order.fields.customer')}</label>
            {loading ? (
                <p>Loading customers...</p>
            ) : (
                <select
                    id="customer-select"
                    value={customer || ''}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    style={{width: '100%', padding: '8px', fontSize: '16px'}}
                >
                    <option value="" disabled>
                        {translate('resources.order.fields.select_a_customer')}
                    </option>
                    {customers.map((cust) => (
                        <option key={cust.id} value={cust.id}>
                            {cust.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};


export const WarehouseSelect = ({warehouse, handleWarehouseChange}) => {
    const translate = useTranslate();
    const [warehouseArray, setWarehouseArray] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            const fetchCustomers = async () => {
                    try {
                        setLoading(true);
                        const response = await fetch(
                            `${import.meta.env.VITE_API_URL}/warehouse/warehouse`,
                            {
                                method: "GET",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization:
                                        `Bearer ${authProvider.getToken()}`,
                                },
                            }
                        );
                        const data = await response.json();
                        setWarehouseArray(data);
                    } catch
                        (error) {
                        console.error('Error fetching customers:', error);
                    } finally {
                        setLoading(false);
                    }
                }
            ;
            fetchCustomers();
        }, []
    );

    return (
        <div className="reference-input">
            <label htmlFor="customer-select">{translate('resources.inventory.fields.warehouse')}</label>
            {loading ? (
                <p>Loading warehouses...</p>
            ) : (
                <select
                    id="warehouse-select"
                    value={warehouse || ''}
                    onChange={(e) => handleWarehouseChange(e.target.value)}
                    style={{width: '100%', padding: '8px', fontSize: '16px'}}
                >
                    <option value="" disabled>
                        {translate('resources.order.fields.select_a_warehouse')}
                    </option>
                    {warehouseArray.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
};


export const DeliveryAddress = ({address, handleAddressChange}) => {
    const translate = useTranslate();


    return (
        <div className="reference-input">
            <label htmlFor="delivery-address">{translate('resources.order.fields.address')}</label>

            <textarea
                id="delivery-address"
                value={address || ""}
                onChange={(e) => handleAddressChange(e.target.value)}
                placeholder={translate('resources.order.fields.enter_address')}
                rows={4}
                style={{width: "100%", padding: "8px", fontSize: "16px", resize: "vertical"}}
            />
        </div>
    );
};


