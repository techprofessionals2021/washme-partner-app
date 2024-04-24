import { Dimensions } from 'react-native';

export const base_url = "Enter Your Admin URL Here/";
export const api_url = "Enter Your Admin URL Here/api/";
export const img_url = "Enter Your Admin URL Here/public/uploads/";
export const app_name = "Dr.Mech Partner";

export const reset_password = "partner/reset_password";
export const get_documents = "vendor/document_details"; 
export const document_update = "vendor/document_upload"; 
export const document_upload = "vendor/upload";
export const partner_faq = "get_faq"; 
export const dashboard = "partner/dashboard";
export const change_online_status = "partner/change_online_status";
export const partner_service_details = "partner/get_service_details"; 
export const partner_service_list_with_filter = "partner/get_service_list_with_filter"; 
export const status_change = "partner/status_change"; 
export const partner_service_list = "partner/get_service_list"; 
export const login = "partner/login";
export const forget_password = "partner/forget_password";  
export const check_phone = "partner/check_phone";
export const vendor_privacy_policy = "get_privacy_policy";
export const vendor_details = "partner/detail";
export const app_settings = "partner/app_setting";
export const terms_and_conditions = "get_terms_and_conditions";

export const partner_get_profile = "partner/get_profile";
export const partner_profile_picture = "partner/profile_picture";
export const partner_profile_picture_update = "partner/profile_picture_update";
export const partner_profile_update = "partner/profile_update";

//Image path
export const login_image = require('.././assets/img/login_image.png');
export const logo = require('.././assets/img/logo.png');
export const logo_with_name = require('.././assets/img/logo_with_name.png');
export const service = require('.././assets/img/service.png');
//dashboard image path
export const dash_banner = require('.././assets/img/dashboard_icons/dash_banner.png');
export const dash_active_icon = require('.././assets/img/dashboard_icons/dash_active_icon.png');
export const dash_completed_icon = require('.././assets/img/dashboard_icons/dash_completed_icon.png');
export const dash_upcoming_icon = require('.././assets/img/dashboard_icons/dash_upcoming_icon.png');
export const dash_cancelled_icon = require('.././assets/img/dashboard_icons/dash_cancelled_icon.png');

//Font Family
export const regular = "GoogleSans-Medium";
export const bold = "GoogleSans-Bold";

//Size
export const screenHeight = Math.round(Dimensions.get('window').height);
export const height_50 = Math.round(50 / 100 * screenHeight);
export const height_60 = Math.round(60 / 100 * screenHeight);
export const height_30 = Math.round(30 / 100 * screenHeight);
export const height_80 = Math.round(80 / 100 * screenHeight);
export const height_55 = Math.round(55 / 100 * screenHeight);
export const height_35 = Math.round(35 / 100 * screenHeight);
export const height_40 = Math.round(40 / 100 * screenHeight);
export const height_45 = Math.round(45 / 100 * screenHeight);
export const height_17 = Math.round(17 / 100 * screenHeight);
export const height_20 = Math.round(20 / 100 * screenHeight);
export const height_10 = Math.round(10 / 100 * screenHeight);

export const GOOGLE_KEY = "Enter Your Map Key Here";
export const LATITUDE_DELTA = 0.0150;
export const LONGITUDE_DELTA =0.0152;
