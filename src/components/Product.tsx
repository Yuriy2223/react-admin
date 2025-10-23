import {
    Create,
    Datagrid,
    DateField,
    Edit,
    EditButton,
    List,
    maxLength,
    minLength,
    NumberInput,
    ReferenceField,
    ReferenceInput,
    regex,
    required,
    Show,
    SimpleForm,
    SimpleList,
    SimpleShowLayout,
    TextField,
    TextInput,
    useDataProvider,
    useGetRecordId,
    useTranslate
} from "react-admin";
import {Button, Theme, useMediaQuery} from "@mui/material";
import FileUploader from "../FileUploader";
import PhotoUploader from "./PhotoUploader";
import React, {useEffect, useState} from "react";
import {ChangeHistory, formatDate, SkuInput, toggleHistoryVisibility} from "./utils";
import {useNavigate, useSearchParams} from 'react-router-dom';
import ParentCategory from "./categoryComponent/ParentCategory";
import apiUrl from "../dataProvider";
import authProvider from "../AuthProvider";
import CategoryList from "./categoryComponent/CategoryList";


export const ProductViewWrapper = () => {
    const [viewMode, setViewMode] = useState<"list" | "tree">("list");
    const translate = useTranslate();

    return (
        <div>
            <div style={{justifyContent: "space-between", marginBottom: "20px"}}>

                <Button
                    style={{
                        marginBottom: "10px",
                        marginTop: "10px",
                        marginRight: "10px",
                    }}
                    variant="outlined"
                    size="medium"
                    disabled={viewMode === "list"}
                    onClick={() => setViewMode("list")}
                >
                    {translate('resources.categories.view_as_list')}
                </Button>
                <Button
                    style={{
                        marginBottom: "10px",
                        marginTop: "10px",
                    }}
                    disabled={viewMode === "tree"}
                    variant="outlined"
                    size="medium"
                    onClick={() => setViewMode("tree")}
                >
                    {translate('resources.categories.view_as_tree')}
                </Button>
            </div>

            {viewMode === "list" ? <ProductList/> : <CategoryList/>}
        </div>
    );
};

const getPostFilters = () => {
    const translate = useTranslate();

    return [
        <TextInput label={translate('resources.search')} source="q" alwaysOn/>,
        <NumberInput source="sku"/>,
        <TextInput source="slug"/>,
    ];
}

export const ProductList = () => {
    const isSmall = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
    return (
        <List filters={getPostFilters()}>
            {isSmall ? (
                <SimpleList
                    primaryText={(record) => record.id}
                    secondaryText={(record) => record.name}
                    tertiaryText={(record) => record.description}
                />
            ) : (
                <Datagrid>
                    <TextField source="name"/>
                    <TextField source="sku"/>
                    <TextField source="description"/>
                    <TextField source="slug"/>
                    <EditButton/>
                </Datagrid>
            )}
        </List>
    );
};


export const ProductCreate = () => {
    const translate = useTranslate();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const parentCategoryId = searchParams.get("parentCategoryId");
    const [currentParentId, setCurrentParentId] = useState<number | null>(null);

    useEffect(() => {
        console.log("parentCategoryId: ", parentCategoryId);

        if (parentCategoryId) {
            setCurrentParentId(Number(parentCategoryId));
        }
    }, [parentCategoryId]);

    const handleParentIdChange = (newParentId: number | null) => {
        setCurrentParentId(newParentId);
    };

    const handleSubmit = async (data: any) => {
        console.log('Form data before submit: ', data);
        const productData = {
            ...data,
            category: currentParentId,
        };

        let body = JSON.stringify(productData);

        try {
            const response = await fetch(apiUrl + `/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authProvider.getToken()}`,
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error("Failed to create category");
            }

            navigate("/products");
        } catch (err) {
            setError((err as Error).message);
        }
    };

    return (
        <Create>
            <SimpleForm onSubmit={handleSubmit}>
                <TextInput
                    source="name"
                    validate={[required(), minLength(1), maxLength(255)]}
                />
                <TextInput
                    source="slug"
                    validate={[
                        required(),
                        regex(/^[-a-zA-Z0-9_]+$/, "Invalid slug format"),
                        minLength(1),
                        maxLength(255),
                    ]}
                />

                <FileUploader
                    source="media"
                    uploadEndpoint="products"
                    label={translate("resources.media")}
                />
                <FileUploader
                    source="documents"
                    uploadEndpoint="products"
                    label={translate("resources.documents")}
                />
                <PhotoUploader
                    source="main_photo"
                    label={translate("resources.main_photo")}
                />
                <FileUploader
                    source="certificates"
                    uploadEndpoint="products"
                    label={translate("resources.certificates")}
                />
                <TextInput
                    source="description"
                    multiline
                    validate={[maxLength(10000)]}
                />

                <ParentCategory
                    handleParentId={handleParentIdChange}
                    currentParentId={currentParentId}
                />
            </SimpleForm>
        </Create>
    );
};

