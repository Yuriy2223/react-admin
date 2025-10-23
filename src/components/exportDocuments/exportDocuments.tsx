import React, {useEffect, useState} from "react";
import FileUploaderComponent from "../../FileUploaderComponent";
import {SimpleForm, useRedirect, useTranslate} from "react-admin";
import {Button} from "react-bootstrap";
import apiUrl from "../../dataProvider";
import authProvider from "../../AuthProvider";

interface DocumentsBatch {
    id: number;
    gtd?: number[] | Document[];
    ttn?: number[] | Document[];
    contract?: number[] | Document[];
    invoice?: number[] | Document[];
    specification?: number[] | Document[];
}

export interface Document {
    id: number;
    url: string;
}

const ExportDocuments = ({orderId}: { orderId?: string | undefined }) => {
    const [id, setId] = useState(1);
    const [packId, setPackId] = useState(null);
    const [loading, setLoading] = useState(false);
    const translate = useTranslate();
    const [documents, setDocuments] = useState<DocumentsBatch[]>([]);
    const isEditing = !!orderId;

    const redirect = useRedirect();

    useEffect(() => {
        const getMaxID = () => {
            let maxId = 0;
            documents.map((doc) => {
                if (doc.id > maxId) {
                    maxId = doc.id;
                }
            })
            setId(() => maxId + 1);
        }
        getMaxID();
    }, [documents]);

    useEffect(() => {
        if (!isEditing) return;

        const fetchExportDocuments = async () => {
            try {
                setLoading(true);
                const response = await fetch(apiUrl + `/orders/export/${orderId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authProvider.getToken()}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn(`ExportDocument not found for orderId: ${orderId}`);
                        setPackId(null);
                        setDocuments([]);
                    } else {
                        console.error(`Error fetching export documents: ${response.status}`);
                    }
                    return;
                }

                const data = await response.json();

                if (data && data.id) {
                    setPackId(data.id);
                } else {
                    setPackId(null);
                }

                if (data.documents) {
                    setDocuments(data.documents);
                } else {
                    console.error("Documents field not found in the response.");
                }

            } catch (error) {
                console.error("Error fetching export documents:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExportDocuments();
    }, [orderId]);

    const addAddExportDocumentsPack = () => {
        setDocuments([
            ...documents,
            {
                id: id,
                gtd: [],
                ttn: [],
                contract: [],
                invoice: [],
                specification: [],
            },
        ]);
        setId(id + 1);
    };

    const handleSubmit = async () => {
        const requestData = {
            order: Number(orderId),
            documents: documents
        };
        {
            packId ? await updateExportDocuments(requestData) : await saveExportDocuments(requestData)
        }
        redirect("/orders");
    };

    const saveExportDocuments = async (requestData: any) => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl + `/orders/export`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                console.error(`Error saving export documents: ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("Saved export documents:", data);
        } catch (error) {
            console.error("Error saving export documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateExportDocuments = async (requestData: any) => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl + `/orders/export/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                console.error(`Error updating export documents: ${response.status}`);
                return;
            }

            const data = await response.json();
            console.log("Updated export documents:", data);
        } catch (error) {
            console.error("Error updating export documents:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateDocumentPack = (name: string, value: number[], docId: number) => {
        console.log(name, value, docId);
        const updatedDocuments = documents.map((doc) =>
            doc.id === docId ? {...doc, [name]: value} : doc
        );
        setDocuments(updatedDocuments);
    };

    if (loading) {
        return <div>{translate('resources.loading')}</div>;
    }
    return (
        <div>
            <div>
                {documents.map((doc, index) => (
                    <div key={doc.id}
                         style={{
                             background: index % 2 === 0
                                 ? "rgba(255,255,255,0.6)"
                                 : "rgba(232,218,218,0.6)",
                             border: "1px solid black",
                             borderRadius: "15px",
                             padding: "10px",
                             marginBottom: "10px",
                         }}>

                        <p>{translate(`resources.order.fields.document_pack`)} №{doc.id}</p>
                        <FileInputForm
                            key={doc.id}
                            deleteDocumentPack={(packId) => {
                                setDocuments(documents.filter((d) => d.id !== packId))
                            }}
                            document={doc}
                            updateDocument={(name, value) => {
                                updateDocumentPack(name, value, doc.id)
                            }}
                        />
                    </div>
                ))}
            </div>


            <Button variant={"primary"}
                    onClick={addAddExportDocumentsPack}>{translate('resources.order.fields.add_export_documents_pack')}
            </Button>
            <Button
                className={"m-lg-1"}
                variant={"success"}
                onClick={handleSubmit}>
                {translate('resources.order.fields.save')}
            </Button>
        </div>
    );
}

const FileInputForm = ({document, deleteDocumentPack, updateDocument}: {
    updateDocument: (name: string, value: number[]) => void,
    document: DocumentsBatch,
    deleteDocumentPack: (id: number) => void
}) => {
    const translate = useTranslate();

    const handleFieldChange = (name: string, value: string[]) => {
        const valueArray = value.map((v) => Number(v));
        updateDocument(name, valueArray);
    }

    const documentTypes = ["gtd", "ttn", "contract", "invoice", "specification"];

    return (
        <div>
            <SimpleForm toolbar={false}>
                <div>
                    <span>{translate(`resources.order.fields.gtd`)}</span>
                    <FileUploaderComponent
                        id={Number(`${document.id}${documentTypes.indexOf("gtd")}`)}
                        source={"gtd"}
                        uploadEndpoint="attachments"
                        files={document.gtd ?? []}
                        onChange={(fileIds) => handleFieldChange("gtd", fileIds)}
                    />
                </div>

                <div>
                    <span>{translate(`resources.order.fields.ttn`)}</span>
                    <FileUploaderComponent
                        id={Number(`${document.id}${documentTypes.indexOf("ttn")}`)}
                        source={"ttn"}
                        uploadEndpoint="attachments"
                        files={document.ttn ?? []}
                        onChange={(fileIds) => handleFieldChange("ttn", fileIds)}
                    />
                </div>
                <div>
                    <span>{translate(`resources.order.fields.contract`)}</span>
                    <FileUploaderComponent
                        id={Number(`${document.id}${documentTypes.indexOf("contract")}`)}
                        source={"contract"}
                        uploadEndpoint="attachments"
                        files={document.contract ?? []}
                        onChange={(fileIds) => handleFieldChange("contract", fileIds)}
                    />
                </div>
                <div>
                    <span>{translate(`resources.order.fields.invoice`)}</span>
                    <FileUploaderComponent
                        id={Number(`${document.id}${documentTypes.indexOf("invoice")}`)}
                        source={"invoice"}
                        uploadEndpoint="attachments"
                        files={document.invoice ?? []}
                        onChange={(fileIds) => handleFieldChange("invoice", fileIds)}
                    />
                </div>
                <div>
                    <span>{translate(`resources.order.fields.specification`)}</span>
                    <FileUploaderComponent
                        id={Number(`${document.id}${documentTypes.indexOf("specification")}`)}
                        source={"specification"}
                        uploadEndpoint="attachments"
                        files={document.specification ?? []}
                        onChange={(fileIds) => handleFieldChange("specification", fileIds)}
                    />
                </div>

            </SimpleForm>

            <Button
                variant={"danger"}
                onClick={() => {
                    deleteDocumentPack(document.id)
                }}>
                {translate('resources.delete')}
            </Button>
        </div>
    );
}

export default ExportDocuments;
