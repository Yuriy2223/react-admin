import React from "react";

import {
    Datagrid,
    DateField,
    Edit,
    EditButton, FunctionField,
    List,
    NumberField,
    ReferenceField,
    SelectField,
    SelectInput,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField, TextInput, useTranslate,
} from "react-admin";
import {TranslatedTextField} from "./Purchase";

const getFilters = () => {
    const translate = useTranslate();
    const statuses = [
        {id: 'SHIPMENT_EXPECTED', name: translate('resources.statuses.SHIPMENT_EXPECTED')},
        {id: 'IN_STOCK', name: translate('resources.statuses.IN_STOCK')},
        {id: 'TRANSFERRED_FROM_WAREHOUSE', name: translate('resources.statuses.TRANSFERRED_FROM_WAREHOUSE')},
        {id: 'DELIVERED', name: translate('resources.statuses.DELIVERED')},
        {id: 'TRANSFERRING', name: translate('resources.statuses.TRANSFERRING')},
        {id: 'DELETED', name: translate('resources.statuses.DELETED')},
    ];

    return [
        <TextInput source="product"
                   label={translate('resources.purchase.fields.product')}
                   alwaysOn
        />,
        <SelectInput
            label={translate('resources.purchase.fields.state')}
            source="product_state"
            choices={statuses}
        />,
    ];
}

const getStatusChoices = () => {
    const translate = useTranslate();
    return [
        {id: 'TRANSFERRED_FROM_WAREHOUSE', name: translate('resources.statuses.TRANSFERRED_FROM_WAREHOUSE')},
        {id: 'DELIVERED', name: translate('resources.statuses.DELIVERED')},
    ];
};

export const InventoryProductList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id" label="ID"/>

            <ReferenceField
                source="product"
                label='resources.inventory_products.fields.product'
                reference="products"
                link="show">
                <TextField source="name"/>
            </ReferenceField>

            <NumberField source="price"
                         label='resources.inventory_products.fields.price'/>
            <NumberField source="quantity"
                         label='resources.inventory_products.fields.quantity'/>

            <TranslatedTextField source="product_state" label='resources.inventory_products.fields.state'/>

            <TextField source="inventory"
                       label='resources.inventory_products.fields.inventory'/>
            <EditButton/>
        </Datagrid>
    </List>
);

export const InventoryProductShow = () => (
    <Show>
        <SimpleShowLayout>

            <TextField source="id" label="Id"/>

            <ReferenceField source="product"
                            reference="products"
                            label="resources.inventory_products.fields.product"/>

            <TranslatedTextField source="product_state" label='resources.inventory_products.fields.state'/>

            <NumberField source="price"
                         label='resources.inventory_products.fields.price'/>

            <NumberField source="quantity"
                         label='resources.inventory_products.fields.quantity'/>

            <NumberField source="sku"
                         label="SKU"/>

            <TextField source='batch'
                       label='resources.inventory_products.fields.batch'/>

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

        </SimpleShowLayout>
    </Show>
);

export const InventoryProductEdit = () => (
    <Edit>
        <SimpleForm>
            <TextField source="id" label="Id"/>
            <SelectInput
                source="product_state"
                label='resources.inventory_products.fields.state'
                choices={getStatusChoices()}
            />
        </SimpleForm>
    </Edit>
);
