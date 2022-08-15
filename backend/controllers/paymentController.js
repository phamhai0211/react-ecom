const catchError = require('../middleware/catchErr')

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

exports.processPayment = catchError(async (req, res, next) => {
  const myPayment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "usd",
    metadata: {
      company: "DAIHAI",
    },
    payment_method_types: ['card'],
  });


  res.status(200).json({
    success: true,
    client_secret: myPayment.client_secret
  })
})

exports.sendStripeApiKey = catchError(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY })
})
