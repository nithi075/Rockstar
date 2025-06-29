// pages/Admin/EditProduct.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Assuming you have an axios instance configured with baseURL
// For example, in src/axios.js or src/utils/api.js:
// import axios from 'axios';
// const api = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_API_URL || process.env.REACT_APP_BACKEND_API_URL
// });
// export default api;
import api from '../../axios'; 

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    images: [],
    sizes: [], // This typically holds objects like { size: 'S', stock: 10 }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define the base URL for images from an environment variable as well
  // This should match your backend's base URL up to /api/v1
  // Make sure this is set in your frontend's .env files and Render environment variables
  // Example: VITE_BACKEND_API_BASE = 'https://admin-backend-x8of.onrender.com/api/v1'
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_URL || process.env.REACT_APP_BACKEND_API_URL;


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // CORRECTED: Use relative path for GET request, relying on `api` instance's baseURL
        // Assuming your backend route for fetching a single product is /api/v1/products/:id
        const res = await api.get(`/products/${id}`); 
        const product = res.data.product;

        // Map stock quantities to the sizes array for the form state
        // Assuming product.stockBySizes is an object like { S: 10, M: 20 } from backend
        const initialSizes = Object.entries(product.stockBySizes || {}).map(([size, stock]) => ({
            size,
            stock: Number(stock)
        }));

        setForm({
          name: product.name || "",
          price: product.price || 0,
          description: product.description || "",
          category: product.category || "",
          images: product.images || [],
          sizes: initialSizes, // Set the sizes array correctly
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

        // If the size doesn't exist yet in prevForm.sizes, add it
        const existingSize = updatedSizes.find(s => s.size === sizeToUpdate);
        if (!existingSize && value !== "" && Number(value) >= 0) { // Add if new and value is valid
            updatedSizes.push({ size: sizeToUpdate, stock: Number(value) });
        }

        // Filter out sizes with 0 stock if you don't want to send them, or keep them
        // For now, let's keep them if they were explicitly set to 0
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

    // Backend expects sizes as objects in an array, e.g., [{ size: 'S', stock: 10 }]
    // Ensure `form.sizes` is correctly structured from your state updates
    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      // If you're not updating images, you might not need to send the full image array
      // If you are, ensure the backend is set up to handle image updates
      images: form.images, // If this is for image updates, you'll need FormData
      stockBySizes: form.sizes.reduce((acc, current) => { // Convert sizes array back to object for backend
          acc[current.size] = current.stock;
          return acc;
      }, {}),
    };

    try {
      // CORRECTED: Use relative path for PUT request, relying on `api` instance's baseURL
      // Assuming your backend route for updating a product is /api/v1/products/admin/product/:id
      await api.put(`/products/admin/product/${id}`, payload);

      console.log("Product updated successfully!");
      alert("Product updated successfully!");
      navigate("/admin/products"); // Correct: navigate to frontend route
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="product-loading">Loading product details...</div>;
  if (error) return <div className="loading-error">{error}</div>;
  // A product might exist but have no name if it's new/empty, so maybe check id as well
  // if (!form.name && !loading) return <div className="product-notfound">Product not found or invalid ID.</div>;

  return (
    <div className="Product-edit">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit} className="Editing">
        {form.images && form.images.length > 0 && form.images[0].url && (
          <div>
            <img
              width={100}
              src={form.images[0].url.startsWith('http') ? form.images[0].url : `${backendBaseUrl}/uploads/${form.images[0].url}`} // Corrected image source
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
                  // Find the stock for the current size, default to 0 if not found
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
