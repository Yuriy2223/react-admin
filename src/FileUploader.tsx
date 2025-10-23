import {useInput, useNotify, useRecordContext, useTranslate} from "react-admin";
import React, {useEffect, useState} from "react";
import apiUrl from "./dataProvider";

import {useTheme} from "@mui/material/styles";

interface MediaUploaderProps {
    source: string;
    accept?: string;
    label?: string;
    uploadEndpoint: string;
}

interface MediaItem {
    id: string;
    url: string;
}

const FileUploader = ({source, accept, label, uploadEndpoint}: MediaUploaderProps) => {
    const record = useRecordContext(); // Use record from context
    const [loading, setLoading] = useState(false);
    const [filePreviews, setFilePreviews] = useState<MediaItem[]>([]); // Store media objects (id, url) for preview
    const [isInitialized, setIsInitialized] = useState(false); // Track initialization
    const notify = useNotify();
    const theme = useTheme();

    const {
        field: {value, onChange},
    } = useInput({source, defaultValue: []});
    // Initialize the component with the record's media when it's available

    useEffect(() => {
        if (record && record[source]) {
            const mediaData = record[source];
            if (Array.isArray(mediaData)) {
                if (!isInitialized) {
                    setFilePreviews(mediaData); // Set previews for display
                    setIsInitialized(true);
                }

                if (
                    value &&
                    Array.isArray(value) &&
                    !value.every(function (element) {
                        return typeof element === "number";
                    })
                ) {
                    // Transform the list of {id, url} to a list of ids
                    const idsOnly = value.map((item) => item.id);

                    // Update the value with only the list of ids
                    onChange(idsOnly);
                }
            }
        }
    }, [record, source, onChange, value, isInitialized]); // Added 'isInitialized' as a dependency

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch(apiUrl + `/${uploadEndpoint}/upload-attachment`, {
                method: "POST",
                body: formData,
                headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
            });
            const data = await response.json();

            // Append the new media object for preview and update form state with its id
            const updatedPreviews = [...filePreviews, {id: data.id, url: data.url}];
            setFilePreviews(updatedPreviews);
            const ids = updatedPreviews.map((item: MediaItem) => item.id);
            onChange(ids); // Update the form state with the new media id

            notify(`File '${file.name}' uploaded successfully`, {type: "info"});
        } catch (error) {
            notify(`File '${file.name}' upload failed`, {type: "warning"});
        } finally {
            setLoading(false);
        }
    };
    const translate = useTranslate();

    const handleRemove = (id: string) => {
        // Remove from previews and update form state
        const updatedPreviews = filePreviews.filter((item) => item.id !== id);
        setFilePreviews(updatedPreviews);

        const mediaIds = updatedPreviews.map((item) => item.id);
        const newMediaIds = mediaIds.filter((itemId) => itemId !== id);
        onChange(newMediaIds); // Update the form state after removal
    };

    return (
        <div>
            {label && (
                <h4
                    style={{
                        color: theme.palette.text.secondary,
                        fontSize: theme.typography.body1.fontSize,
                        fontWeight: theme.typography.fontWeightRegular,
                    }}
                >
                    {label}
                </h4>
            )}
            <ul>
                {filePreviews.length > 0 ? (
                    filePreviews.map((item) => (
                        <li key={item.id}>
                            <img
                                src={item.url}
                                alt={`Media ${item.id}`}
                                style={{maxWidth: 200}}
                            />
                            <button type="button" onClick={() => handleRemove(item.id)}>
                                {translate('resources.helperTexts.remove')}
                            </button>
                        </li>
                    ))
                ) : (
                    <li style={{color: theme.palette.text.secondary}}>
                        {translate('resources.helperTexts.no_media_uploaded')}
                    </li>
                )}
            </ul>
            <label
                htmlFor={`file-upload-` + source}
                style={{
                    cursor: "pointer",
                    color: "blue",
                    textDecoration: "underline",
                }}
            >

                {translate('resources.helperTexts.add_another_file')}
            </label>
            <input
                id={`file-upload-` + source}
                type="file"
                onChange={handleFileUpload}
                disabled={loading}
                accept={accept || "*"}
                style={{display: "none"}}
            />
        </div>
    );
};

export default FileUploader;
