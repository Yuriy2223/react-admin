import {useInput, useNotify, useRecordContext, useTranslate} from "react-admin";
import React, {useEffect, useState} from "react";
import apiUrl from "./dataProvider";
import {useTheme} from "@mui/material/styles";
import './index.css';
import {Button} from "react-bootstrap";


interface MediaUploaderProps {
    id: number | string;
    source: string;
    accept?: string;
    label?: string;
    uploadEndpoint: string;
    onChange: (fileIds: string[]) => void;
    files: any[] | undefined;
}

export interface MediaItem {
    id: string;
    url: string;
}

const FileUploaderComponent = ({id, source, accept, label, uploadEndpoint, onChange, files,}: MediaUploaderProps) => {
    const record = useRecordContext();
    const [loading, setLoading] = useState(false);
    const [filePreviews, setFilePreviews] = useState<MediaItem[]>([]); // Store media objects (id, url) for preview
    const [isInitialized, setIsInitialized] = useState(false); // Track initialization
    const notify = useNotify();
    const theme = useTheme();

    const {
        field: {value, onChange: onInputChange},
    } = useInput({source, defaultValue: []});

    useEffect(() => {
        if (Array.isArray(files) && files.every(file => typeof file === 'object' && file !== null && 'id' in file && 'url' in file)) {
            setFilePreviews(files);
            setIsInitialized(true);
        }
    }, [files]);

    useEffect(() => {
            if (files) {
                setFilePreviews(files);
                setIsInitialized(true);
            }

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
                        onInputChange(idsOnly);
                    }
                }
            }
        }, [record, source, onInputChange, value, isInitialized]
    );

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
            onChange(ids);  // Now fileIds are being sent to the parent component

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
        <div className={'file-uploader'}>
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
            <ul className={'upload-list'}>
                {filePreviews.length > 0 ? (
                    filePreviews.map((item, index) => (
                        <li className={'upload-list-item'} key={index}>
                            {item.url && item.url.endsWith('.pdf') ?
                                (
                                    <a href={item.url}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       style={{
                                           color: "#007bff",
                                           textDecoration: "none"
                                       }}>
                                        {decodeURIComponent(item.url.substring(item.url.lastIndexOf('/') + 1))}
                                    </a>)
                                :
                                (<a href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "block",
                                        marginTop: "5px",
                                        color: "#007bff",
                                        textDecoration: "none"
                                    }}> <img
                                        src={item.url}
                                        alt={`document-${item}`}
                                        style={{
                                            maxWidth: "500px",
                                            borderRadius: "8px"
                                        }}/>
                                    </a>
                                )}

                            <Button
                                className={'remove-button'}
                                variant="danger" onClick={() => handleRemove(item.id)}>
                                {translate('resources.helperTexts.remove')}
                            </Button>
                        </li>
                    ))
                ) : (
                    <li style={{color: theme.palette.text.secondary}}>
                        {translate('resources.helperTexts.no_media_uploaded')}
                    </li>
                )}
            </ul>
            <label
                htmlFor={`file-upload-${id}`}
                style={{
                    cursor: "pointer",
                    color: "blue",
                    textDecoration: "underline",
                }}
            >
                {translate('resources.helperTexts.add_another_file')}
            </label>
            <input
                id={`file-upload-${id}`}
                type="file"
                onChange={handleFileUpload}
                disabled={loading}
                accept={accept || "*"}
                style={{display: "none"}}
            />
        </div>
    );
};

export default FileUploaderComponent;
