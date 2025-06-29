// pages/Admin/CreateProduct.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateProduct() {
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    // Changed stock to an object for sizes
    stockBySizes: {
      S: '',
      M: '',
      L: '',
      XL: '',
    },
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Handle changes for main product fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevProduct => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  // Handle changes specifically for stock quantities per size
  const handleStockSizeChange = (size, value) => {
    setProduct(prevProduct => ({
      ...prevProduct,
      stockBySizes: {
        ...prevProduct.stockBySizes,
        [size]: value,
      },
    }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price);
    formData.append('category', product.category);
    // Append stockBySizes as a JSON string
    formData.append('stockBySizes', JSON.stringify(product.stockBySizes));

    // Append each selected image file
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const res = await axios.post('https://admin-backend-x8of.onrender.com/admin/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess('Product created successfully!');
      // Clear the form
      setProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stockBySizes: {
          S: '',
          M: '',
          L: '',
          XL: '',
        },
      });
      setImages([]);
      // Redirect to product list after a short delay
      setTimeout(() => {
        navigate('https://admin-backend-x8of.onrender.com/admin/products');
      }, 1500);
    } catch (err) {
      console.error('Error creating product:', err);
      setError('Failed to create product. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Create-Product">
      <h1>Create New Product</h1>
      {error && <p >{error}</p>}
      {success && <p>{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="Product-Name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="P-Name"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="des">Description</label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            rows="4"
            className="descrip"
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="price" className="Price">Price (₹)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="Input-price"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="Category-input"
            required
          />
        </div>

        {/* Stock per Size Inputs */}
        <div>
          <label className="Stock-Quantity">Stock Quantity by Size</label>
          <div className="Sizes">
            {['S', 'M', 'L', 'XL'].map((size) => (
              <div key={size}>
                <label htmlFor={`stock-${size}`} className="Stock-size">{`Stock (${size})`}</label>
                <input
                  type="number"
                  id={`stock-${size}`}
                  name={`stock-${size}`}
                  value={product.stockBySizes[size]}
                  onChange={(e) => handleStockSizeChange(size, e.target.value)}
                  className="size-input"
                  min="0"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="images" className="Product-Image">Product Images</label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            onChange={handleImageChange}
            className="p-image"
            accept="image/*"
          />
          {images.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Selected: {images.map(img => img.name).join(', ')}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="Button-2"
          disabled={loading}
        >
          {loading ? 'Creating Product...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
