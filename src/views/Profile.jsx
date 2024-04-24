import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, Image} from 'react-native';
import * as colors from '../assets/css/Colors';
import { bold, api_url, partner_get_profile, partner_profile_picture, partner_profile_picture_update, partner_profile_update, img_url } from '../config/Constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Loader from '../components/Loader';
import * as ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import ImgToBase64 from 'react-native-image-base64';
import PhoneInput from 'react-native-phone-input';
import { connect } from 'react-redux'; 
import { updateProfilePicture  } from '../actions/AuthFunctionActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const options = {
  title: 'Select a photo',
  takePhotoButtonTitle: 'Take a photo',
  chooseFromLibraryButtonTitle: 'Choose from gallery',
  base64: true,
  quality:1, 
  maxWidth: 500, 
  maxHeight: 500,
};

const Profile = (props) => {

  const navigation = useNavigation();
  const route = useRoute();
  const [partner_name, setPartnerName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [validation,setValidation] = useState(false); 
  const [profile_details,setProfileDetails] = useState(""); 
  const [img_data,setImgData] = useState(""); 
  const [profile_image,setProfileImage] = useState("");
  const [profile_timer,setProfileTimer] = useState(true); 
  const phone_ref = useRef(null); 
  const [wallet_amount,setWalletAmount] = useState(0);

  const handleBackButtonClick= () => {
    navigation.goBack()
  }

  useEffect( () => {
    const unsubscribe = navigation.addListener('focus', async () => {
      view_profile();
    });
    return unsubscribe;
  },[]);  

  const select_photo = async () => {
    if(profile_timer){
      ImagePicker.launchImageLibrary(options, async(response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = response.assets[0].uri;
            setImgData(response.data)
            await ImgToBase64.getBase64String(response.assets[0].uri)
          .then(async base64String => {
            await profileimageupdate(base64String);
            setProfileImage(response.assets[0].uri);
          }).catch(err => console.log(err));
        }
      });
    }else{
      alert('Please try after 20 seconds');
    }
  }

  const profileimageupdate = async(data_img) =>{
    setLoading(true);
    RNFetchBlob.fetch('POST', api_url + partner_profile_picture, {
      'Content-Type' : 'multipart/form-data',
    }, [
      {  
        name : 'image',
        filename : 'image.png', 
        data: data_img
      }
    ]).then(async (resp) => { 
      await setLoading(false);
      let data = await JSON.parse(resp.data);
      if(data.result){
        await profile_image_update(data.result);
      }
    }).catch((err) => {
        setLoading(false);
        console.log(err);
        alert('Error on while upload try again later.')
    })
  }

  const profile_image_update = async (data) => {
    setLoading(true);
      await axios({
        method: 'post', 
        url: api_url+partner_profile_picture_update,
        data: {id:global.id, profile_picture:data}
      })
      .then(async response => {
        setLoading(false);
        console.log(response)
        if(response.data.status == 1){
          alert("Update Successfully")
          saveProfilePicture(data);
          setProfileTimer(false);
          setTimeout(function(){setProfileTimer(true)}, 20000)
        }else{
          alert(response.data.message)
        }
      })
      .catch(error => {
          setLoading(false);
          alert("Sorry something went wrong")
      });
  }

  const saveProfilePicture = async(data) =>{
    try{
        await AsyncStorage.setItem('profile_picture', data.toString());
        view_profile();
        await props.updateProfilePicture(props.profile_picture);
      }catch (e) {
        alert(e);
    }
  }

  const profile_validation = async() =>{
    if(!partner_name || !email){
      alert('Please enter profile details.')
      await setValidation(false);
    }else{
      await setValidation(true);
      get_profile_update();
    }
  }

  const get_profile_update = async () => {
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + partner_profile_update,
      data:{ id: global.id, email:email, partner_name:partner_name }
    })
    .then(async response => {
      setLoading(false);
      if(response.data.status == 1){
        saveData(response.data)
      }else{
        alert(response.data.message)
      }
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong')
    });
  }

  const saveData = async(data) =>{
    try{
        await AsyncStorage.setItem('id', data.result.id.toString());
        await AsyncStorage.setItem('partner_name', data.result.partner_name.toString());
        await AsyncStorage.setItem('email', data.result.email.toString());
        await AsyncStorage.setItem('profile_picture', data.result.profile_picture.toString());
        
        global.id = await data.result.id.toString();
        global.partner_name = await data.result.partner_name.toString();
        global.email = await data.result.email.toString();
        await props.updateProfilePicture(data.result.profile_picture.toString());
        //await view_profile();
        await handleBackButtonClick();
      }catch (e) {
        alert(e);
    }
  }

  const view_profile = async () => {
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + partner_get_profile,
      data:{ id: global.id }
    })
    .then(async response => {
      setLoading(false);
      setProfileDetails(response.data.result);
      setEmail(response.data.result.email);
      setPartnerName(response.data.result.partner_name);
      props.updateProfilePicture(response.data.result.profile_picture);
      setPhoneNumber(response.data.result.phone_with_code);
      setWalletAmount(response.data.result.wallet);
      console.log(JSON.stringify(response.data.result.wallet))
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong')
    });
  }

  const change_password = () =>{
    navigation.navigate("CreatePassword", {from:"profile", id:global.id})
  }

