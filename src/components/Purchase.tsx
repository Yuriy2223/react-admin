import React, {useState} from 'react';

import {
    ArrayField,
    ArrayInput,
    Create,
    Datagrid,
    DateField,
    Edit,
    EditButton,
    FunctionField,
    List,
    NumberField,
    NumberInput,
    ReferenceField,
    ReferenceInput,
    required,
    SelectInput,
    Show,
    SimpleForm,
    SimpleFormIterator,
    SimpleShowLayout,
    TextField,
    TextInput,
    useGetRecordId,
    useTranslate,
} from "react-admin";
import {SkuInput} from "./utils";
import {ChangeHistoryComponent} from "./ChangeHistory";

export const TranslatedTextField: React.FC<{ source: string; label?: string }> = ({source, label}) => {
    const translate = useTranslate();

    return (
        <FunctionField
            label={label}
            render={(record: any) => {
                const translated = translate(`resources.statuses.${record[source]}`);
                return translated ? translated : record[source];
            }}
        />
    );
};

const getFilters = () => {
    const translate = useTranslate();
    const statuses = [
        {id: 'CREATED', name: translate('resources.statuses.CREATED')},
        {id: 'SHIPMENT_EXPECTED', name: translate('resources.statuses.SHIPMENT_EXPECTED')},
        {id: 'SHIPPED', name: translate('resources.statuses.SHIPPED')},
        {id: 'DELETED', name: translate('resources.statuses.DELETED')},
    ];
    return [
        <TextInput source="supplier"
                   label={translate('resources.purchase.fields.supplier')}
                   alwaysOn
        />,
        <SelectInput
            label={translate('resources.purchase.fields.state')}
            source="state"
            choices={statuses}
        />,
    ];
}

const getStatusChoices = () => {
    const translate = useTranslate();
    return [
        {id: 'CREATED', name: translate('resources.statuses.CREATED')},
        {id: 'SHIPMENT_EXPECTED', name: translate('resources.statuses.SHIPMENT_EXPECTED')},
        {id: 'SHIPPED', name: translate('resources.statuses.SHIPPED')},
        {id: 'DELETED', name: translate('resources.statuses.DELETED')},
    ];
};


export const PurchaseList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id" label="ID"/>

            <TranslatedTextField source="state" label="resources.purchase.fields.state"/>

            <ReferenceField
                source="supplier"
                reference="warehouse/supplier"
                link="show"
                label='resources.purchase.fields.supplier'>
                <TextField source="name"/>
            </ReferenceField>
            <ReferenceField
                source='warehouse'
                reference='warehouse/warehouse'
                label='resources.purchase.fields.to_warehouse'/>
            <EditButton/>
        </Datagrid>
    </List>
);


export const PurchaseCreate = () => (
    <Create>
        <SimpleForm>
            <ReferenceInput
                source="supplier"
                reference="warehouse/supplier"
            />
            <SelectInput
                source="state"
                label="resources.purchase.fields.state"
                choices={getStatusChoices()}
                defaultValue="CREATED"
            />
            <TextInput
                source="warehouse"
                label='resources.purchase.fields.to_warehouse'
                validate={[required()]}
            />

            <ArrayInput source="batches"
                        label='resources.purchase.fields.batches'>
                <SimpleFormIterator>
                    <NumberInput
                        source="shipment_price"
                        label='resources.purchase.fields.shipment_price'
                        validate={[required()]}
                    />
                    <SelectInput
                        source="shipment_status"
                        label='resources.purchase.fields.shipment_status'
                        choices={[
                            {id: 'WAITING', name: 'Waiting'},
                            {id: 'SHIPPED', name: 'Shipped'},
                        ]}
                        defaultValue='WAITING'
                        validate={[required()]}
                    />

                    <ArrayInput source="product_groups"
                                label="resources.purchase.fields.product_groups">
                        <SimpleFormIterator>
                            <ReferenceInput
                                source="product"
                                reference='products'
                                label="resources.purchase.fields.product"
                            />
                            <NumberInput
                                source="price"
                                validate={[required()]}
                                label="resources.purchase.fields.price"
                            />
                            <NumberInput
                                source="quantity"
                                validate={[required()]}
                                label="resources.purchase.fields.quantity"
                            />
                            <TextInput
                                source="sku"
                                label="SKU"
                            />
                        </SimpleFormIterator>
                    </ArrayInput>
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);

