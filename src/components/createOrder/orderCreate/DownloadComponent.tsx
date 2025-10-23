import {Button} from "react-bootstrap";
import authProvider from "../../../AuthProvider";
import {useTranslate} from "react-admin";

export const DownloadComponent = (props: any) => {
    const recordId = props.recordId;
    const entity = props.entity;
    const translate = useTranslate();

    const downloadFile = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const response = await fetch(props.downloadUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/pdf",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: JSON.stringify({[entity]: recordId}),
            });
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            console.log('response', response);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `order-${recordId}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Error downloading file:', error.message);
        }
    };

    return (
        <Button
            style={{
                margin: '10px',
                backgroundColor: props.disabled ? '#d3d3d3' : '#1c6816',
                color: props.disabled ? '#9e9e9e' : '#ffffff',
                borderRadius: '8px',
                padding: '8px 16px',
                boxShadow: props.disabled
                    ? 'none'
                    : '0px 4px 10px rgba(0, 0, 0, 0.2)',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = props.disabled ? '#d3d3d3' : '#11510d';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = props.disabled ? '#d3d3d3' : '#1c6816';
            }}
            onClick={downloadFile}
            disabled={props.disabled}
        >
            {translate('resources.order.fields.download')}
        </Button>
    );
}
