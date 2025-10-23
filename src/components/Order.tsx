import React, {useState} from "react";
import {
    Datagrid,
    DateField,
    DateInput,
    EditButton,
    FunctionField,
    List,
    NumberInput,
    ReferenceField,
    SelectInput,
    Show,
    SimpleShowLayout,
    TextField,
    TextInput,
    useGetRecordId,
    useTranslate,
} from "react-admin";
import {ChangeHistoryComponent} from "./ChangeHistory";
import {TranslatedTextField} from "./Purchase";
import {DownloadComponent} from "./createOrder/orderCreate/DownloadComponent";

const getFilters = () => {
    const translate = useTranslate();
    const statuses = [
        {id: 'PENDING', name: translate('resources.statuses.PENDING')},
        {id: 'CONFIRMED', name: translate('resources.statuses.CONFIRMED')},
        {id: 'CANCELLED', name: translate('resources.statuses.CANCELLED')},
        {id: 'SHIPPED', name: translate('resources.statuses.SHIPPED')},
        {id: 'DELIVERED', name: translate('resources.statuses.DELIVERED')},
        {id: 'COMPLETED', name: translate('resources.statuses.COMPLETED')},
    ];
    return [
        <NumberInput label={translate('resources.order.fields.order_number')}
                     source="order_number"
                     alwaysOn/>,
        <TextInput source="customer"
                   label={translate('resources.order.fields.customer')}
        />,
        <SelectInput
            label={translate('resources.order.fields.order_status')}
            source="status"
            choices={statuses}
        />,
        <NumberInput label={translate('resources.created_by')}
                     source='created_by'
        />,
        <DateInput label={translate('resources.created_at_from')} source="created_at_from"/>,
        <DateInput label={translate('resources.created_at_to')} source="created_at_to"/>,

    ];
}

export const OrderList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id"/>
            <TextField source="order_number"
                       label={"resources.order.fields.order_number"}
            />
            <ReferenceField
                source="customer"
                label={"resources.order.fields.customer"}
                reference="warehouse/customer"
                link="show">
                <TextField source="name"/>
            </ReferenceField>
            <TranslatedTextField source={"order_status"} label={"resources.order.fields.state"}/>
            <DateField source="created_at"
                       label={"resources.created_at"}
            />
            <TextField source={'created_by'}
                       label={"resources.created_by"}
            />
            <EditButton/>
            <FunctionField
                label="Download PDF"
                render={(record: any) => (
                    <DownloadComponent
                        recordId={record.id}
                        entity={"order"}
                        downloadUrl={`${import.meta.env.VITE_API_URL}/orders/pdf`}
                        disabled={false}
                    />
                )}
            />
        </Datagrid>
    </List>
);

export const OrderShow = () => {
    const translate = useTranslate();
    const recordId = useGetRecordId();
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const toggleHistoryVisibility = () => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id"/>
                <TextField source="order_number"
                           label={"resources.order.fields.order_number"}
                />
                <ReferenceField
                    source="customer"
                    reference="warehouse/customer"
                    label={"resources.order.fields.customer"}
                    link="show">
                    <TextField source="name"/>
                </ReferenceField>

                <TranslatedTextField source={"order_status"}
                                     label={"resources.order.fields.state"}/>

                <DateField
                    source="created_at"
                    label={"resources.created_at"}
                    showTime
                    options={{year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}}
                />

                <DateField
                    source="updated_at"
                    label={"resources.updated_at"}
                    showTime
                    options={{year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}}
                />

                <div style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                    <h3 onClick={toggleHistoryVisibility}
                        style={{cursor: 'pointer', color: 'greenyellow', textDecoration: 'underline'}}>
                        {translate('resources.changeHistory')} {isHistoryVisible ? '▲' : '▼'}
                    </h3>

                    <ChangeHistoryComponent modelName="Order" recordId={recordId} isVisible={isHistoryVisible}/>
                </div>
            </SimpleShowLayout>
        </Show>
    );
};
