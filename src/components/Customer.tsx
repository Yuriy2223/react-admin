import React, {useState} from "react";

import {
    ArrayField,
    ChipField,
    Create,
    Datagrid,
    DateField,
    Edit,
    EditButton,
    FunctionField,
    List,
    required,
    SelectInput,
    Show,
    SimpleForm,
    SimpleShowLayout,
    SingleFieldList,
    TextField,
    TextInput,
    useGetRecordId,
    useTranslate
} from "react-admin";
import {ChangeHistoryComponent} from './ChangeHistory';
import "./customer.css";
import {ProgressBar} from "react-bootstrap";

const getFilters = () => {
    const translate = useTranslate();

    return [
        <TextInput source="name"
                   label={translate('resources.customer_supplier.name_customer')}
                   alwaysOn
        />,
        <TextInput source="company_name"
                   label={translate('resources.customer_supplier.fields.company_name')}
        />,
    ];
}

export const CustomerList = () => (
    <List filters={getFilters()}>
        <Datagrid>
            <TextField source="id"
                       label="ID"/>
            <TextField source="name"
                       label='resources.customer_supplier.name_customer'/>
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

export const CustomerCreate = () => (
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

export const CustomerEdit = () => (
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

enum Status {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    COMPLETED = 'COMPLETED',
}

const statusColors = {
    PENDING: 'bg-warning',
    ACTIVE: 'bg-primary',
    CANCELLED: 'bg-danger',
    EXPIRED: 'bg-success',
    COMPLETED: 'bg-success',
};

const statusPercentages = {
    CANCELLED: 0,
    ACTIVE: 66,
    EXPIRED: 0,
    PENDING: 33,
    COMPLETED: 100,
};

export const CustomerShow = () => {
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
                <TextField source="name" label="resources.customer_supplier.fields.name"/>
                <TextField source="company_name" label="resources.customer_supplier.fields.company_name"/>
                <TextField source="address" label="resources.customer_supplier.fields.address"/>
                <TextField source="phone" label="resources.customer_supplier.fields.phone"/>
                <TextField source="email" label="resources.customer_supplier.fields.email"/>
                <TextField source="payment_details" label="resources.customer_supplier.fields.payment_details"/>

                <DateField
                    source="created_at"
                    label="resources.created_at"
                    showTime
                    options={{
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                />
                <DateField
                    source="updated_at"
                    label="resources.updated_at"
                    showTime
                    options={{
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    }}
                />

                <ArrayField source="contracts" label={translate('resources.contract.name')}>


                    <Datagrid>
                        <FunctionField
                            label={translate('resources.contract.fields.status')}
                            render={(record) => {
                                const status = record.status as Status;
                                const statusPercentage = statusPercentages[status] || 0;

                                return (
                                    <ProgressBar
                                        now={statusPercentage}
                                        label={translate(`resources.statuses.${status}`)}
                                        striped
                                        animated
                                        variant="info"
                                    />
                                );
                            }}
                        />

                        <TextField source="id" label="ID"/>
                        <TextField source="name" label={translate('resources.contract.fields.name')}/>
                        <DateField source="start_date"
                                   label={translate('resources.contract.fields.start_date')}/>
                        <DateField source="end_date" label={translate('resources.contract.fields.end_date')}/>
                        <TextField source="created_by" label="resources.created_by"/>

                        <ArrayField source="documents"
                                    label={translate('resources.contract.fields.documents')}>
                            <SingleFieldList>
                                <ChipField source="name" label="Document Name"/>
                            </SingleFieldList>
                        </ArrayField>
                    </Datagrid>
                </ArrayField>


                <div style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                    <h3
                        onClick={toggleHistoryVisibility}
                        style={{cursor: 'pointer', color: 'greenyellow', textDecoration: 'underline'}}
                    >
                        {translate('resources.changeHistory')} {isHistoryVisible ? '▲' : '▼'}
                    </h3>

                    <ChangeHistoryComponent modelName="Customer" recordId={recordId} isVisible={isHistoryVisible}/>
                </div>
            </SimpleShowLayout>
        </Show>
    );
};

