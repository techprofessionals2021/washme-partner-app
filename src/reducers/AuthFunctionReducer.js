import * as Actions from '../actions/ActionTypes'
const AuthFunctionReducer = (state = { profile_picture:undefined }, action) => {

    switch (action.type) {
        case Actions.UPDATE_PROFILE_PICTURE:
            return Object.assign({}, state, {
                profile_picture: action.data
            });
        default:
            return state;
    }
}

export default AuthFunctionReducer;


