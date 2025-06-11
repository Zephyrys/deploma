const { v4: uuidv4 } = require('uuid');

class PaymentGateway {
  async processPayment(cardDetails, amount) {
    console.log('[PaymentGateway] Обробка платежу:', cardDetails, amount);

    return {
      success: true,
      paymentId: uuidv4(),
      message: 'Платіж успішний',
    };
  }
}

module.exports = PaymentGateway;
