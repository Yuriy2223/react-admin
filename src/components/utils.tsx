import {TextInput, useRecordContext} from "react-admin";
import React from "react";

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const toggleHistoryVisibility = (
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
) => (event: React.MouseEvent<HTMLHeadingElement>) => {
    setIsVisible(prev => !prev);
};

export interface ChangeHistory {
    id: number;
    change_timestamp: string;
    changed_by: string;
    instance_id: string;
    model_name: string;
    changes: Array<{
        key: string;
        old: any;
        new: any;
    }>;
}

export const SkuInput = () => {
    const record = useRecordContext();
    return <TextInput source="sku" defaultValue={record?.sku} inputProps={{readOnly: true}}/>;
};