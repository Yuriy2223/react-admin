import React, {useState} from "react";

import {
    Create,
    Datagrid,
    DateField,
    Edit,
    EditButton,
    List,
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
import {ChangeHistoryComponent} from './ChangeHistory';

const getFilters = () => {
    const translate = useTranslate();

    return [
        <TextInput source="name"
                   label={translate('resources.customer_supplier.name_supplier')}
                   alwaysOn
        />,
        <TextInput source="company_name"
                   label={translate('resources.customer_supplier.fields.company_name')}
        />,
    ];
}

export const SupplierList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id"
                       label="ID"/>
            <TextField source="name"
                       label='resources.customer_supplier.fields.name'/>
            <TextField source="company_name"
                       label='resources.customer_supplier.fields.company_name'/>
            <TextField source="address"
                       label='resources.customer_supplier.fields.address'/>
            <TextField source="phone"
                       label='resources.customer_supplier.fields.phone'/>
            <TextField source="email"
                       label='resources.customer_supplier.fields.email'/>
            <TextField source="payment_details"
                       label='resources.customer_supplier.fields.payment_details'/>

            <EditButton/>
        </Datagrid>
    </List>
);

export const SupplierCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source="name"
                label='resources.customer_supplier.fields.name'
                validate={[required()]}
            />
            <TextInput
                source="company_name"
                label='resources.customer_supplier.fields.company_name'
                validate={[required()]}
            />
            <TextInput
                source="address"
                label='resources.customer_supplier.fields.address'
            />
            <TextInput
                source="phone"
                label='resources.customer_supplier.fields.phone'
                validate={[required()]}
            />
            <TextInput
                source="email"
                label='resources.customer_supplier.fields.email'
                validate={[required()]}
            />
            <TextInput
                source="payment_details"
                label='resources.customer_supplier.fields.payment_details'
            />
        </SimpleForm>
    </Create>
);

export const SupplierEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput
                source="name"
                label='resources.customer_supplier.fields.name'
                validate={[required()]}
            />
            <SelectInput
                source='company_name'
                label='resources.customer_supplier.fields.company_name'
                validate={[required()]}
            />
            <TextInput
                source="address"
                label='resources.customer_supplier.fields.address'
            />
            <TextInput
                source="phone"
                label='resources.customer_supplier.fields.phone'
                validate={[required()]}
            />
            <SelectInput
                source='email'
                label='resources.customer_supplier.fields.email'
                validate={[required()]}
            />
            <TextInput
                source="payment_details"
                label='resources.customer_supplier.fields.payment_details'
            />
        </SimpleForm>
    </Edit>
);

export const SupplierShow = () => {
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
                           label='resources.customer_supplier.fields.name'/>
                <TextField source="company_name"
                           label='resources.customer_supplier.fields.company_name'/>
                <TextField source="address"
                           label='resources.customer_supplier.fields.address'/>
                <TextField source="phone"
                           label='resources.customer_supplier.fields.phone'/>
                <TextField source="email"
                           label='resources.customer_supplier.fields.email'/>
                <TextField source="payment_details"
                           label='resources.customer_supplier.fields.payment_details'/>

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

