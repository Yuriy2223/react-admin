import React, {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import authProvider from "../../AuthProvider";
import apiUrl from "../../dataProvider";
import ParentCategory from "./ParentCategory";
import "./Category.css";
import {useTranslate} from "react-admin";

const CategoryCreate = () => {
    const translate = useTranslate();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [searchParams] = useSearchParams();
    const [level, setLevel] = useState(0);
    const [parentId, setParentId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parentCategoryId = searchParams.get("parentCategoryId");

    useEffect(() => {
        if (parentCategoryId) {
            setParentId(Number(parentCategoryId));
        }
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const body = JSON.stringify({
            name: name,
            level: level,
            parent: parentId,
        });

        try {
            const response = await fetch(apiUrl + `/products/category`, {
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
        <div className={'container'}>
            <h1 className={'heading'}>
                {translate('resources.categories.create_new_category')}
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
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className={'input'}
                    />
                </div>

                <div className={'formGroup'}>
                    <ParentCategory
                        currentParentId={parentId}
                        handleParentId={(parentId) => setParentId(parentId)}
                    />
                </div>

                <button
                    type="submit"
                    className={'button'}
                >
                    {translate('resources.categories.created')}
                </button>
            </form>
        </div>
    );
};

export default CategoryCreate;