export const ProductEdit = () => {
    const translate = useTranslate();
    return (<Edit>
            <SimpleForm>
                <TextInput
                    source="name"
                    validate={[required(), minLength(1), maxLength(255)]}
                />
                <TextInput
                    source="slug"
                    validate={[
                        required(),
                        regex(/^[-a-zA-Z0-9_]+$/, "Invalid slug format"),
                        minLength(1),
                        maxLength(255),
                    ]}
                />
                <FileUploader source="media"
                              uploadEndpoint='products'
                              label='resources.media'/>
                <FileUploader source="documents"
                              uploadEndpoint='products'
                              label='resources.documents'/>
                <PhotoUploader source="main_photo"

                               label='resources.main_photo'/>
                <FileUploader source="certificates"
                              uploadEndpoint='products'
                              label='resources.certificates'/>
                <SkuInput/>
                <TextInput
                    source="description"
                    multiline
                    helperText={translate('resources.helperTexts.optional')}
                    validate={[maxLength(10000)]}
                />

                <ReferenceInput
                    source="category"
                    reference="products/category"
                    label={translate('resources.category')}
                />

            </SimpleForm>
        </Edit>
    )
        ;
};

export const ProductShow = () => {
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const recordId = useGetRecordId();
    const [history, setHistory] = useState<ChangeHistory[]>([]);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);

    useEffect(() => {
        const fetchChangeHistory = async () => {
            try {
                const modelName = 'Product';
                const {data} = await dataProvider.getList('history', {
                    filter: {model_name: modelName, instance_id: recordId},
                });
                console.log("Fetched change history data:", data);
                setHistory(data);
            } catch (error) {
                console.error("Error fetching change history:", error);
            }
        };

        if (recordId) {
            fetchChangeHistory();
        }
    }, [dataProvider, recordId]);


    return (
        <Show>
            <SimpleShowLayout>
                <TextField source="id"/>
                <TextField source="sku"/>
                <TextField source="name"/>
                <TextField source="description"/>
                <TextField source="slug"/>

                <ReferenceField
                    source="category"
                    reference="products/category"
                    label='resources.category'
                    link="show">
                    <TextField source="name"/>
                </ReferenceField>

                <DateField source="created_at" showTime options={{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }}/>
                <DateField source="updated_at" showTime options={{
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }}/>

                <div style={{marginTop: '20px', borderTop: '1px solid #ccc', paddingTop: '10px'}}>
                    <h3 onClick={toggleHistoryVisibility(setIsHistoryVisible)}
                        style={{cursor: 'pointer', color: 'greenyellow', textDecoration: 'underline'}}>
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
                                                Object.entries(change.changes).map(([key, value], index) => {

                                                    return (
                                                        <li key={index}>
                                                            <strong>{key}</strong>: <br/>

                                                            {key === 'pk_set' ? (
                                                                Array.isArray(value) && value.length > 0 ? (
                                                                    <span>{value.join(', ')}</span>
                                                                ) : (
                                                                    <span>No values available</span>
                                                                )
                                                            ) : (
                                                                <span>
                                                            {typeof value === 'object' && value !== null ? (
                                                                <>
                                                                    {value.old !== undefined && (
                                                                        <span
                                                                            style={{color: 'red', fontWeight: 'bold'}}>
                                                                            Old Value: {value.old}<br/>
                                                                        </span>
                                                                    )}
                                                                    {value.new !== undefined && (
                                                                        <span style={{
                                                                            color: 'green',
                                                                            fontWeight: 'bold'
                                                                        }}>
                                                                            New Value: {value.new}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                value
                                                            )}
                                                        </span>
                                                            )}
                                                        </li>
                                                    );
                                                })
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
