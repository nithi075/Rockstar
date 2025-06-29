// pages/Admin/EditProduct.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../axios'; // <--- Make sure this import path is correct based on your file structure

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    images: [],
    sizes: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Use 'api' instance for GET request
        // It will become: http://localhost:5000/api/v1/products/:id
        const res = await api.get(`/products/${id}`);
        const product = res.data.product;

        setForm({
          name: product.name || "",
          price: product.price || 0,
          description: product.description || "",
          category: product.category || "",
          images: product.images || [],
          sizes: product.sizes || [],
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again.");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("stock-")) {
      const sizeToUpdate = name.split("-")[1];

      setForm((prevForm) => {
        const updatedSizes = prevForm.sizes.map((s) =>
          s.size === sizeToUpdate ? { ...s, stock: Number(value) } : s
        );

        const existingSize = updatedSizes.find(s => s.size === sizeToUpdate);
        if (!existingSize && value !== "" && Number(value) > 0) { // Only add if value is meaningful
            updatedSizes.push({ size: sizeToUpdate, stock: Number(value) });
        }

        return {
          ...prevForm,
          sizes: updatedSizes,
        };
      });
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      images: form.images,
      sizes: form.sizes,
    };

    try {
      // *** THE FIX IS HERE ***
      // Use the 'api' instance and provide only the relative path after the baseURL
      // It will become: http://localhost:5000/api/v1/products/admin/product/:id
      await api.put(`/products/admin/product/${id}`, payload);

      console.log("Product updated successfully!");
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="product-loading">Loading product details...</div>;
  if (error) return <div className="loading-error">{error}</div>;
  if (!form.name && !loading) return <div className="product-notfound">Product not found or invalid ID.</div>;

  return (
    <div className="Product-edit">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit} className="Editing">
        {form.images && form.images.length > 0 && form.images[0].url && (
          <div>
            <img
              width={100}
              src={form.images[0].url.startsWith('http') ? form.images[0].url : `https://admin-backend-x8of.onrender.com/uploads/${form.images[0].url}`}
              alt="Product Preview"
              className="w-40 h-auto rounded-md object-cover border border-gray-200"
            />
          </div>
        )}
        <div>
          <label htmlFor="name" className="pro-name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="name-inp"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="pro-price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="price-inp"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="pro-category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="category-inp"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="pro-des">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="des-input"
            required
          />
        </div>

        <div>
          <label className="Pro-Stock">Stock Per Size</label>
          <div className="pro-sizes">
            {["XS", "S", "M", "L", "XL", "XXL", "One Size", "N/A"].map((size) => (
              <div key={size}>
                <label htmlFor={`stock-${size}`} className="size-per">{size}</label>
                <input
                  type="number"
                  id={`stock-${size}`}
                  name={`stock-${size}`}
                  value={form.sizes.find(s => s.size === size)?.stock || 0}
                  onChange={handleChange}
                  className="inp-size"
                  required
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="Upadte-pro"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