export const PurchaseEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceInput
                source="supplier"
                reference="warehouse/supplier"
            />

            <SelectInput
                source="state"
                label="resources.purchase.fields.state"
                choices={getStatusChoices()}
            />

            <TextInput
                source="warehouse"
                label='resources.purchase.fields.warehouse'
                validate={[required()]}
            />

            <ArrayInput source="batches"
                        label='resources.purchase.fields.batches'>
                <SimpleFormIterator>
                    <NumberInput
                        source="shipment_price"
                        label='resources.purchase.fields.shipment_price'
                        validate={[required()]}
                    />
                    <SelectInput
                        source="shipment_status"
                        label='resources.purchase.fields.shipment_status'
                        choices={[
                            {id: 'WAITING', name: 'Waiting'},
                            {id: 'SHIPPED', name: 'Shipped'},
                        ]}
                        defaultValue='WAITING'
                        validate={[required()]}
                    />

                    <ArrayInput source="product_groups"
                                label="Product Groups">
                        <SimpleFormIterator>
                            <ReferenceInput
                                source="product"
                                label='resources.purchase.fields.product'
                                reference='products'
                            />
                            <NumberInput
                                source="price"
                                label='resources.purchase.fields.price'
                                validate={[required()]}
                            />
                            <NumberInput
                                source="quantity"
                                label='resources.purchase.fields.quantity'
                                validate={[required()]}
                            />
                            <SkuInput/>
                        </SimpleFormIterator>
                    </ArrayInput>
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const PurchaseShow: React.FC = () => {
    const translate = useTranslate();
    const recordId = useGetRecordId();
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    const toggleHistoryVisibility = () => {
        setIsHistoryVisible(!isHistoryVisible);
    };

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id" label="ID"/>

                <TranslatedTextField source="state" label="resources.purchase.fields.state"/>

                <ReferenceField
                    source="supplier"
                    reference="warehouse/supplier"
                    link="show">
                    <TextField source="name"/>
                </ReferenceField>
                <ReferenceField source="warehouse" reference="warehouse/warehouse"
                                label="resources.purchase.fields.to_warehouse"/>
                <TextField source="created_by" label="resources.purchase.fields.created_by"/>

                <ArrayField source="batches" label="resources.purchase.fields.batches">
                    <Datagrid>
                        <NumberField source="shipment_price" label="resources.purchase.fields.shipment_price"/>

                        <TranslatedTextField source={"shipment_status"}
                                             label={"resources.purchase.fields.shipment_status"}/>

                        <ArrayField source="product_groups" label="resources.purchase.fields.product_groups">
                            <Datagrid>
                                <ReferenceField source="product" reference="products"
                                                label="resources.purchase.fields.product">
                                    <TextField source="name"/>
                                </ReferenceField>
                                <NumberField source="price" label="resources.purchase.fields.price"/>
                                <NumberField source="quantity" label="resources.purchase.fields.quantity"/>
                                <TextField source="sku" label="SKU"/>
                            </Datagrid>
                        </ArrayField>
                    </Datagrid>
                </ArrayField>

                <DateField source="created_at" label="resources.created_at" showTime options={{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }}/>
                <DateField source="updated_at" label="resources.updated_at" showTime options={{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }}/>

                <div style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                    <h3 onClick={toggleHistoryVisibility}
                        style={{cursor: 'pointer', color: 'greenyellow', textDecoration: 'underline'}}>
                        {translate('resources.changeHistory')} {isHistoryVisible ? '▲' : '▼'}
                    </h3>

                    <ChangeHistoryComponent modelName="Purchase" recordId={recordId} isVisible={isHistoryVisible}/>
                </div>
            </SimpleShowLayout>
        </Show>
    );
};