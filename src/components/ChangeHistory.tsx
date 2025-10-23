import React, {useEffect, useState} from 'react';
import {useDataProvider} from 'react-admin';
import {ChangeHistory, formatDate} from "./utils";

interface ChangeHistoryComponentProps {
    modelName: string;
    recordId: string | number | undefined;
    isVisible: boolean;
}

export const ChangeHistoryComponent: React.FC<ChangeHistoryComponentProps> = ({modelName, recordId, isVisible}) => {
    const dataProvider = useDataProvider();
    const [history, setHistory] = useState<ChangeHistory[]>([]);

    useEffect(() => {
        if (recordId && isVisible) {
            const fetchChangeHistory = async () => {
                try {
                    const {data} = await dataProvider.getList('history', {
                        filter: {model_name: modelName, instance_id: recordId},
                    });
                    setHistory(data);
                } catch (error) {
                    console.error("Error fetching change history:", error);
                }
            };
            fetchChangeHistory();
        }
    }, [dataProvider, modelName, recordId, isVisible]);

    if (!isVisible) return null;

    return (
        <div>
            {history.length === 0 ? (
                <p>No change history found.</p>
            ) : (
                history.map(change => (
                    <div key={change.id} style={{
                        marginBottom: '1rem',
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
    );
};
