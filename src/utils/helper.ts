export const formatAddress = (...fields) =>
    fields.filter(Boolean).join(", ");

export const formattedOrders = (orders) => orders.map((order) => {
    
    const from = formatAddress(
        order.delivery_from?.storeUniqueName,
        order.delivery_from?.street,
        order.delivery_from?.locality,
        order.delivery_from?.landmark,
        order.delivery_from?.formattedAddress,
        order.delivery_from?.pincode
    );

    const to = formatAddress(
        order.delivery_to?.houseDetails,
        order.delivery_to?.street,
        order.delivery_to?.locality,
        order.delivery_to?.landmark,
        order.delivery_to?.formattedAddress,
        order.delivery_to?.pincode
    );

    // Example: Earned = subtotal - discount + shipping
    const earned = order.subtotal - (order.total_discount || 0) + (order.shipping || 0);

    return {
        id: order.id,
        orderNumber: String(order.order_number),
        clientDetails: order.client_details,
        from,
        to,
        earned,
        status: order.order_status,
        ...order
    };
});