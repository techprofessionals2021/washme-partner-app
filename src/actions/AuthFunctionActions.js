import * as ActionTypes from './ActionTypes';

export const updateProfilePicture = (data) => ({
    type: ActionTypes.UPDATE_PROFILE_PICTURE,
    data: data
})