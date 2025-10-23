import React, {useEffect, useState} from "react";
import apiUrl from "../../dataProvider";
import authProvider from "../../AuthProvider";
import {useTranslate} from "react-admin";

interface ParentCategoryProps {
    handleParentId: (parentId: number | null) => void;
    currentParentId: number | null;
}

const ParentCategory: React.FC<ParentCategoryProps> = ({
                                                           handleParentId,
                                                           currentParentId,
                                                       }) => {
    const translate = useTranslate();
    const [parentId, setParentId] = useState<number | null>(currentParentId);
    const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(apiUrl + `/products/category`, {
                    headers: {
                        Authorization: `Bearer ${authProvider.getToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch categories");
                }

                const data = await response.json();
                if (currentParentId !== null) {
                    data.unshift({id: 0, name: "ROOT"});
                }
                setCategories(data);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError("Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value === "" ? null : parseInt(event.target.value);
        setParentId(selectedId);
        handleParentId(selectedId);
    };

    if (loading) {
        return <p style={{textAlign: "center", color: "#555"}}>Loading...</p>;
    }

    if (error) {
        return <p style={{textAlign: "center", color: "red"}}>{error}</p>;
    }

    const currentCategoryName = () => {
        const selectedCategory = categories.find((category) => category.id === currentParentId);
        return selectedCategory ? selectedCategory.name : "ROOT";
    };

    const styles = {
        container: {
            marginBottom: "20px",
        },
        label: {
            display: "block",
            marginBottom: "5px",
            fontWeight: "bold" as const,
            color: "#333",
        },
        select: {
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#f9f9f9",
        },
        option: {
            fontSize: "16px",
        },
    };

    return (
        <div style={styles.container}>
            <label htmlFor="parent" style={styles.label}>
                {translate('resources.categories.edit_category')}
            </label>
            <select
                id="parent"
                value={parentId || ""}
                onChange={handleChange}
                style={styles.select}
            >
                <option value="" style={styles.option}>
                    {currentCategoryName()}
                </option>
                {categories
                    .filter((category) => category.id !== parentId)
                    .map((category) => (
                        <option key={category.id} value={category.id} style={styles.option}>
                            {category.name}
                        </option>
                    ))}
            </select>
        </div>
    );
};

export default ParentCategory;
