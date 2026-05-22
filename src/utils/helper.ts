export const formatAddress = (...fields) =>
    fields.filter(Boolean).join(", ");

const normalizeStoreWaitings = (value) => {
    if (typeof value === "string") {
        try {
            return normalizeStoreWaitings(JSON.parse(value));
        } catch {
            return [];
        }
    }

    if (!Array.isArray(value)) return [];

    return value.map((entry) => ({
        companyId: entry?.companyId ?? null,
        waitingTime: Number(entry?.waitingTime ?? 0),
        waitingFees: Number(entry?.waitingFees ?? 0),
    }));
};

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
    const deliverFees =
        earningDetails.deliverFees ??
        earningDetails.deliverfees ??
        earningDetails.deliveryFees ??
        order.deliverFees ??
        order.deliverfees ??
        0;
    const waitingFees =
        earningDetails.waitingFees ??
        earningDetails.waitingfees ??
        order.waitingFees ??
        order.waitingfees ??
        0;
    const tips = earningDetails.tips ?? 0;
    const storeWaitings = normalizeStoreWaitings(order.store_waitings);
    const storeWaitingFees = storeWaitings.reduce((sum, entry) => sum + Number(entry.waitingFees ?? 0), 0);
    const storeWaitingMinutes = storeWaitings.reduce((sum, entry) => sum + Number(entry.waitingTime ?? 0), 0);

    let earned = Number(deliverFees || 0) + Number(waitingFees || 0) + Number(storeWaitingFees || 0) + Number(tips || 0);
    if (!earned) {
        const fallbackDelivery = Number(order.shipping || 0);
        const fallbackWaiting = Number(order.waiting_fee || order.waitingFee || 0);
        earned = fallbackDelivery + fallbackWaiting + storeWaitingFees;
    }

    return {
        id: order.id,
        orderNumber: String(order.order_number),
        clientDetails: order.client_details,
        formattedStores: multipleStores || [],
        fromStoreList: fromStoreList,
        from,
        to,
        totalBill,
        deliverFees: Number(deliverFees || 0),
        waitingFees: Number(waitingFees || 0),
        storeWaitingFees,
        storeWaitingMinutes,
        tips: Number(tips || 0),
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

export const formatTimeTo12Hour = (input: string | Date) => {
    if (!input) return "N/A";

    const raw = input instanceof Date ? input.toISOString() : String(input).trim();
    const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(raw);

    const date = hasTimezone
        ? new Date(raw)
        : (() => {
            const match = raw.match(
                /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/
            );
            if (!match) return new Date(raw);

            const [, y, m, d, hh = "0", mm = "0", ss = "0", ms = "0"] = match;
            return new Date(Date.UTC(
                Number(y),
                Number(m) - 1,
                Number(d),
                Number(hh),
                Number(mm),
                Number(ss),
                Number(ms.padEnd(3, "0"))
            ));
        })();
    if (Number.isNaN(date.getTime())) return "N/A";

    const formatted = date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    return formatted.replace(/\b(am|pm)\b/i, (match) => match.toUpperCase());
};
