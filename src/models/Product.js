const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: ['tartlet', 'cookies', 'beignet'],
        message: '{VALUE} is not a valid category (must be tartlet, cookies, or beignet)',
      },
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL or file'],
    },
    images: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOnHome: {
      type: Boolean,
      default: true,
      index: true,
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for category display label
productSchema.virtual('categoryLabel').get(function () {
  switch (this.category) {
    case 'tartlet':
      return 'Tartlets';
    case 'cookies':
      return 'Cookies';
    case 'beignet':
      return 'Pies & Pastries';
    default:
      return this.category;
  }
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
