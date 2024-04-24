import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, TouchableOpacity, TextInput, Keyboard, FlatList } from 'react-native';
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { app_name, regular, bold, api_url, login, forget_password, vendor_privacy_policy, terms_and_conditions } from '../config/Constants';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { StatusBar } from '../components/StatusBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../components/Loader';
import { connect } from 'react-redux'; 
import { updateProfilePicture } from '../actions/AuthFunctionActions';
import Modal from "react-native-modal";

const Password = (props) => {

  const navigation = useNavigation();
  const route = useRoute();
  const [phone_with_code_value, setPhoneWithCodeValue] = useState(route.params.phone_with_code);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validation,setValidation] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false); 
  const [isPrivacyPolicyModalVisible, setIsPrivacyPolicyModalVisible] = useState(false); 
  const [privacy_result, setPrivacyResult] = useState([]);
  const [termsandconditions, setTermsAndConditions] = useState([]); 

  const login_validation = async() =>{
    if(password == ""){
      alert('Please enter Password.')
      setValidation(false);
    }else{
      setValidation(true);
      partner_login();
    }
  }

  useEffect(() => {
    get_privacy(); 
    get_terms_and_conditions();
  },[]);

  const handleBackButtonClick= () => {
    navigation.goBack()
  }

  const partner_login = async() => {
    Keyboard.dismiss();
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + login,
      data:{ phone_with_code: phone_with_code_value , fcm_token: global.fcm_token, password: password }
    })
    .then(async response => {
      setLoading(false);
      if(response.data.status == 1){
        saveData(response.data)
      }else{
        alert('Please enter valid password')
      }
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong');
    });
  }

  const saveData = async(data) =>{
    console.log(data)
    try{
        await AsyncStorage.setItem('id', data.result.id.toString());
        await AsyncStorage.setItem('partner_name', data.result.partner_name.toString());
        await AsyncStorage.setItem('email', data.result.email.toString());
        await AsyncStorage.setItem('phone_number', data.result.phone_number.toString());
        await AsyncStorage.setItem('phone_with_code', data.result.phone_with_code.toString());
        await AsyncStorage.setItem('profile_picture', data.result.profile_picture.toString());
        await AsyncStorage.setItem('document_approved_status', data.result.document_approved_status.toString());

        global.id = await data.result.id.toString();
        global.partner_name = await data.result.partner_name.toString();
        global.email = await data.result.email.toString();
        global.phone_number = await data.result.phone_number.toString();
        global.phone_with_code = await data.result.phone_with_code.toString();
        await props.updateProfilePicture(data.result.profile_picture.toString());
        global.document_approved_status = await data.result.document_approved_status.toString();
        await home();
      }catch (e) {
        alert(e);
    }
  }

  const home = async() => {
    navigation.dispatch(
         CommonActions.reset({
            index: 0,
            routes: [{ name: "Home" }],
        })
    );
  }

  const partner_forgot_password = async() =>{
    Keyboard.dismiss();
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + forget_password,
      data:{ phone_with_code: phone_with_code_value }
    })
    .then(async response => {
      setLoading(false);
      if(response.data.status == 1){
        navigation.navigate('Otp',{ data : response.data.result.otp, type: 2, id : response.data.result.id })
      }else{
        alert(response.data.message)
      }
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong');
    });
  }

  const terms_toggleModal = () => {
    setIsTermsModalVisible(true);
  };

  const privacy_policy_toggleModal = () => {
    setIsPrivacyPolicyModalVisible(true);
  };

  const terms_open_dialog = () =>{
    setIsTermsModalVisible(false);
  }

  const privacy_policy_open_dialog = () =>{
    setIsPrivacyPolicyModalVisible(false);
  }

  const get_privacy = async() => {
    setLoading(true);
    axios({
    method: 'post', 
    url: api_url + vendor_privacy_policy,
    data:{ user_type:2}
    })
    .then(async response => {
      setLoading(false);
      setPrivacyResult(response.data.result)
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong')
    });
  } 

  const get_terms_and_conditions = async() => {
    setLoading(true);
    axios({
    method: 'post', 
    url: api_url + terms_and_conditions,
    data:{user_type:2},
    })
    .then(async response => {
      setLoading(false);
      setTermsAndConditions(response.data.result);
    })
    .catch(error => {
      setLoading(false);
      alert('Sorry something went wrong')
    });
  }

  const renderItem = ({ item }) => (
    <View>
      <View style={{ justifyContent:'center', alignItems:'flex-start', padding:10,}}>
        <Text style={{ color:colors.theme_fg_two, fontFamily:bold, fontSize:18 }}>{item.title}</Text>
        <View style={{ margin:10 }} />
        <Text style={{ color:colors.grey, fontFamily:regular, fontSize:14}}>{item.description}</Text>
      </View>
    </View>
  );

  const privacy_policy_renderItem = ({ item }) => (
    <View>
      <View style={{ justifyContent:'center', alignItems:'flex-start', padding:10,}}>
        <Text style={{ color:colors.theme_fg_two, fontFamily:bold, fontSize:18 }}>{item.title}</Text>
        <View style={{ margin:10 }} />
        <Text style={{ color:colors.grey, fontFamily:regular, fontSize:14}}>{item.description}</Text>
      </View>
    </View>
  );

