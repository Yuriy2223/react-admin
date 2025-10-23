import React, {useState} from "react";
import {AutocompleteInput, ReferenceInput, SimpleForm, useTranslate} from "react-admin";
import {Button, ProgressBar} from "react-bootstrap";
import './additionalPurchaseItem.css'
import '../orderProducts/orderProducts.css'
import FileUploaderComponent from "../../../FileUploaderComponent";

export interface AdditionalPurchaseData {
    id: number;
    proposal: AdditionalPurchaseProposalData[] | [];
}

export interface AdditionalPurchaseProposalData {
    id: number;
    productId: number | undefined;
    quantity: number | undefined;
    price: number | undefined;
    delivery_date: Date | undefined;
    delivery_price: number | undefined;
    supplier: number | undefined;
    chosen_quantity: number | undefined;
    proposal_state: string | undefined;
    additional_documents: number[] | undefined;
}

export enum Status {
    WAITING_FOR_APPROVE = "Waiting for approval",
    WAITING_FOR_INVOICE = "Waiting for invoice",
    WAITING_FOR_PAY = "Waiting for payment",
    PAID_BY_ACCOUNTANT = "Paid by accountant",
    WAITING_FOR_DELIVERY = "Waiting for delivery",
}

export const statusColors: Record<Status, string> = {
    [Status.WAITING_FOR_APPROVE]: "danger",
    [Status.WAITING_FOR_INVOICE]: "danger",
    [Status.WAITING_FOR_PAY]: "info",
    [Status.PAID_BY_ACCOUNTANT]: "primary",
    [Status.WAITING_FOR_DELIVERY]: "success",
};

export const statusPercentages: Record<Status, number> = {
    [Status.WAITING_FOR_APPROVE]: 10,
    [Status.WAITING_FOR_INVOICE]: 25,
    [Status.WAITING_FOR_PAY]: 50,
    [Status.PAID_BY_ACCOUNTANT]: 75,
    [Status.WAITING_FOR_DELIVERY]: 100,
};

export const AdditionalPurchaseComponent = ({
                                                additionalPurchaseData,
                                                updatedAdditionalPurchaseData,
                                                deleteAdditionalPurchaseData
                                            }: {
    additionalPurchaseData: AdditionalPurchaseData;
    updatedAdditionalPurchaseData: (field: string, value: any) => void;
    deleteAdditionalPurchaseData: (id: number) => void;
}) => {
    const translate = useTranslate();
    const [additionalPurchaseProposalId, setAdditionalPurchaseProposalId] = useState<number>(0);
    const [additionalPurchaseId, setAdditionalPurchaseId] = useState<number>(additionalPurchaseData.id);
    const [proposal, setProposal] = useState<AdditionalPurchaseProposalData[]>(additionalPurchaseData.proposal || []);

    const notifyChange = (updatedProposals: AdditionalPurchaseProposalData[]) => {
        updatedAdditionalPurchaseData("proposal", updatedProposals);
    };

    const addAdditionalPurchaseProposal = () => {
        const newProposal: AdditionalPurchaseProposalData = {
            id: additionalPurchaseProposalId,
            productId: undefined,
            quantity: undefined,
            price: undefined,
            delivery_date: undefined,
            delivery_price: undefined,
            supplier: undefined,
            chosen_quantity: undefined,
            proposal_state: undefined,
            additional_documents: []
        };
        const updatedProposal = [...proposal, newProposal];
        setAdditionalPurchaseProposalId(additionalPurchaseProposalId + 1);
        setProposal(updatedProposal);
        notifyChange(updatedProposal);
        console.log("New proposal added:", newProposal);
    };


    const updateProposalItem = (index: number, field: string, value: any) => {
        const updated = [...proposal];
        updated[index] = {...updated[index], [field]: value};
        setProposal(updated);
        notifyChange(updated);
    };

    const deleteProposal = (id: number) => {
        const updatedProposals = proposal.filter(
            (proposal) => proposal.id !== id
        );
        setProposal(updatedProposals);
        notifyChange(updatedProposals);
    };

    const totalAdditionalPurchasePrice = () => {
        return proposal.reduce((acc, proposal) => {
            return acc + (proposal.price || 0) * (proposal.chosen_quantity || 0);
        }, 0);
    }

    const totalAdditionalPurchaseQuantity = () => {
        return proposal.reduce((acc, proposal) => {
            return acc + (proposal.chosen_quantity || 0);
        }, 0);
    }

    const totalDeliveryPrice = () => {
        return proposal.reduce((acc, proposal) => {
            return acc + (proposal.delivery_price || 0);
        }, 0);
    }

    const calculateAveragePurchasePrice = () => {
        return (totalAdditionalPurchasePrice() + totalDeliveryPrice()) / totalAdditionalPurchaseQuantity();
    }


    return (
        <div>
            <div>
                <div className="calc-block">

                    <div className="p-2">
                        <strong> {translate('resources.order.fields.full_price_for_additional_proposals')}</strong><br/>
                        <span>{totalAdditionalPurchasePrice().toFixed(2)}</span>
                    </div>

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.total_chosen_additional_quantity')}</strong><br/>
                        <span>{totalAdditionalPurchaseQuantity()}</span>
                    </div>

                    <div className="p-2">
                        <strong>{translate('resources.order.fields.average_price_for_additional')}</strong><br/>
                        <span>{calculateAveragePurchasePrice().toFixed(2)}</span>
                    </div>

                </div>
            </div>

            <div className={"button-sector"}>
                <div>
                    <Button variant={"primary"}
                            onClick={addAdditionalPurchaseProposal}>{translate('resources.order.fields.add_proposal')}</Button>
                </div>

                <div>
                    <Button variant={"danger"}
                            onClick={() => deleteAdditionalPurchaseData(additionalPurchaseData.id)}>{translate('resources.order.fields.delete_tender')}
                    </Button>
                </div>
            </div>

            <div>
                <h4>{translate('resources.order.fields.proposals')}</h4><br/>
                {proposal.map((purchaseProposals, index) => (
                    <AdditionalPurchaseProposalComponent
                        key={index}
                        additionalPurchaseId={additionalPurchaseId}
                        proposalData={purchaseProposals}
                        updateProposal={(field, value) => updateProposalItem(index, field, value)}
                        deleteProposal={deleteProposal}
                    />
                ))}
            </div>
        </div>
    );
};

