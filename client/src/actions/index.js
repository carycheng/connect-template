export function fetchUser(user) {
    return { type: "FETCH_USER", payload: user}
};

export function setProduct(product) {
    return { type: "ADD_ITEM", payload: product}
};