return (
 <SafeAreaView style={styles.container}>
  <StatusBar/>
  <Loader visible={loading} />
    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
      <View>
        <TouchableOpacity onPress={handleBackButtonClick} style={{ width:'10%' , justifyContent:'center', alignItems:'flex-start' }}>
          <Icon type={Icons.Feather} name="arrow-left" color={colors.theme_fg_two} style={{ fontSize:35 }} />
        </TouchableOpacity>
        <View style={{ margin:20 }}/>
        <Text style={{ fontSize:20, color:colors.theme_fg_two, fontFamily:bold}}>Welcome to {app_name}</Text>
        <View style={{ margin:2 }}/>
        <Text style={{ fontSize:12, color:colors.grey, fontFamily:regular }}>Please enter your password to access your account</Text>
        <View style={{ margin:10 }}/>
        <View
          style={styles.textFieldcontainer}>
          <TextInput
            style={styles.textField}
            placeholder="Enter your password"
            placeholderTextColor={colors.grey}
            underlineColorAndroid="transparent"
            secureTextEntry={true}
            onChangeText={text => setPassword(text)}
          />
        </View>
        <View style={{marginTop:"10%"}} />
          <View style={{ alignItems:'flex-start', }}>
            <Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:12 }}>By clicking the Sign Up I agree that I have read and accepted the <Text onPress={terms_toggleModal} style={{ fontFamily:bold, color:'blue', fontSize:12 }}>Terms of Use</Text>, <Text onPress={privacy_policy_toggleModal} style={{ fontFamily:bold, color:'blue', fontSize:12 }}>Privacy Policy</Text>.</Text>
          </View>
          <View style={{marginTop:"10%"}} />
        <TouchableOpacity onPress={login_validation} style={styles.button}>
          <Text style={{ color:colors.theme_fg_three, fontFamily:bold, fontSize:14}}>Submit</Text>
        </TouchableOpacity>
        <View style={{ margin:10 }}/>
        <TouchableOpacity onPress={partner_forgot_password}> 
          <Text style={{ color:colors.theme_fg, fontFamily:regular, alignSelf:'center', fontSize:12}}>Forgot Password</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
      <Modal 
          isVisible={isTermsModalVisible}
          onBackButtonPress={terms_toggleModal}
          style={{ backgroundColor:colors.theme_bg_three }}
        >
          <ScrollView>
            <View style={{ flex: 1 }}>
              <View style={{ margin:10 }} />
              <Text style={{ fontFamily:bold, fontSize:18, color:colors.theme_fg_two, alignSelf:'center'}}>Terms of Use</Text>
              <View style={{ padding:20 }}>
                <FlatList
                  data={termsandconditions}
                  renderItem={renderItem}
                  keyExtractor={item => item.id}
                />
              </View>
              <View style={{ margin:10 }} />
              <TouchableOpacity activeOpacity={1} onPress={terms_open_dialog.bind(this)} style={{ width:150, backgroundColor:colors.green, alignItems:'center', justifyContent:'center', borderRadius:5, height:40, alignSelf:'center'}}>
                <Text style={{ fontFamily:bold, fontSize:15, color:colors.theme_fg_three}}>Okay</Text>
              </TouchableOpacity>
            </View>
            <View style={{ margin:10 }} />
          </ScrollView>
        </Modal>

        <Modal 
          isVisible={isPrivacyPolicyModalVisible}
          onBackButtonPress={privacy_policy_toggleModal}
          style={{ backgroundColor:colors.theme_bg_three }}
        >
          <ScrollView>
            <View style={{ flex: 1 }}>
              <View style={{ margin:10 }} />
              <Text style={{ fontFamily:bold, fontSize:18, color:colors.theme_fg_two, alignSelf:'center'}}>Privacy Policy</Text>
              <View style={{ padding:20 }}>
                <FlatList
                  data={privacy_result}
                  renderItem={privacy_policy_renderItem}
                  keyExtractor={item => item.id}
                />
              </View>
              <View style={{ margin:10 }} />
              <TouchableOpacity activeOpacity={1} onPress={privacy_policy_open_dialog.bind(this)} style={{ width:150, backgroundColor:colors.green, alignItems:'center', justifyContent:'center', borderRadius:5, height:40, alignSelf:'center'}}>
                <Text style={{ fontFamily:bold, fontSize:15, color:colors.theme_fg_three}}>Okay</Text>
              </TouchableOpacity>
            </View>
            <View style={{ margin:10 }} />
          </ScrollView>
        </Modal>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    fontFamily:regular,
    fontSize:14,
    color:colors.theme_fg_two
  },
  button: {
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:colors.theme_bg
  },
});

function mapStateToProps(state){
  return{
    profile_picture : state.auth_function.profile_picture,
  };
}

const mapDispatchToProps = (dispatch) => ({
	updateProfilePicture: (data) => dispatch(updateProfilePicture(data))

});

export default connect(mapStateToProps,mapDispatchToProps)(Password);