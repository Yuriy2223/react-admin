import React, {useEffect, useState} from "react";
import {useInput, useNotify, useRecordContext, useTranslate} from "react-admin";
import {useTheme} from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import apiUrl from "../dataProvider";

interface PhotoUploaderProps {
    source: string;
    accept?: string;
    label?: string;
}

interface photoItem {
    id: string;
    url: string;
}

interface UploadResponse {
    id: string;
    url: string;
}

const PhotoUploader = ({
                           source,
                           accept = "image/*",
                           label,
                       }: PhotoUploaderProps) => {
    const record = useRecordContext();
    const [loading, setLoading] = useState(false);
    const [filePreview, setFilePreview] = useState<photoItem | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const notify = useNotify();
    const theme = useTheme();
    const translate = useTranslate();

    const {
        field: {value, onChange},
    } = useInput({source, defaultValue: null});

    useEffect(() => {
        if (record && record[source]) {
            const photoData = record[source];
            if (photoData && typeof photoData === "object" && !isInitialized) {
                setFilePreview(photoData);
                setIsInitialized(true);
            }
        }

        if (filePreview) {
            onChange(filePreview.id);
        }
    }, [record, source, onChange, isInitialized, value, filePreview]);

    const handlePhotoUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${apiUrl}/products/upload-attachment`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                notify(`Failed to upload ${file.name}`, {type: "warning"});
                throw new Error(`Failed to upload ${file.name}`);
            }

            const data: UploadResponse = await response.json();

            if (data && data.id && data.url) {
                setFilePreview(data);
                onChange(data.id);

                notify(`File uploaded successfully`, {type: "info"});
            } else {
                notify(`Failed to upload ${file.name}`, {type: "warning"});
                throw new Error("Invalid response format");
            }
        } catch (error: any) {
            console.log(`Error uploading ${file.name}: ${error}`);
            notify(`Failed to upload ${file.name}`, {type: "warning"});
        } finally {
            setLoading(false);
            if (event.target) {
                event.target.value = "";
            }
        }
    };

    const handleRemove = () => {
        setFilePreview(null);
        onChange(null);
    };

    return (
        <>
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
            <div>
                {filePreview && (
                    <li
                        key={"photo" + filePreview.id}
                        style={{marginBottom: theme.spacing(1)}}
                    >
                        <img
                            src={filePreview.url}
                            alt={`Photo ${filePreview.id}`}
                            style={{maxWidth: 200}}
                        />
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleRemove}
                            style={{marginLeft: theme.spacing(1)}}
                        >
                            Remove
                        </Button>
                    </li>
                )}
            </div>
            {!filePreview && (
                <div>
                    <label
                        htmlFor={`photo-upload-${source}`}
                        style={{
                            cursor: "pointer",
                            color: "blue",
                            textDecoration: "underline",
                        }}
                    >
                        {translate('resources.helperTexts.add_photo')}
                    </label>
                    <input
                        id={`photo-upload-${source}`}
                        type="file"
                        onChange={handlePhotoUpload}
                        disabled={loading}
                        accept={accept}
                        style={{display: "none"}}
                    />
                </div>
            )}
            {loading && (
                <CircularProgress size={24} style={{marginLeft: theme.spacing(2)}}/>
            )}
        </>
    );
};

export default PhotoUploader;
