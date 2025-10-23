import {useMutation, useQuery, useQueryClient} from "react-query";
import authProvider from "../../AuthProvider";
import apiUrl from "../../dataProvider";
import React, {useState} from "react";
import {formatDate} from "../utils";
import {useTranslate} from "react-admin";
import {Input, Select, Space} from "antd";
import {Status} from "../createOrder/additionalPurchaseItem/additionalPurchaseItem";
import {InvSupplyData} from "../createOrder/orderProducts/orderProducts";
import "react-datepicker/dist/react-datepicker.css";

const {Option} = Select;

interface Customer {
    id: number;
    name: string;
    company_name: string;
    address: string;
    phone: string;
    email: string;
}

interface Contract {
    id: number;
    name: string;
    customer: Customer;
    status: string;
    start_date: string;
    end_date: string;
}


interface AdditionalPurchaseAccountantData {
    id: number;
    proposal: AdditionalPurchaseProposalAccountData[] | [];
}

interface AdditionalPurchaseProposalAccountData {
    id: number;
    productId: number | undefined;
    quantity: number | undefined;
    price: number | undefined;
    delivery_date: Date | undefined;
    delivery_price: number | undefined;
    supplier: number | undefined;
    chosen_quantity: number | undefined;
    proposal_state: string | undefined;
    additional_documents: Document[] | undefined;
}

interface Document {
    id: number;
    url: string;
}

export interface OrderProductAccountantData {
    id: number;
    product: number;
    delivery_date: Date | undefined;
    delivery_price: number | 0;
    price: number | 0;
    inventory_supply: InvSupplyData[];
    target_quantity: number;
    product_name: string;
    additional_purchase: AdditionalPurchaseAccountantData[];
}

interface Order {
    id: number;
    customer: Customer;
    contract: Contract;
    order_status: string;
    payment_type: string;
    order_number: string;
    created_at: string;
    created_by: number;
    products: OrderProductAccountantData[];
}

