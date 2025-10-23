import React, {useState} from "react";
import {InvSupplyData} from "../orderProducts/orderProducts";
import {useTranslate} from "react-admin";

export const InventorySupplyComponent = ({
                                             inventoryData,
                                             updateChosenQuantity
                                         }: {
    inventoryData: InvSupplyData;
    updateChosenQuantity: (id: number, quantity: number) => void;
}) => {
    const translate = useTranslate();
    const [chosenQuantity, setChosenQuantity] = useState(inventoryData.chosen_quantity);

    const handleQuantityChange = (value: number) => {
        const maxQuantity = inventoryData.quantity || 0;
        if (value > maxQuantity) {
            alert("Chosen quantity cannot be greater than the available quantity");
        }
        const newValue = Math.min(value, maxQuantity);
        setChosenQuantity(newValue);
        inventoryData.chosen_quantity = newValue;
        updateChosenQuantity(inventoryData.id, newValue);
    };


    return (
        <tr style={{textAlign: "center"}}>
            <td>
                {translate(`resources.statuses.${inventoryData.product_state}`, {
                    _: "Невідомий статус",
                })}
            </td>
            <td>{inventoryData.price}</td>
            <td>{inventoryData.quantity}</td>
            <td>
                <input
                    className="form-control"
                    type="number"
                    value={chosenQuantity}
                    min={0}
                    max={inventoryData.quantity || 0}
                    onChange={(e) => handleQuantityChange(Number(e.target.value))}
                    style={{width: "100%"}}
                />
            </td>
        </tr>
    );
};

