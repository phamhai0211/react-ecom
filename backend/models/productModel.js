const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter name product"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "please enter descrip product"]
    },
    price: {
        type: Number,
        required: [true, "please enter price"],
        maxLength: [8, "Price cannot exceed 8 char"]
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    category: {
        type: String,
        required: [true, "please enter  cate product"]
    },
    Stock: {
        type: Number,
        required: true,
        maxLength: [4, "max 4 char"],
        default: 1
    },
    numOfReviews: {
        type: Number,
        required: true,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name:
            {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Product", productSchema)