const OrderAccountantList = () => {
    const translate = useTranslate();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({
        customer: "",
        contract: "",
        order_status: "",
        created_at_from: "",
        created_at_to: "",
    });

    const mutation = useMutation(updateProposalStatusOnServer, {
        onSuccess: () => {
            queryClient.invalidateQueries(["orders"]);
        },
        onError: (error) => {
            console.error('Error updating proposal status:', error);
        }
    });

    const {data, isError, isLoading, refetch} = useQuery(
        ["orders", filters],
        () => fetchOrders(filters),
        {
            keepPreviousData: true,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
        });


    const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
        console.log(filters);
        refetch();
    };

    const formattedData = data ? data.map((item: Order) => ({
        ...item,
        key: item.id,
    })) : [];

    const updateProposalField = (proposalId: number, purchaseId: number, productId: number, orderId: number) => {
        mutation.mutate({
            proposalId,
            purchaseId,
            productId,
            orderId
        });
    }

    if (isLoading) {
        return (
            <>
                <div>Loading...</div>
            </>
        );
    }

    if (isError) {
        return (
            <>
                <div>Error</div>
            </>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">
                {translate('resources.order_accountant_page.order_account_dashboard')}
            </h1>
            <Space direction="vertical" size="large" className="w-full">
                <div className="flex flex-wrap gap-4">
                    <Input
                        placeholder="Customer"
                        name="customer"
                        value={filters.customer}
                        onChange={handleFilterChange}
                        style={{width: 150}}
                    />
                    <Input
                        placeholder="Contract"
                        name="contract"
                        value={filters.contract}
                        style={{width: 150}}
                        onChange={handleFilterChange}
                    />
                    <Select
                        placeholder="Status"
                        onChange={(value) => {
                            setFilters((prev) => ({...prev, order_status: value}))
                        }}
                        style={{width: 150}}
                    >
                        <Option value="PENDING">{translate('resources.statuses.PENDING')}</Option>
                        <Option value="CONFIRMED">{translate('resources.statuses.CONFIRMED')}</Option>
                        <Option value="CANCELLED">{translate('resources.statuses.CANCELLED')}</Option>
                        <Option value="SHIPPED">{translate('resources.statuses.SHIPPED')}</Option>
                        <Option value="DELIVERED">{translate('resources.statuses.DELIVERED')}</Option>
                        <Option value="COMPLETED">{translate('resources.statuses.COMPLETED')}</Option>
                    </Select>

                    <input
                        type="date"
                        name={"created_at_from"}
                        value={filters.created_at_from}
                        onChange={handleFilterChange}
                        style={{
                            width: "150px",
                            height: "32px",
                            padding: "0px 11px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            fontSize: "14px"
                        }}
                    />

                    <input
                        type="date"
                        name={"created_at_to"}
                        value={filters.created_at_to}
                        onChange={handleFilterChange}
                        style={{
                            width: "150px",
                            height: "32px",
                            marginTop: "1px",
                            padding: "0px 11px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            fontSize: "14px"
                        }}
                    />

                </div>

                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="border border-gray-300 px-4 py-2">
                            {translate('resources.order_accountant_page.order_number')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                            {translate('resources.order_accountant_page.customer')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                            {translate('resources.order_accountant_page.contract')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                            {translate('resources.order_accountant_page.status')}
                        </th>
                        <th className="border border-gray-300 px-4 py-2">
                            {translate('resources.order_accountant_page.date_created')}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {formattedData.map((order, index) => {
                        const hasWaitingForPay = order.products.some((product) =>
                            product.additional_purchase?.some((purchase) =>
                                purchase.proposal.some((p) => p.proposal_state === Status.WAITING_FOR_PAY)
                            )
                        );

                        if (!hasWaitingForPay) return null;

                        return (
                            <React.Fragment key={order.id}>
                                <tr className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="border border-gray-300 px-4 py-2">{order.order_number}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.customer?.name || "No Customer"}</td>
                                    <td className="border border-gray-300 px-4 py-2">{order.contract?.name || "No contract"}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {translate(`resources.statuses.${order.order_status}`)}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">{formatDate(order.created_at)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 bg-gray-100" colSpan={7}>
                                        <div>
                                            {order.products.map((product: OrderProductAccountantData) => {
                                                const filteredPurchases = product.additional_purchase?.filter((purchase) =>
                                                    purchase.proposal.some((p) => p.proposal_state === Status.WAITING_FOR_PAY)
                                                );

                                                if (!filteredPurchases?.length) return null;

                                                return (
                                                    <div key={product.id}>
                                                        <p>
                                                            <strong>
                                                                {translate('resources.order_accountant_page.product')}:
                                                            </strong> {product.product_name}
                                                        </p>
                                                        <p>
                                                            <strong>
                                                                {translate('resources.order_accountant_page.target_quantity')}:
                                                            </strong> {product.target_quantity}
                                                        </p>

                                                        <h5 className="font-bold mt-2">
                                                            {translate('resources.order_accountant_page.additional_purchase')}:
                                                        </h5>
                                                        <div
                                                            style={{display: "grid", gap: "16px", padding: "16px"}}>
                                                            {filteredPurchases.map((purchase) => (
                                                                <div key={purchase.id} style={{
                                                                    borderRadius: "16px",
                                                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                                    backgroundColor: "white",
                                                                    padding: "16px"
                                                                }}>
                                                                    <h2 style={{
                                                                        fontSize: "20px",
                                                                        fontWeight: "bold",
                                                                        marginBottom: "8px"
                                                                    }}>
                                                                        {translate('resources.order_accountant_page.tender')}:
                                                                        {purchase.id}</h2>
                                                                    <ul>
                                                                        <ProposalsComponent
                                                                            updateProposalField={(proposalId) => {
                                                                                updateProposalField(proposalId, purchase.id, product.id, order.id);
                                                                            }}
                                                                            proposals={purchase.proposal}/>
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </Space>
        </div>
    );
};

const fetchOrders = async (filters: Record<string, string>): Promise<Order[]> => {

    const filteredFilters = Object.fromEntries(
        Object.entries(filters)
            .filter(([_, value]) => value.trim() !== "")
            .map(([key, value]) => {
                if (key === "created_at_from" || key === "created_at_to") {
                    return [key, new Date(value).toISOString()];
                }
                return [key, value];
            })
    );


    const filter = JSON.stringify(filteredFilters);
    // const range = JSON.stringify([0, 9]);
    const sort = JSON.stringify(["id", "ASC"]);

    const queryParams = new URLSearchParams({
        filter,
        // range,
        sort,
    });

    const response = await fetch(`${apiUrl}/orders/accountant?${queryParams.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authProvider.getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch orders");
    }
    const data = await response.json();
    console.log(data);
    return data;
};

interface ProposalUpdateParams {
    proposalId: number;
    purchaseId: number;
    productId: number;
    orderId: number;
}

const updateProposalStatusOnServer = async ({
                                                proposalId,
                                                purchaseId,
                                                productId,
                                                orderId
                                            }: ProposalUpdateParams) => {
    console.log(proposalId, purchaseId, productId, orderId);
    const response = await fetch(`${apiUrl}/orders/accountant/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            proposal_id: proposalId,
            proposal_state: "PAID_BY_ACCOUNTANT",
            purchase_id: purchaseId,
            product_id: productId
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authProvider.getToken()}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to update proposal status');
    }
    return response.json();
};

export default OrderAccountantList;

const ProposalDocumentsComponent = ({documents}: { documents: Document[] }) => {
    return (documents.length > 0 && (
        <div style={{marginTop: "8px"}}>
            {documents.map((doc, index) => (
                <div key={index}>
                    {doc.url.endsWith(".pdf") ? (
                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: "#007bff",
                                textDecoration: "none"
                            }}
                        >
                            {decodeURIComponent(doc.url.substring(doc.url.lastIndexOf('/') + 1))}
                        </a>
                    ) : (
                        <div>
                            <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "block",
                                    marginTop: "5px",
                                    color: "#007bff",
                                    textDecoration: "none"
                                }}
                            >
                                <img
                                    src={doc.url}
                                    alt={`document-${index}`}
                                    style={{
                                        maxWidth: "100px",
                                        borderRadius: "8px"
                                    }}
                                />
                            </a>
                        </div>
                    )}
                </div>
            ))}
        </div>
    ));
};

const ProposalsComponent = ({proposals, updateProposalField}: {
    proposals: AdditionalPurchaseProposalAccountData[],
    updateProposalField: (proposalId: number) => void,
}) => {
    const translate = useTranslate();

    const handleChangeStatus = (proposalId: number) => {
        updateProposalField(proposalId);
    };

    return (
        proposals
            .filter((proposal) => proposal.proposal_state === Status.WAITING_FOR_PAY)
            .map((proposal) => (
                <div
                    key={proposal.id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "8px",
                        marginBottom: "16px"
                    }}>
                    <div style={{
                        fontSize: "14px",
                        color: "#555"
                    }}>
                        <div>
                            {translate('resources.order_accountant_page.proposition')}: {proposal.id}
                        </div>
                        <div>
                            {translate('resources.order_accountant_page.quantity')}: {proposal.quantity}
                        </div>
                        <div>
                            {translate('resources.order_accountant_page.status')}: {translate(`resources.statuses.${proposal.proposal_state}`)}
                        </div>
                        <div style={{
                            fontWeight: "bold",
                            fontSize: "14px"
                        }}>
                            {translate('resources.order_accountant_page.price')}: {proposal.price}</div>
                    </div>
                    <ProposalDocumentsComponent
                        documents={proposal.additional_documents || []}/>

                    <button
                        style={{
                            padding: "8px 16px",
                            borderRadius: "8px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            cursor: "pointer"
                        }}
                        onClick={() => handleChangeStatus(proposal.id)}
                    >
                        {translate('resources.order_accountant_page.pay')}
                    </button>
                </div>
            ))
    );
}