import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import authProvider from "../../AuthProvider";
import ParentCategory from "./ParentCategory";
import apiUrl from "../../dataProvider";
import {useTranslate} from "react-admin";

export interface Category {
    id: number;
    name: string;
    level: number;
    parent: number | null;
}

const CategoryEdit = () => {
    const {id} = useParams<{ id: string }>();
    const translate = useTranslate();
    const navigate = useNavigate();
    const [category, setCategory] = useState<Category>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const fetchCategory = async () => {
            try {
                console.log("id: ", id);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/products/category/${id}/`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${authProvider.getToken()}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch category");
                }

                const data = await response.json();
                console.log("data: ", data);
                setCategory(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!category) return;

        try {
            const response = await fetch(apiUrl + `/products/category/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: category.name,
                    level: category.level,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update category");
            }

            navigate("/products");
        } catch (err) {
            setError((err as Error).message);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className={'container'}>
            <h1 className={'heading'}>
                {translate('resources.categories.edit_category')}
            </h1>
            {error && <p className={'error'}>Error: {error}</p>}
            <form onSubmit={handleSubmit}>
                <div className={'formGroup'}>
                    <label htmlFor="name" className={'label'}>
                        {translate('resources.categories.category_name')}
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={category?.name || ""}
                        onChange={(e) =>
                            setCategory((prev) => prev && {...prev, name: e.target.value})
                        }
                        className={'input'}
                    />
                </div>

                <div className={'formGroup'}>
                    <ParentCategory
                        currentParentId={category?.parent ?? null}
                        handleParentId={(parentId) =>
                            setCategory((prev) => prev && {...prev, parentId: parentId})}
                    />
                </div>


                <button
                    type="submit"
                    className={'button'}
                >
                    {translate('resources.categories.save')}
                </button>
            </form>
        </div>
    );
};

export default CategoryEdit;
