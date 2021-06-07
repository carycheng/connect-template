export default (state = null, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            return action.payload
        default:
            return state;
    }
};