return( 
  <SafeAreaView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
      <Loader visible={loading} />
      <View style={{ margin:10 }}/>
      <TouchableOpacity onPress={select_photo.bind(this)} style={styles.box}> 
      <View onPress={select_photo.bind(this)} style={styles.profile} >
        <Image style= {{ height: undefined,width: undefined, flex:1, borderRadius:50, borderColor:colors.theme_fg_two }} source={{ uri : img_url + props.profile_picture}} />
      </View>
    </TouchableOpacity>
    <View style={{ margin:5 }}/>
    <View style={{ width:'100%', padding:5, alignItems:'center', justifyContent:'center' }}>
        <Text style={{ color:colors.theme_fg, fontFamily:bold, fontSize:14}}>(Your wallet balance {global.currency} {wallet_amount})</Text>
      </View>
      <View style={{ padding:20 }}>
        <View
          style={styles.textFieldcontainer}>
          <TextInput
            style={styles.textField}
            placeholder="Name"
            placeholderTextColor={colors.grey}
            underlineColorAndroid="transparent"
            onChangeText={text => setPartnerName(text)}
            value={partner_name}
          />
        </View>
        <View style={{ margin:5 }}/>
        <View style={styles.textFieldcontainer}>
          <PhoneInput ref={phone_ref} style={{ borderColor:colors.theme_fg_two }} flagStyle={styles.flag_style} initialValue={global.phone_with_code} disabled={true} initialCountry="lb" offset={10} textStyle={styles.country_text} textProps={{ placeholder: "", placeholderTextColor : colors.grey }} autoFormat={true} />
        </View>
        <View style={{ margin:5 }}/>
        <View style={styles.textFieldcontainer}>
          <TextInput
            style={styles.textField}
            placeholder="Email"
            placeholderTextColor={colors.grey}
            underlineColorAndroid="transparent"
            onChangeText={text => setEmail(text)}
            value={email}
          />
        </View>
        <View style={{ margin:20 }}/>
        <TouchableOpacity onPress={profile_validation.bind(this)}  style={styles.button}>
          <Text style={{ color:colors.theme_fg_three, fontFamily:bold}}>Submit</Text>
        </TouchableOpacity>
        <View style={{ margin:10 }}/>
        <TouchableOpacity onPress={change_password} style={styles.password_button}>
          <Text style={{ color:colors.theme_fg, fontFamily:bold}}>Change Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textFieldcontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    height: 45
  },
  textFieldIcon: {
    padding:5
  },
  textField: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    height: 45,
    backgroundColor:colors.theme_bg_three,
    color:colors.theme_fg_two,
    fontSize:14
  },
  button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:colors.theme_fg

  },
  password_button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor:colors.theme_fg,
    borderWidth:1
  },
  box:{
    left:(Dimensions.get('window').width / 2) - 50,
    backgroundColor:'transparent',
    width: 100,
    height: 100,
    borderRadius: 60,
    borderColor:colors.theme_bg_two,
    flexDirection:'row'
  },
  profile:{
    width: 100,
    height: 100,
    borderRadius: 50
  },
  flag_style:{
    width: 38, 
    height: 24
  },
  country_text:{
    flex: 1,
    padding: 12,
    borderRadius: 10,
    height: 45,
    backgroundColor:colors.theme_bg_three
  },
});

function mapStateToProps(state){
  return{
    profile_picture : state.auth_function.profile_picture,

  };
}

const mapDispatchToProps = (dispatch) => ({
  updateProfilePicture: (data) => dispatch(updateProfilePicture(data)),
});

export default connect(mapStateToProps,mapDispatchToProps)(Profile);
