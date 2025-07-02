import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from '../../axios'; // Make sure this import path is correct based on your file structure

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    images: [], // This will hold the fetched images as { _id, url }
    newImages: [], // To store newly selected files (if you add file input later)
    sizes: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // List of valid categories from your backend/models/productModel.js enum
  const categories = [
   
    'Shirts', 'Jackets', 'T-Shirts','Track Pants','Formal Pants','Shorts'
  ]; // <-- IMPORTANT: Ensure these categories match your backend productModel.js

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data.product;

        setForm({
          name: product.name || "",
          price: product.price || 0,
          description: product.description || "",
          category: product.category || "",
          images: product.images || [], // Storing fetched images as is
          newImages: [], // Initialize new images as empty
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
        } else if (existingSize && (value === "" || Number(value) === 0)) {
           // If stock is set to 0 or empty, remove the size from the array if it exists
           return {
               ...prevForm,
               sizes: prevForm.sizes.filter(s => s.size !== sizeToUpdate)
           };
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

  // !!! IMPORTANT !!!
  // You need to decide how to handle new image uploads.
  // Currently, your form doesn't have an input type="file".
  // If you want to allow uploading new images, you'll need:
  // 1. An <input type="file" multiple onChange={handleFileChange} />
  // 2. A handleFileChange function to update `newImages` state.
  // 3. Logic in handleSubmit to combine `form.images` (existing) and `newImages` (newly uploaded files)
  //    and send them as FormData.

  // For now, this fix assumes you are only sending back the *existing* images
  // with the corrected public_id.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // --- CRITICAL FIX FOR IMAGES ---
    // Map the _id from the fetched image to public_id for the backend
    const imagesForBackend = form.images.map(img => ({
      public_id: img._id, // Transform _id to public_id
      url: img.url
    }));

    const payload = {
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category,
      images: imagesForBackend, // Use the transformed images array
      sizes: form.sizes,
    };

    try {
      // Send as JSON body because no new files are being uploaded in this specific fix
      await api.put(`/products/admin/product/${id}`, payload);

      console.log("Product updated successfully!");
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      // console.error("Error response data:", err.response?.data); // Log full error response for more details
      setError("Failed to update product. " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="product-loading">Loading product details...</div>;
  if (error) return <div className="loading-error">{error}</div>;
  // This check might be too strict if product name can be empty or 0 initially
  // if (!form.name && !loading) return <div className="product-notfound">Product not found or invalid ID.</div>;

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
            min="0"
          />
        </div>

        <div>
          <label htmlFor="category" className="pro-category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="category-inp"
            required
          >
            <option value="">--Select a Category--</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
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
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => ( // Removed "One Size", "N/A" if not in enum
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
