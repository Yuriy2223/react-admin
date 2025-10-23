import React, {useState} from "react";

import {
    ArrayField,
    ArrayInput,
    Create,
    Datagrid,
    DateField,
    Edit,
    EditButton, FunctionField,
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
import {TranslatedTextField} from "./Purchase";

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


export const TransferList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id" label="ID"/>
            <TranslatedTextField source="state"
                                 label='resources.transfer.fields.state'/>
            <ReferenceField
                source='to_warehouse'
                reference='warehouse/warehouse'
                label='resources.transfer.fields.to_warehouse'/>
            <ReferenceField
                source='from_warehouse'
                reference='warehouse/warehouse'
                label='resources.transfer.fields.from_warehouse'/>
            <EditButton/>
        </Datagrid>
    </List>
);

export const TransferCreate = () => {
    return (<Create>
            <SimpleForm>
                <SelectInput
                    source='state'
                    label='resources.transfer.fields.state'
                    choices={getStatusChoices()}
                    defaultValue='CREATED'
                />
                <ReferenceInput
                    source="to_warehouse"
                    reference='warehouse/warehouse'
                    label='resources.transfer.fields.to_warehouse'
                />
                <ReferenceInput
                    source="from_warehouse"
                    reference='warehouse/warehouse'
                    label='resources.transfer.fields.from_warehouse'
                />
                <ArrayInput source="batches"
                            label='resources.transfer.fields.batches'>
                    <SimpleFormIterator>
                        <NumberInput
                            source="shipment_price"
                            label='resources.transfer.fields.shipment_price'
                            validate={[required()]}
                        />
                        <SelectInput
                            source="shipment_status"
                            label='resources.transfer.fields.shipment_status'
                            choices={[
                                {id: 'WAITING', name: 'Waiting'},
                                {id: 'SHIPPED', name: 'Shipped'},
                            ]}
                            defaultValue='WAITING'
                            validate={[required()]}
                        />

                        <ArrayInput source="product_groups"
                                    label="resources.transfer.fields.product_groups">
                            <SimpleFormIterator>
                                <ReferenceInput
                                    source="product"
                                    reference='products'
                                    label="resources.transfer.fields.product"
                                />
                                <NumberInput
                                    source="price"
                                    validate={[required()]}
                                    label="resources.transfer.fields.price"
                                />
                                <NumberInput
                                    source="quantity"
                                    validate={[required()]}
                                    label="resources.transfer.fields.quantity"
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
};
export const TransferEdit = () => (
    <Edit>
        <SimpleForm>
            <SelectInput
                source='state'
                label='resources.transfer.fields.state'
                choices={getStatusChoices()}
            />
            <ReferenceInput
                source="from_warehouse"
                label='resources.transfer.fields.from_warehouse'
                reference='warehouse/warehouse'
            />
            <ReferenceInput
                source="to_warehouse"
                label='resources.transfer.fields.state'
                reference='warehouse/warehouse'
            />

            <ArrayInput source="batches"
                        label='resources.transfer.fields.batches'>
                <SimpleFormIterator>
                    <NumberInput
                        source="shipment_price"
                        label='resources.transfer.fields.shipment_price'
                        validate={[required()]}
                    />
                    <SelectInput
                        source="shipment_status"
                        label='resources.transfer.fields.shipment_status'
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
                                label='resources.transfer.fields.product'
                                reference='products'
                            />
                            <NumberInput
                                source="price"
                                label='resources.transfer.fields.price'
                                validate={[required()]}
                            />
                            <NumberInput
                                source="quantity"
                                label='resources.transfer.fields.quantity'
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


export const TransferShow = () => {
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
                <TranslatedTextField source="state"
                                     label='resources.transfer.fields.state'/>
                <ReferenceField
                    source='from_warehouse'
                    reference='warehouse/warehouse'
                    label='resources.transfer.fields.from_warehouse'/>
                <ReferenceField
                    source='to_warehouse'
                    reference='warehouse/warehouse'
                    label='resources.transfer.fields.to_warehouse'/>
                <TextField source="created_by"
                           label="resources.transfer.fields.created_by"/>
                <ArrayField source="batches"
                            label="resources.transfer.fields.batches">
                    <Datagrid>
                        <NumberField source="shipment_price"
                                     label='resources.transfer.fields.shipment_price'/>
                        <TextField source="shipment_status"
                                   label='resources.transfer.fields.shipment_status'/>
                        <ArrayField source="product_groups"
                                    label='resources.transfer.fields.product_groups'>
                            <Datagrid>
                                <ReferenceField source="product"
                                                reference="products"
                                                label='resources.transfer.fields.product'>
                                    <TextField source="name"/>
                                </ReferenceField>
                                <NumberField source="price"
                                             label='resources.transfer.fields.price'/>
                                <NumberField source="quantity"
                                             label='resources.transfer.fields.quantity'/>
                                <TextField source="sku"
                                           label="SKU"/>
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

                    <ChangeHistoryComponent modelName="Transfer" recordId={recordId} isVisible={isHistoryVisible}/>
                </div>


            </SimpleShowLayout>
        </Show>
    );
};