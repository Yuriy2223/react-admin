import React, {useState} from "react";
import {
    ArrayField,
    Create,
    Datagrid,
    DateField,
    DateInput,
    Edit,
    EditButton,
    FunctionField,
    List,
    NumberField,
    ReferenceField,
    ReferenceInput,
    required,
    SelectInput,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    useGetRecordId,
    useTranslate,
} from "react-admin";
import {ChangeHistoryComponent} from "./ChangeHistory";
import FileUploader from "../FileUploader";
import {TranslatedTextField} from "./Purchase";


const PaymentTypeField: React.FC<{ source: string; label: string }> = (props) => {
    const translate = useTranslate();

    const paymentTypeLabels: Record<string, string> = {
        COD: translate('resources.contract.fields.payment_types.cod', 'Cash on Delivery'),
        ADV: translate('resources.contract.fields.payment_types.adv', 'Advance Payment'),
    };

    return (
        <FunctionField
            {...props}
            render={(record: any) =>
                paymentTypeLabels[record?.[props.source]] || record?.[props.source]
            }
        />
    );
};

const getFilters = () => {
    const translate = useTranslate();
    const statuses = [
        {id: 'PENDING', name: translate('resources.statuses.PENDING')},
        {id: 'ACTIVE', name: translate('resources.statuses.ACTIVE')},
        {id: 'CANCELLED', name: translate('resources.statuses.CANCELLED')},
        {id: 'EXPIRED', name: translate('resources.statuses.EXPIRED')},
        {id: 'COMPLETED', name: translate('resources.statuses.COMPLETED')},
    ];

    return [
        <TextInput label={translate('resources.search')} source="q" alwaysOn/>,
        <SelectInput
            label={translate('resources.order.fields.order_status')}
            source="status"
            choices={statuses}
        />,
        <DateInput label={translate('resources.start_date_from')} source="start_date_from"/>,
        <DateInput label={translate('resources.start_date_to')} source="start_date_to"/>,
        <DateInput label={translate('resources.end_date_from')} source="end_date_from"/>,
        <DateInput label={translate('resources.end_date_to')} source="end_date_to"/>,
    ];
}

export const ContractList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id"/>
            <TextField source="name"
                       label='resources.contract.fields.name'
            />
            <ReferenceField
                source="customer"
                label='resources.contract.fields.customer'
                reference="warehouse/customer"
                link="show">
                <TextField source="name"/>
            </ReferenceField>

            <TranslatedTextField source="status" label="resources.contract.fields.status"/>

            <DateField source="start_date"
                       label='resources.contract.fields.start_date'
            />
            <DateField source="end_date"
                       label='resources.contract.fields.end_date'
            />
            <EditButton/>
        </Datagrid>
    </List>
);

const ContractStatusChoices = [
    {id: "PENDING", name: "PENDING"},
    {id: "ACTIVE", name: "ACTIVE"},
    {id: "CANCELLED", name: "CANCELLED"},
    {id: "EXPIRED", name: "EXPIRED"},
    {id: "COMPLETED", name: "COMPLETED"},
];

export const ContractCreate = () => {
    const translate = useTranslate();
    return (<Create>
            <SimpleForm>
                <TextInput
                    source="name"
                    label='resources.contract.fields.name'
                    validate={[required()]}
                />
                <ReferenceInput
                    source="customer"
                    reference="warehouse/customer"
                />
                <SelectInput
                    source='status'
                    label='resources.contract.fields.status'
                    choices={ContractStatusChoices}
                    defaultValue='PENDING'
                />
                <DateInput source="start_date"
                           label='resources.contract.fields.start_date'
                           validate={[required()]}
                />
                <DateInput source="end_date"
                           label='resources.contract.fields.end_date'
                           validate={[required()]}
                />
                <FileUploader source='documents'
                              uploadEndpoint='contracts'
                              label={translate('resources.documents')}/>
            </SimpleForm>
        </Create>
    );
}

export const ContractEdit = () => {
    const translate = useTranslate();
    return (<Edit>
            <SimpleForm>
                <TextInput
                    source="name"
                    label='resources.contract.fields.name'
                    validate={[required()]}
                />
                <ReferenceInput
                    source="customer"
                    reference="warehouse/customer"
                />
                <SelectInput
                    source='status'
                    label='resources.contract.fields.status'
                    choices={ContractStatusChoices}
                    defaultValue='PENDING'
                />
                <DateInput source="start_date"
                           label='resources.contract.fields.start_date'
                           validate={[required()]}
                />
                <DateInput source="end_date"
                           label='resources.contract.fields.end_date'
                           validate={[required()]}
                />
                <FileUploader source='documents'
                              uploadEndpoint='contracts'
                              label={translate('resources.documents')}/>
            </SimpleForm>
        </Edit>
    );
}
export const ContractShow = () => {
    const translate = useTranslate();
    const recordId = useGetRecordId();
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const toggleHistoryVisibility = () => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id"
                           label="ID"/>

                <TextField source="name"
                           label='resources.contract.fields.name'/>

                <ReferenceField
                    source="customer"
                    reference="warehouse/customer"
                    label='resources.contract.fields.customer'
                    link="show">
                    <TextField source="name"/>
                </ReferenceField>

                <TranslatedTextField source="status" label="resources.contract.fields.status"/>

                <DateField source="start_date" showTime options={{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }}
                           label='resources.contract.fields.start_date'/>

                <DateField source="end_date" showTime options={{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }}
                           label='resources.contract.fields.end_date'/>

                <ArrayField source="orders"
                            label='resources.contract.fields.orders'
                >
                    <Datagrid>
                        <NumberField source="id"
                                     label="ID"
                        />
                        <TextField source="order_number"
                                   label="resources.contract.fields.order_number"
                        />

                        <TextField source="status"
                                   label="resources.contract.fields.order_status"
                        />

                        <PaymentTypeField source="payment_type" label="resources.contract.fields.payment_type"/>

                        <ArrayField source="products"
                                    label="resources.contract.fields.products"
                        >
                            <Datagrid>
                                <ReferenceField source="product" reference="products"
                                                label="resources.purchase.fields.product">
                                    <TextField source="name"/>
                                </ReferenceField>
                                <NumberField source="price" label="resources.purchase.fields.price"/>
                                <NumberField source="quantity" label="resources.purchase.fields.quantity"/>
                            </Datagrid>
                        </ArrayField>
                    </Datagrid>
                </ArrayField>

                <DateField
                    source="created_at"
                    label='resources.created_at'
                    showTime
                    options={{year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}}
                />
                <DateField
                    source="updated_at"
                    label='resources.updated_at'
                    showTime
                    options={{year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}}
                />

                <div style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                    <h3 onClick={toggleHistoryVisibility}
                        style={{cursor: 'pointer', color: 'greenyellow', textDecoration: 'underline'}}>
                        {translate('resources.changeHistory')} {isHistoryVisible ? '▲' : '▼'}
                    </h3>

                    <ChangeHistoryComponent modelName="Supplier" recordId={recordId} isVisible={isHistoryVisible}/>
                </div>
            </SimpleShowLayout>
        </Show>
    );
};

