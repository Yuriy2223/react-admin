import React, {useState} from "react";
import {useTranslate} from "react-admin";
import {Button} from "@mui/material";
import ExportDocuments from "../exportDocuments/exportDocuments";
import {OrderEdit} from "../editOrder/orderEdit/orderEdit";
import {useParams} from "react-router-dom";
import ExpenditureInvoices from "../expenditureInvoices/ExpenditureInvoices";

const OrderEditWrapper = () => {
    const [viewMode, setViewMode] = useState<"create" | "export" | "realization">('create');
    const translate = useTranslate();
    const {id} = useParams<{ id: string }>();

    const buttons: { viewMode: "create" | "export" | "realization"; label: string }[] = [
        {viewMode: "create", label: "resources.order.fields.create_order"},
        {viewMode: "export", label: "resources.order.fields.export_documents"},
        {viewMode: "realization", label: "resources.order.fields.realization"},
    ];

    const buttonStyle = {
        marginBottom: "10px",
        marginTop: "10px",
        marginRight: "10px",
    };

    return (
        <div>
            <div style={{justifyContent: "space-between", marginBottom: "20px"}}>
                {buttons.map((btn, index) => (
                    <Button
                        key={index}
                        style={buttonStyle}
                        variant="outlined"
                        size="medium"
                        disabled={viewMode === btn.viewMode}
                        onClick={() => setViewMode(btn.viewMode)}
                    >
                        {translate(btn.label)}
                    </Button>
                ))}
            </div>
            {viewMode === "create" ? <OrderEdit id={id}/> : viewMode === "export" ?
                <ExportDocuments orderId={id}/> :
                <ExpenditureInvoices orderId={id}/>}
        </div>
    );
}

export default OrderEditWrapper;