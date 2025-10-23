import React, {useEffect, useState} from "react";
import apiUrl from "../../dataProvider";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import {Product} from "../createOrder/orderCreate/orderCreate";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "@mui/material";
import {useTranslate} from "react-admin";

interface Category {
    created_at: string;
    updated_at: string;
    created_by: number;
    id: number;
    level: number;
    name: string;
    parent_id?: number;
    children?: Category[];
    products?: Product[];
    isCategoryOpen?: boolean;
    isProductsOpen?: boolean;
}

interface CategoryTreeProps {
    categories: Category[];
    onCategoryClick: (category: Category) => void;
}

const CategoryList = () => {
    const translate = useTranslate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [rootProducts, setRootProducts] = useState<Product[]>([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const response = await fetch(apiUrl + `/products?parent=root`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
        });
        const data = await response.json();
        console.log("data: ", data);
        setRootProducts(data);
        setLoading(false);
    };

    const fetchCategories = async () => {
        const response = await fetch(apiUrl + `/products/category?parent=root`, {
            headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
        });
        const data = await response.json();
        console.log("data: ", data);
        setCategories(
            data.map((category: Category) => ({...category, isOpen: false}))
        );
        setLoading(false);
    };

    const fetchCategoryDetails = async (categoryId: number) => {
        const response = await fetch(apiUrl + `/products/category/${categoryId}/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });
        const data = await response.json();
        return data;
    };

    const closeCategory = (categories: Category[], categoryId: number, isOpen: boolean): Category[] => {
        return categories.map((category) => {
            if (category.id === categoryId) {
                return {...category, isCategoryOpen: isOpen};
            }

            if (category.children) {
                return {
                    ...category,
                    children: closeCategory(category.children, categoryId, isOpen),
                };
            }

            return category;
        });
    };

    const updateCategoryTree = (
        categories: Category[],
        categoryId: number,
        details: { children: Category[]; products: Product[] }
    ): Category[] => {
        return categories.map((category) => {
            if (category.id === categoryId) {
                return {
                    ...category,
                    isCategoryOpen: true,
                    children: details.children,
                    products: details.products,
                };
            }

            if (category.children) {
                return {
                    ...category,
                    children: updateCategoryTree(category.children, categoryId, details),
                };
            }

            return category;
        });
    };

    const handleCategoryClick = async (category: Category) => {
        if (category.isCategoryOpen) {
            setCategories((prevCategories) => closeCategory(prevCategories, category.id, false));
        } else {
            const details = await fetchCategoryDetails(category.id);
            console.log("details: ", details);
            setCategories((prevCategories) => {
                if (details.children.length === 0 && details.products.length === 0) {
                    return updateCategoryTree(prevCategories, category.id, details);
                } else {
                    return updateCategoryTree(prevCategories, category.id, details);
                }
            });
        }
    };


    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Button
                style={{
                    marginBottom: "10px",
                    marginTop: "10px",
                }}
                variant="outlined"
                size="medium"
                onClick={() => navigate(`/products/category/create`)}
            >
                {translate('resources.categories.create_new_category')}
            </Button>

            <h1> {translate('resources.categories.categories')}</h1>
            <CategoryTree categories={categories} onCategoryClick={handleCategoryClick}/>
            <li
                className="list-group-item node-treeview-searchable cursor-pointer">
                <ul className="list-group mt-3">
                    <h3>Products</h3>
                    {rootProducts.map((product) => (
                        <CategoryTreeProduct key={product.id} {...product} />
                    ))}
                </ul>
            </li>
        </div>
    );
};

const CategoryTree: React.FC<CategoryTreeProps> = ({categories, onCategoryClick}) => {
    const translate = useTranslate();

    return (
        <ul className="list-group"
        >
            {categories.map((category) => (
                <li
                    className="list-group-item node-treeview-searchable cursor-pointer"
                    style={{backgroundColor: 'rgba(225,176,210,0.15)'}}
                    key={category.id}
                >
                    <div onClick={() => onCategoryClick(category)}>
                        <span style={{marginLeft: "10px"}}>
                            {category.isCategoryOpen ? " ▼ " : " ▶ "}
                        </span>
                        <strong> {category.name}</strong>
                    </div>

                    {category.isCategoryOpen && (
                        <CategoryButtonSet categoryId={category.id}/>
                    )}

                    {category.isCategoryOpen && category.children && (
                        <ul className="list-group mt-2">
                            <CategoryTree categories={category.children} onCategoryClick={onCategoryClick}/>
                        </ul>
                    )}

                    {category.isCategoryOpen && category.products && (
                        <ul className="list-group mt-3">
                            <h3>
                                {translate('resources.order.fields.products')}
                            </h3>
                            {category.products.map((product) => (
                                <CategoryTreeProduct key={product.id} {...product} />
                            ))}
                        </ul>
                    )}
                </li>
            ))}
        </ul>
    );
};

const CategoryTreeProduct: React.FC<Product> = (product) => {
    const translate = useTranslate();

    return (
        <li
            className="list-group-item d-flex justify-content-between align-items-center darker-background"
            style={{backgroundColor: 'rgba(111,188,94,0.15)'}}
            key={product.id}
        >
            <Link
                to={`/products/${product.id}/show`}
                style={{
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: "bold",
                }}
            >
                {product.name}
            </Link>

            <Link to={`/products/${product.id}/edit`}>
                <Button
                    variant="outlined"
                    size="small"
                    style={{marginLeft: "10px"}}
                >
                    {translate('resources.categories.edit_product')}
                </Button>
            </Link>
        </li>
    );
}

interface CategoryButtonSetProps {
    categoryId: number;
}

const CategoryButtonSet: React.FC<CategoryButtonSetProps> = (category) => {
    const translate = useTranslate();

    const handleDelete = async () => {
        if (window.confirm(translate("resources.categories.confirm_delete"))) {
            try {
                const response = await fetch(apiUrl + `/products/category/${category.categoryId}/`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    alert(translate("resources.categories.delete_success"));
                } else {
                    throw new Error(translate("resources.categories.delete_failed"));
                }
            } catch (error: any) {
                console.log(error.message);
            } finally {
                window.location.reload();
            }
        }
    };

    return (
        <div className="mt-2 d-flex gap-2">

            <Link to={`/products/category/${category.categoryId}`}>
                <Button
                    variant="outlined"
                    size="medium"
                >
                    {translate('resources.categories.edit_category')}
                </Button>
            </Link>

            <Link to={`/products/create?parentCategoryId=${category.categoryId}`}>
                <Button
                    variant="outlined"
                    size="medium"
                    style={{
                        marginLeft: "10px"
                    }}
                >
                    {translate('resources.categories.add_product')}
                </Button>
            </Link>

            <Link to={`/products/category/create?parentCategoryId=${category.categoryId}`}>
                <Button
                    variant="outlined"
                    size="medium"
                    style={{
                        marginLeft: "10px"
                    }}
                >
                    {translate('resources.categories.add_subcategory')}
                </Button>
            </Link>

            <Button
                variant="contained"
                color="error"
                size="medium"
                onClick={handleDelete}
                style={{
                    marginLeft: "10px"
                }}
            >
                {translate("resources.categories.delete")}
            </Button>
        </div>
    )
}

export default CategoryList;