const AdditionalPurchaseProposalComponent = ({
                                                 proposalData,
                                                 updateProposal,
                                                 deleteProposal,
                                                 additionalPurchaseId
                                             }: {
    proposalData: AdditionalPurchaseProposalData;
    additionalPurchaseId: number;
    updateProposal: (field: keyof AdditionalPurchaseProposalData, value: any) => void;
    deleteProposal: (id: number) => void;
}) => {
    const translate = useTranslate();
    const [id, setId] = useState<number>(proposalData.id);
    const [price, setPrice] = useState<number>(proposalData.price || 0);
    const [proposalDocuments, setProposalDocuments] = useState<number[]>([]);
    const [quantity, setQuantity] = useState<number>(proposalData.quantity || 0);
    const [supplier_id, setSupplierId] = useState<number | undefined>(proposalData.supplier);
    const [delivery_date, setDeliveryDate] = useState<Date | undefined>(proposalData.delivery_date);
    const [delivery_price, setDeliveryPrice] = useState<number | undefined>(proposalData.delivery_price);
    const [chosen_quantity, setChosenQuantity] = useState<number | undefined>(proposalData.chosen_quantity);
    const [proposal_state, setProposalState] = useState<string | undefined>(proposalData.proposal_state);

    const handleFieldChange = (field: keyof AdditionalPurchaseProposalData, value: any) => {
        switch (field) {
            case "quantity":
                setQuantity(value);
                break;
            case "price":
                setPrice(value);
                break;
            case "delivery_date":
                setDeliveryDate(value);
                break;
            case "delivery_price":
                setDeliveryPrice(value);
                break;
            case "supplier":
                setSupplierId(value);
                break;
            case "additional_documents":
                setProposalDocuments(value.map((id: string) => parseInt(id)));
                break;
            case "proposal_state":
                setProposalState(value as Status);
                break;
            case "chosen_quantity":
                if (value > quantity) {
                    alert("Chosen quantity cannot be greater than the available quantity");
                    return;
                }
                setChosenQuantity(value);
                break;
        }
        updateProposal(field, value);
    };

    const adaptStatusToTranslationKey = (status: string): string => {
        const formattedStatus = status.replace(/ /g, "_").toUpperCase();
        return translate(`resources.statuses.${formattedStatus}`);
    };

    return (
        <form className="row g-3 form-group">
            {proposal_state !== undefined && proposal_state !== "" && (
                <div className={"progress-bar-field"}>
                    <ProgressBar
                        now={statusPercentages[proposal_state as Status]}
                        label={`${adaptStatusToTranslationKey(proposal_state)}`}
                        striped
                        animated
                        variant={statusColors[proposal_state as Status]}
                    />
                </div>
            )}

            <div className="col-md-2">
                <label htmlFor="quantity"
                       className="form-label">{translate('resources.order.fields.quantity')}</label>
                <input
                    className="form-control"
                    type="number"
                    value={proposalData.quantity || ""}
                    min={0}
                    onChange={(e) => handleFieldChange("quantity", Number(e.target.value))}
                />
            </div>

            <div className="col-md-2">
                <label htmlFor="price"
                       className="form-label">{translate('resources.order.fields.price')}</label>
                <input
                    className="form-control"
                    type="number"
                    value={proposalData.price || ""}
                    min={0}
                    step="0.1"
                    onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                />
            </div>

            <div className="col-md-3">
                <label htmlFor="delivery-date"
                       className="form-label">{translate('resources.order.fields.estimated_delivery_date')}</label>
                <input
                    className={"form-control"}
                    type="date"
                    value={proposalData.delivery_date
                        ? new Date(proposalData.delivery_date).toISOString().split("T")[0]
                        : new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                    onChange={(e) => handleFieldChange("delivery_date", e.target.value)}
                />
            </div>

            <div className="col-md-3">
                <label htmlFor="delivery-price"
                       className="form-label">{translate('resources.order.fields.estimated_delivery_price')}</label>
                <input
                    className={"form-control"}
                    type="number"
                    value={proposalData.delivery_price || ""}
                    min={0}
                    step={"0.1"}
                    onChange={(e) => handleFieldChange("delivery_price", Number(e.target.value))}
                />
            </div>

            <div className="col-md-2">
                <label htmlFor="chosen-quantity"
                       className="form-label">{translate('resources.order.fields.chosen_quantity')}</label>
                <input
                    className={"form-control"}
                    type="number"
                    value={proposalData.chosen_quantity || ""}
                    min={0}
                    onChange={(e) => handleFieldChange("chosen_quantity", Number(e.target.value))}
                />
            </div>

            {proposalData.chosen_quantity !== undefined && proposalData.chosen_quantity !== 0 && (
                <div className="col-md-3 w-auto">
                    <label htmlFor="options-select"
                           className="form-label">{translate('resources.order.fields.proposal_status')}</label>
                    <select
                        id="options-select"
                        className="form-select"
                        value={proposal_state}
                        onChange={(e) => handleFieldChange("proposal_state", e.target.value)}
                    >
                        <option value="">{translate('resources.order.fields.select_an_option')}</option>
                        <option
                            value={Status.WAITING_FOR_APPROVE}>{translate('resources.statuses.WAITING_FOR_APPROVE')}</option>
                        <option
                            value={Status.WAITING_FOR_INVOICE}>{translate('resources.statuses.WAITING_FOR_INVOICE')}</option>
                        <option
                            value={Status.WAITING_FOR_PAY}>{translate('resources.statuses.WAITING_FOR_PAYMENT')}</option>
                        <option
                            value={Status.PAID_BY_ACCOUNTANT}>{translate('resources.statuses.PAID_BY_ACCOUNTANT')}</option>
                        <option
                            value={Status.WAITING_FOR_DELIVERY}>{translate('resources.statuses.WAITING_FOR_DELIVERY')}</option>
                    </select>

                    <SimpleForm toolbar={false}>
                        <FileUploaderComponent
                            id={Number(`${additionalPurchaseId}${proposalData.id}`)}
                            source='additional_documents'
                            uploadEndpoint='additional-purchase'
                            files={undefined}
                            label={translate('resources.documents')}
                            onChange={(fileIds) => handleFieldChange('additional_documents', fileIds)}
                        />
                    </SimpleForm>
                </div>
            )}

            <div className={'under-line'}>
                <div>
                    <SimpleForm
                        style={{
                            width: "100%",
                            height: "30px",
                        }}
                        toolbar={false}
                        record={{supplier_id: proposalData.supplier}}>
                        <ReferenceInput
                            source="supplier_id"
                            reference="warehouse/supplier"
                            placeholder="Select a supplier"
                            filterToQuery={(searchText: string) => (searchText.length >= 3 ? {name: searchText} : {})}
                        >
                            <AutocompleteInput
                                optionText="name"
                                shouldRenderSuggestions={(value: string) => value.length >= 1}
                                helperText={translate('resources.order.fields.help_text_supplier')}
                                noOptionsText="No options available. Please try again."
                                onChange={(e: any) => handleFieldChange("supplier", e)}
                            />
                        </ReferenceInput>
                    </SimpleForm>
                </div>

                <div>
                    <Button variant="info"
                            onClick={() => handleFieldChange("chosen_quantity", quantity)}>{translate('resources.max')}</Button>
                </div>
                <div>
                    <Button variant="danger"
                            onClick={() => deleteProposal(proposalData.id)}>{translate('resources.delete')}</Button>
                </div>
            </div>
        </form>

    );
};