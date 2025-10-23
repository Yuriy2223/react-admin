import React, {useEffect, useState} from 'react';

import {
    Create,
    Datagrid,
    List,
    ReferenceField,
    required,
    SelectInput,
    SimpleForm,
    TextField,
    useDataProvider,
} from "react-admin";

interface Warehouse {
    id: number;
    name: string;
}

export const InventoryList = () => (
    <List>
        <Datagrid>
            <TextField source='id' label='ID'/>
            <ReferenceField
                source='warehouse'
                reference='warehouse/warehouse'
                label='resources.inventory.fields.warehouse'/>
        </Datagrid>
    </List>
);

export const InventoryCreate = () => {
    const dataProvider = useDataProvider();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

    useEffect(() => {
        dataProvider.getList('warehouse/warehouse', {
            pagination: {page: 1, perPage: 100},
            sort: {field: 'name', order: 'ASC'},
        }).then(({data}) => {
            setWarehouses(data as Warehouse[]);
        }).catch(error => {
            console.error("Error fetching warehouses", error);
        });
    }, [dataProvider]);

    return (
        <Create>
            <SimpleForm>
                <SelectInput
                    source="warehouse"
                    label='resources.inventory.fields.warehouse'
                    choices={warehouses.map((warehouse: Warehouse) => ({
                        id: warehouse.id,
                        name: warehouse.name,
                    }))}
                    validate={[required()]}
                />
            </SimpleForm>
        </Create>
    );
};