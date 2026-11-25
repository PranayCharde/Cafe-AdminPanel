export function createCustomerWhatsAppLink(mobileNumber, message = "") {
  if (!mobileNumber) return "";
  const cleanPhone = mobileNumber.replace(/[^0-9]/g, "");
  // Assume India (+91) if 10 digits
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMsg}`;
}

export function formatOrderStatusWhatsApp(order) {
  const isDineIn = order.orderType === "dine-in" || !!order.tableNumber;
  const statusMap = {
    pending: "has been received and confirmed by the kitchen! ✅",
    preparing: "is currently being prepared fresh in the kitchen! 🍳",
    ready: isDineIn
      ? "is READY to be served at your table! 🔔"
      : "is READY for pickup at the counter! 🔔",
    completed: isDineIn
      ? "has been served. Thank you for dining with Bean & Brew! ☕"
      : "has been picked up. Enjoy your meal with Bean & Brew! ☕",
    cancelled: "could not be processed and has been cancelled. ❌",
  };

  return (
    `Hi *${order.customerName}*,\n\n` +
    `Your Bean & Brew Order *#${order.id}*${order.tableNumber ? ` (Table #${order.tableNumber})` : " (Takeaway - Counter Pickup)"} ` +
    `${statusMap[order.status] || "status is updated."}\n\n` +
    `💰 *Total Amount:* ₹${Number(order.totalAmount).toFixed(2)}\n` +
    `💳 *Payment:* ${order.paymentMode || "UPI"}\n\n` +
    `_Thank you for choosing Bean & Brew Cafe!_`
  );
}

