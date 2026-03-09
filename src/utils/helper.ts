export const formatAddress = (...fields) =>
    fields.filter(Boolean).join(", ");

export const formattedOrders = (orders) => orders.map((order) => {

    const stores = order.delivery_from || [];


    // Format each store name and address using your existing formatAddress function
    const formattedStores = stores?.map((store) =>
        formatAddress(
            store.storeUniqueName,
            store.street,
            store.locality,
            store.landmark,
            store.formattedAddress,
            store.pincode
        )
    );

    const multipleStores = stores.map((store) => ({
        name: store.storeUniqueName || store.name,
        address: formatAddress(
            store.street,
            store.locality,
            store.landmark,
            store.formattedAddress,
            store.pincode
        ),
    }));

    const from = (() => {
        if (stores.length === 0) return "";

        const storeList = formattedStores.join(" & ");
        const storeName = stores.length > 1 ? `${stores.length} Pick-up Stores - ${storeList}` : formattedStores[0];

        // If multiple pickup stores
        return `${storeName}`;
    })();


    const to = formatAddress(
        order.delivery_to?.houseDetails,
        order.delivery_to?.street,
        order.delivery_to?.locality,
        order.delivery_to?.landmark,
        order.delivery_to?.formattedAddress,
        order.delivery_to?.pincode
    );

    const fromStoreList =
        formattedStores.length > 1
            ? formattedStores
                .map((store, idx) => `Store${idx + 1}: ${store}`)
                .join("\n")
            : formattedStores[0]?.address || "";

    // Example: Earned = subtotal - discount + shipping
    const totalBill = order.subtotal - (order.total_discount || 0) + (order.shipping || 0);

    const earningDetails = order.earnings_details?.[0] || {};
    const earned = earningDetails
        ? Number(earningDetails.deliverFees || 0) +
        Number(earningDetails.tips || 0) +
        Number(earningDetails.waitingFees || 0)
        : 0;

    return {
        id: order.id,
        orderNumber: String(order.order_number),
        clientDetails: order.client_details,
        formattedStores: multipleStores || [],
        fromStoreList: fromStoreList,
        from,
        to,
        totalBill,
        earned,
        status: order.order_status,
        ...order
    };
});

export const mapPartnerToUser = (partnerData) => {
    const bankDetails = {
        bankName: partnerData.bankName,
        accountNumber: partnerData.accountNo,
        ifscCode: partnerData.ifsc,
        branch: partnerData.branch,
    };

    return {
        id: partnerData.id,
        name: partnerData.name,
        partnerId: `MAR-${partnerData.partnerId}`,
        phone: partnerData.phone,
        email: partnerData.email,
        address: partnerData?.address?.formattedAddress ? partnerData?.address?.formattedAddress : "Not Available",
        bloodGroup: partnerData.bloodGroup || "N/A",
        profilePic: partnerData.profilePic || "https://example.com/images/johndoe.jpg",
        bankDetails,
    };
};

export const formatDate = (date) => date ? new Date(date)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";

export const formatTimeTo12Hour = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};
