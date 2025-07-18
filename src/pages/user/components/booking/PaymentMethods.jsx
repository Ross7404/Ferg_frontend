import React from 'react';

const PaymentMethods = ({ 
  selectedPaymentMethod, 
  setSelectedPaymentMethod, 
  handlePayment, 
  isProcessingPayment 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
      
      {/* Chọn phương thức thanh toán */}
      <div className="space-y-4">
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedPaymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
          }`}
          onClick={() => setSelectedPaymentMethod('vnpay')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/vnpay.png" alt="VNPAY" className="h-8" />
              <div>
                <p className="font-medium">VNPAY</p>
                <p className="text-sm text-gray-600">Pay with VNPAY QR</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              selectedPaymentMethod === 'vnpay' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {selectedPaymentMethod === 'vnpay' && (
                <svg className="text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>
        
        <div 
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedPaymentMethod === 'momo' ? 'border-pink-500 bg-pink-50' : 'hover:border-gray-400'
          }`}
          onClick={() => setSelectedPaymentMethod('momo')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/momo.png" alt="MoMo" className="h-8" />
              <div>
                <p className="font-medium">MoMo</p>
                <p className="text-sm text-gray-600">Pay with MoMo e-wallet</p>
              </div>
            </div>
            <div className={`w-5 h-5 rounded-full border-2 ${
              selectedPaymentMethod === 'momo' ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
            }`}>
              {selectedPaymentMethod === 'momo' && (
                <svg className="text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handlePayment}
          disabled={!selectedPaymentMethod || isProcessingPayment}
          className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
            !selectedPaymentMethod || isProcessingPayment
              ? 'bg-gray-400 cursor-not-allowed'
              : selectedPaymentMethod === 'vnpay'
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {isProcessingPayment ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay ${totalPrice.toLocaleString()}đ`
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentMethods; 