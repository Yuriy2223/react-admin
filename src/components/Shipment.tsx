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
import {ChangeHistoryComponent} from './ChangeHistory';
import {TranslatedTextField} from "./Purchase";

const getStatusChoices = () => {
    const translate = useTranslate();
    return [
        {id: 'CREATED', name: translate('resources.statuses.CREATED')},
        {id: 'SHIPMENT_EXPECTED', name: translate('resources.statuses.SHIPMENT_EXPECTED')},
        {id: 'SHIPPED', name: translate('resources.statuses.SHIPPED')},
        {id: 'DELETED', name: translate('resources.statuses.DELETED')},
    ];
};

export const ShipmentList = () => (
    <List>
        <Datagrid>
            <TextField source="id"
                       label="ID"/>
            <TranslatedTextField source={"state"} label={"resources.shipment.fields.state"}/>
            <ReferenceField
                source="customer"
                reference="warehouse/customer"
                link="show">
                <TextField source="name"/>
            </ReferenceField>
            <ReferenceField
                source='warehouse'
                reference='warehouse/warehouse'
                label='resources.shipment.fields.to_warehouse'/>
            <EditButton/>
        </Datagrid>
    </List>
);

export const ShipmentCreate = () => {
        const translate = useTranslate();

        return [
            <Create>
                <SimpleForm>

                    <ReferenceInput
                        source="customer"
                        reference="warehouse/customer"
                    />

                    <TranslatedTextField source={"state"} label={"resources.shipment.fields.state"}/>

                    <SelectInput
                        source="state"
                        label="resources.shipment.fields.state"
                        choices={getStatusChoices()}
                        defaultValue="CREATED"
                    />

                    <TextInput
                        source="warehouse"
                        label='resources.shipment.fields.to_warehouse'
                        validate={[required()]}
                    />

                    <ArrayInput source="batches"
                                label='resources.shipment.fields.batches'>
                        <SimpleFormIterator>
                            <NumberInput
                                source="shipment_price"
                                label='resources.shipment.fields.shipment_price'
                                validate={[required()]}
                            />

                            <SelectInput
                                source="shipment_status"
                                label='resources.shipment.fields.shipment_status'
                                choices={[
                                    {id: 'WAITING', name: 'Waiting'},
                                    {id: 'SHIPPED', name: 'Shipped'},
                                ]}
                                defaultValue='WAITING'
                                validate={[required()]}
                            />

                            <ArrayInput source="product_groups"
                                        label="resources.shipment.fields.product_groups">
                                <SimpleFormIterator>
                                    <ReferenceInput
                                        source="product"
                                        label="resources.shipment.fields.product"
                                        reference='products'
                                    />
                                    <NumberInput
                                        source="price"
                                        label="resources.shipment.fields.price"
                                        validate={[required()]}
                                    />
                                    <NumberInput
                                        source="quantity"
                                        label="resources.shipment.fields.quantity"
                                        validate={[required()]}
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
        ]
    }
;

export const ShipmentEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceInput
                source="customer"
                reference="warehouse/customer"
            />
            <SelectInput
                source='state'
                label='resources.shipment.fields.state'
                choices={getStatusChoices()}
            />
            <TextInput
                source="warehouse"
                label='resources.shipment.fields.state'
                validate={[required()]}
            />

            <ArrayInput source="batches"
                        label='resources.shipment.fields.batches'>
                <SimpleFormIterator>
                    <NumberInput
                        source="shipment_price"
                        label='resources.shipment.fields.shipment_price'
                        validate={[required()]}
                    />


                    <SelectInput
                        source="shipment_status"
                        label='resources.shipment.fields.shipment_status'
                        choices={[
                            {id: 'WAITING', name: 'Waiting'},
                            {id: 'SHIPPED', name: 'Shipped'},
                        ]}
                        defaultValue='WAITING'
                        validate={[required()]}
                    />

                    <ArrayInput source="product_groups" label="Product Groups">
                        <SimpleFormIterator>
                            <ReferenceInput
                                source="product"
                                label='resources.shipment.fields.product'
                                reference='products'
                            />
                            <NumberInput
                                source="price"
                                label='resources.shipment.fields.price'
                                validate={[required()]}
                            />
                            <NumberInput
                                source="quantity"
                                label='resources.shipment.fields.quantity'
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

export const ShipmentShow = () => {
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

                <TranslatedTextField source={"state"} label={"resources.shipment.fields.state"}/>

                <ReferenceField
                    source="customer"
                    label='resources.shipment.fields.customer'
                    reference="warehouse/customer"
                    link="show">
                    <TextField source="name"/>
                </ReferenceField>

                <ReferenceField
                    source='warehouse'
                    reference='warehouse/warehouse'
                    label='resources.shipment.fields.to_warehouse'/>

                <TextField source="created_by"
                           label="resources.shipment.fields.created_by"/>
                <ArrayField source="batches"
                            label="resources.shipment.fields.batches">
                    <Datagrid>
                        <NumberField source="shipment_price"
                                     label='resources.shipment.fields.shipment_price'/>
                        <TextField source="shipment_status"
                                   label='resources.shipment.fields.shipment_status'/>

                        <TranslatedTextField source={"shipment_status"}
                                             label={"resources.shipment.fields.shipment_status"}/>

                        <ArrayField source="product_groups"
                                    label='resources.shipment.fields.product_groups'>
                            <Datagrid>
                                <ReferenceField source="product"
                                                reference="products"
                                                label='resources.shipment.fields.product'>
                                    <TextField source="name"/>
                                </ReferenceField>
                                <NumberField source="price"
                                             label='resources.shipment.fields.price'/>
                                <NumberField source="quantity"
                                             label='resources.shipment.fields.quantity'/>
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

                    <ChangeHistoryComponent modelName="Shipment" recordId={recordId} isVisible={isHistoryVisible}/>
                </div>
            </SimpleShowLayout>
        </Show>
    );
};
