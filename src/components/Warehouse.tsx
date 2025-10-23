import React, {useEffect, useState} from "react";
import {
    Create,
    Datagrid,
    Edit,
    EditButton,
    List,
    maxLength,
    minLength,
    required,
    Show,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    useDataProvider,
    useGetRecordId,
    useTranslate,
} from "react-admin";
import {ChangeHistory, formatDate, toggleHistoryVisibility} from "./utils";

export const WarehouseList = () => {
    return (<List>
            <Datagrid>
                <TextField source='id'/>
                <TextField source='name' label='resources.warehouse.fields.name'/>
                <TextField source='country' label='resources.warehouse.fields.country'/>
                <TextField source='city' label='resources.warehouse.fields.city'/>
                <TextField source='address' label='resources.warehouse.fields.address'/>
                <EditButton/>
            </Datagrid>
        </List>
    );
};
export const WarehouseCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput
                source='name'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.name'
            />
            <TextInput
                source='country'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.country'
            />
            <TextInput
                source='city'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.city'
            />
            <TextInput
                source='address'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.address'
            />
        </SimpleForm>
    </Create>
);

export const WarehouseEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput
                source='name'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.name'
            />
            <TextInput
                source='country'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.country'
            />
            <TextInput
                source='city'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.city'
            />
            <TextInput
                source='address'
                validate={[required(), minLength(1), maxLength(255)]}
                label='resources.warehouse.fields.address'
            />
        </SimpleForm>
    </Edit>
);

export const WarehouseShow = () => {
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const recordId = useGetRecordId();
    const [history, setHistory] = useState<ChangeHistory[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    useEffect(() => {
        console.log("Recordid:", recordId);
        if (recordId) {
            const fetchChangeHistory = async () => {
                try {
                    const modelName = 'Warehouse';
                    const {data} = await dataProvider.getList('history', {
                        filter: {model_name: modelName, instance_id: recordId},
                    });
                    console.log("Fetched change history data:", data);
                    setHistory(data);

                    console.log("Отримані дані з історії змін:", data);
                } catch (error) {
                    console.error("Error fetching change history:", error);
                }
            };

            fetchChangeHistory();
        } else {
            console.warn("Record не знайдено або не має id");
        }
    }, [dataProvider, recordId]);

    return (
        <Show>
            <SimpleShowLayout>
                <TextField source='name' label='resources.warehouse.fields.name'/>
                <TextField source='country' label='resources.warehouse.fields.country'/>
                <TextField source='city' label='resources.warehouse.fields.city'/>
                <TextField source='address' label='resources.warehouse.fields.address'/>

                <div style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                    <h3
                        onClick={toggleHistoryVisibility(setIsHistoryVisible)}
                        style={{cursor: 'pointer', color: 'greenyellow', textDecoration: 'underline'}}
                    >
                        {translate('resources.changeHistory')} {isHistoryVisible ? '▲' : '▼'}
                    </h3>

                    {isHistoryVisible && (
                        <div>
                            {history.length === 0 ? (
                                <p>No change history found.</p>
                            ) : (
                                history.map(change => (
                                    <div key={change.id} style={{
                                        marginBottom: "1rem",
                                        padding: '10px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '5px'
                                    }}>
                                        <p>
                                            <strong>Changed By:</strong> {change.changed_by} <br/>
                                            <strong>Timestamp:</strong> {formatDate(change.change_timestamp)} <br/>
                                            <strong>Instance ID:</strong> {change.instance_id} <br/>
                                            <strong>Model Name:</strong> {change.model_name}
                                        </p>
                                        <ul>
                                            {change.changes && typeof change.changes === 'object' ? (
                                                Object.entries(change.changes).map(([key, value], index) => (
                                                    <li key={index}>
                                                        <strong>{key}</strong>: <br/>
                                                        {value.old !== undefined ? (
                                                            <span style={{color: 'red', fontWeight: 'bold'}}>
                                                                Old Value: {value.old}
                                                                <br/>
                                                            </span>
                                                        ) : null}
                                                        {value.new !== undefined ? (
                                                            <span style={{color: 'green', fontWeight: 'bold'}}>
                                                                New Value: {value.new}
                                                            </span>
                                                        ) : null}
                                                        {(value.old === undefined && value.new === undefined) && (
                                                            <span>No changes available.</span>
                                                        )}
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No changes available.</li>
                                            )}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </SimpleShowLayout>
        </Show>
    );
};