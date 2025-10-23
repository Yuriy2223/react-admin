import React, {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import "../../createOrder/orderProducts/orderProducts.css";
import authProvider from "../../../AuthProvider";
import {AutocompleteInput, ReferenceInput, SimpleForm, useTranslate} from "react-admin";
import {InventorySupplyComponent} from "../../createOrder/inventorySupplyItem/inventorySupplyItem";
import {OrderProductData} from "../../createOrder/orderCreate/orderCreate";
import {InvSupplyData} from "../../createOrder/orderProducts/orderProducts";
import {AdditionalPurchaseEditComponent} from "../additionalPurchaseItemEdit/additionalPurchaseItemEdit";
import {
    AdditionalPurchaseData,
    AdditionalPurchaseProposalData
} from "../../createOrder/additionalPurchaseItem/additionalPurchaseItem";

export const OrderEditComponentList = ({productData, updateProduct, removeOrderProduct}: {
        productData: OrderProductData;
        updateProduct: (field: string, value: any) => void;
        removeOrderProduct: (productId: any) => void;

    }) => {
    const translate = useTranslate();
        const [products, setProducts] = useState([]);
        const [loading, setLoading] = useState(true);
        const [price, setPrice] = useState<number>(productData.price);
    const [estimatedQuantity, setEstimatedQuantity] = useState<number>(productData.target_quantity);
    const [additionalPurchaseId, setAdditionalPurchaseId] = useState<number>(() => {
        return productData.additional_purchase?.length
            ? Math.max(...productData.additional_purchase.map((p: { id: number }) => p.id))
            : 1;
    });
        const [productId, setProductId] = useState<number | undefined>(productData.product);
    const [deliveryPrice, setDeliveryPrice] = useState<number>(productData.delivery_price);
        const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(productData.delivery_date);
        const [inventorySupply, setInventorySupply] = useState<InvSupplyData[]>(productData.inventory_supply ?? []);
        const [additionalPurchase, setAdditionalPurchase] = useState<AdditionalPurchaseData[]>(productData.additional_purchase ?? []);


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
        }, []);


        const handleProductChange = async (value: string) => {
            const selectedProductId = parseInt(value, 10);
            setProductId(selectedProductId);
            updateProduct("product", selectedProductId);
            fillInventorySupply(selectedProductId);
        };

        const fillInventorySupply = async (selectedProductId: number) => {
            console.log("Fill inventory supply for product:", selectedProductId);
            const inventoryData = await loadInventoryForProduct(selectedProductId);
            console.log("Inventory data:", inventoryData);

            inventoryData.map((item: InvSupplyData) => (item['chosen_quantity'] = 0));
            setInventorySupply(inventoryData);
        }


        const loadInventoryForProduct = async (productId: number) => {
            try {
                const params = new URLSearchParams();
                params.append("filter", JSON.stringify({q: productId}));
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/warehouse/shipments/inventory-products?${params}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authProvider.getToken()}`,
                        },
                    }
                );
                if (!response.ok)
                    throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                return data.inventory_data || [];
            } catch (error) {
                return [];
            }
        };

        const updateInventorySupply = (id: number, quantity: number) => {
            console.log("Update inventory supply:", id, quantity);
            const updated = inventorySupply.map((item) =>
                item.id === id ? {...item, chosen_quantity: quantity} : item
            );
            setInventorySupply(updated);
            updateProduct("inventory_supply", updated);
        };

        const addAdditionalPurchase = () => {
            const newAdditionalPurchase: AdditionalPurchaseData = {
                id: additionalPurchaseId,
                proposal: [],
            }
            setAdditionalPurchase([...additionalPurchase, newAdditionalPurchase]);
            updateProduct("additional_purchase", [...additionalPurchase, newAdditionalPurchase]);
            setAdditionalPurchaseId(additionalPurchaseId + 1);
        };

        const handlePriceChange = (value: number) => {
            setPrice(value);
            updateProduct("price", value);
        }

        const handleDeliveryPriceChange = (value: number) => {
            setDeliveryPrice(value);
            updateProduct("delivery_price", value);
        }

        const updateAdditionalPurchase = (index: number, field: string, value: any) => {
            const updated = [...additionalPurchase];
            updated[index] = {...updated[index], [field]: value};
            setAdditionalPurchase(updated);
            updateProduct("additional_purchase", updated);
        };

        const totalPriceInventory = () => inventorySupply.reduce((total, item) => {
            return total + (item.chosen_quantity || 0) * item.price;
        }, 0);

        const totalInventoryQuantity = () => inventorySupply.reduce((total, item) => {
            return total + (item.chosen_quantity || 0);
        }, 0);

        const calculateAdditionalPurchaseQuantity = () => {
            if (additionalPurchase !== undefined && additionalPurchase.length > 0) {

                return additionalPurchase.reduce((total, item) => {
                        return total + item.proposal.reduce((totalProposal: number, item: AdditionalPurchaseProposalData) => {
                            return totalProposal + (item.chosen_quantity || 0);
                        }, 0);
                    }
                    , 0);
            } else {
                return 0;
            }
        }

        const calculateAdditionalPurchasePriceWithDelivery = () => {
            if (additionalPurchase !== undefined && additionalPurchase[0] !== undefined && additionalPurchase[0].proposal !== undefined) {
                return additionalPurchase[0].proposal.reduce((total: number, item: AdditionalPurchaseProposalData) => {
                    const quantity = item.chosen_quantity || 0;
                    const price = item.price || 0;
                    const deliveryPrice = item.delivery_price || 0;

                    return total + quantity * price + deliveryPrice;
                }, 0);
            } else {
                return 0;
            }
        }

        const totalQuantity = () => {
            return totalInventoryQuantity() + calculateAdditionalPurchaseQuantity();
        }

        const totalPrice = () => {
            return totalPriceInventory() + deliveryPrice + calculateAdditionalPurchasePriceWithDelivery();
        }

        const calculateAverageInventoryPrice = () => {
            return totalInventoryQuantity() > 0 ? (totalPriceInventory() + (deliveryPrice || 0)) / totalInventoryQuantity() : 0;
        }
        const handlePriceChangeWithPercent = (percent: number) => {
            const newPrice = totalPrice() + totalPrice() * percent / 100;
            setPrice(newPrice);
            updateProduct("price", newPrice);
        }
        const handleDeliveryDateChange = (value: string) => {
            setDeliveryDate(new Date(value));
            updateProduct("delivery_date", value);
        }
        const deleteAdditionalPurchase = (deleteId: number) => {
            console.log("additionalPurchase:", additionalPurchase);
            console.log("Delete additional purchase with id:", deleteId);
            const updated = additionalPurchase.filter((item) => item.id !== deleteId);
            console.log("Updated additional purchase:", updated);
            setAdditionalPurchase(updated);
            updateProduct("additional_purchase", updated);
        }

        const clearChoose = () => {
            console.log("Clear choose");
            console.log("productId:", productId);
            setInventorySupply([]);
            console.log("inventorySupply:", inventorySupply);
            fillInventorySupply(productId ? productId : 0);
        }

        return (
            <div className="order-component-list">
                <h3>{translate('resources.order.fields.order_product')}</h3>
                <div className="calc-block">

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.total_additional_quantity')}</strong><br/>
                        <span>{totalQuantity()}</span>
                    </div>

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.total_price')}</strong><br/>
                        <span>{totalPrice()}</span>
                    </div>

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.per_one')}</strong><br/>
                        <span>{(totalPrice() / totalQuantity()).toFixed(2)}</span>
                    </div>

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.total_price_for_customer')}</strong><br/>
                        <input
                            className="form-control"
                            type="number"
                            value={(price).toFixed(2)}
                            min={0}
                            step="0.01"
                            onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.enter_additional_percentage')}</strong><br/>
                        <input
                            className={'form-control'}
                            type={'number'}
                            min={0}
                            defaultValue={0}
                            step={0.01}
                            onChange={(e) => handlePriceChangeWithPercent(parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                <div>
                    <h4>{translate('resources.order.fields.select_product')}</h4>
                    <SimpleForm toolbar={false} record={{product: productData.product}}>
                        <ReferenceInput
                            name="product"
                            source="product"
                            reference="products"
                            filterToQuery={(searchText: string) => (searchText.length >= 3 ? {name: searchText} : {})}>

                            <AutocompleteInput
                                optionText="name"
                                shouldRenderSuggestions={(value: string) => value.length >= 1}
                                helperText="Enter at least 3 characters to search"
                                noOptionsText="No options available. Please try again."
                                onChange={handleProductChange}
                            />
                        </ReferenceInput>
                    </SimpleForm>

                    <div className="calc-block">
                        <div className="p-2">
                            <strong>{translate('resources.order.fields.full_price_for_inventory')}</strong><br/>
                            <span>{totalPriceInventory().toFixed(2)}</span>
                        </div>
                        <div className="p-2">
                            <strong>{translate('resources.order.fields.total_inventory_quantity')}</strong><br/>
                            <span>{totalInventoryQuantity()}</span>
                        </div>
                        <div className="p-2">
                            <strong>{translate('resources.order.fields.average_inventory_price')}</strong><br/>
                            <span>{calculateAverageInventoryPrice().toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className={'price-quantity-block'}>
                    <div className="col-md-2 price-form">
                        <label htmlFor="delivery-date"
                               className="form-label">{translate('resources.order.fields.estimated_delivery_date')}</label>
                        <input
                            className="form-control"
                            type="date"
                            value={deliveryDate
                                ? new Date(deliveryDate).toISOString().split("T")[0]
                                : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                            min={0}
                            step="0.01"
                            onChange={(e) => handleDeliveryDateChange(e.target.value)}
                        />
                    </div>

                    <div className="col-md-2 price-form">
                        <label htmlFor="quantity"
                               className="form-label">{translate('resources.order.fields.estimated_delivery_price')}</label>
                        <input
                            className="form-control"
                            type="number"
                            value={deliveryPrice}
                            min={0}
                            step="0.01"
                            onChange={(e) => handleDeliveryPriceChange(parseFloat(e.target.value))}
                        />
                    </div>

                    <div className="col-md-2 price-form">
                        <label htmlFor="estimated-quantity"
                               className="form-label">{translate('resources.order.fields.target_quantity')}</label>
                        <input
                            className="form-control"
                            type="number"
                            value={estimatedQuantity}
                            min={0}
                            step="1"
                            onChange={(e) => {
                                setEstimatedQuantity(parseInt(e.target.value));
                                updateProduct("target_quantity", e.target.value);
                            }}
                        />
                    </div>

                </div>

                <div>
                    <h4>{translate('resources.order.fields.inventory_supply')}</h4>
                    <table className="table ttable-dark table-sm">
                        <thead>
                        <tr>
                            <th scope="col">{translate('resources.order.fields.state')}</th>
                            <th scope="col">{translate('resources.order.fields.price')}</th>
                            <th scope="col">{translate('resources.order.fields.available_quantity')}</th>
                            <th scope="col">{translate('resources.order.fields.chosen_quantity')}</th>
                        </tr>
                        </thead>
                        <tbody>

                        {inventorySupply.map(
                            (item) => (
                                <InventorySupplyComponent
                                    key={item.id}
                                    inventoryData={item}
                                    updateChosenQuantity={updateInventorySupply}
                                />
                            )
                        )}
                        </tbody>
                    </table>
                    <Button onClick={clearChoose} variant="danger" className="mb-3">
                        {translate('resources.order.fields.clear_choose')}
                    </Button>
                </div>

                <div>
                    <Button onClick={addAdditionalPurchase} variant="primary" className="mb-3">
                        {translate('resources.order.fields.add_additional_purchase')}
                    </Button>
                </div>
                <div className={'additional-purchase-list'}>
                    {
                        additionalPurchase.map((purchaseProposal, index) => (
                            <AdditionalPurchaseEditComponent
                                key={index}
                                additionalPurchaseData={purchaseProposal}
                                updatedAdditionalPurchaseData={(field, value) => {
                                    updateAdditionalPurchase(index, field, value)
                                }}
                                deleteAdditionalPurchaseData={(deleteId: number) => {
                                    deleteAdditionalPurchase(deleteId)
                                }}

                            />
                        ))}
                </div>
                <Button
                    onClick={() => removeOrderProduct(productId)}
                    variant="danger"
                    className="mt-2">
                    {translate('resources.order.fields.remove_product')}
                </Button>

            </div>
        );
    }
;

