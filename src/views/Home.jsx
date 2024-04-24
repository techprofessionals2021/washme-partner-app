import React, { useState, useEffect} from 'react';
import { StyleSheet, Image,  View, SafeAreaView, Text,  ScrollView, TouchableOpacity, Switch, PermissionsAndroid } from 'react-native';
import * as colors from '../assets/css/Colors';
import { LATITUDE_DELTA, LONGITUDE_DELTA, dashboard, regular, bold, change_online_status, api_url, img_url, dash_banner, dash_completed_icon, dash_active_icon, dash_upcoming_icon, dash_cancelled_icon } from '../config/Constants';
import { useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { connect } from 'react-redux'; 
import Moment from 'moment';
import FusedLocation from 'react-native-fused-location';
import database from '@react-native-firebase/database';
import DropShadow from "react-native-drop-shadow";

const Home = (props) => {
  const navigation = useNavigation();
  const [switch_value, setSwitchValue] = useState(true);
  const [loading, setLoading] = useState(false);
  const [active_services, setActiveServices] = useState(0);
  const [completed_services, setCompletedServices] = useState(0);
  const [upcoming_services, setUpcomingServices] = useState(0);
  const [cancelled_services, setCancelledServices] = useState(0);
  const [lat, setLat] = useState(false);
  const [lng, setLng] = useState(false);

  useEffect(() => {
    if(global.online_status == 1){
      setSwitchValue(true);
    }else{
      setSwitchValue(false);
    }
    const unsubscribe = navigation.addListener('focus', async () => {
      get_dashboard();
    });
    get_location();
    return unsubscribe;
  },[]);

  const toggleSwitch = async(value) => {
    if(value){
      await setSwitchValue(value);  
      await online_status(1);
      await saveData(1);
    }else{
      await setSwitchValue( value );  
      await online_status(0);
      await saveData(0);
    }  
  }

  const get_location = async() =>{
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
            title: 'Location Access Required',
            message: app_name+' needs to Access your location for tracking'
            }
      );
      if (granted) {
        FusedLocation.setLocationPriority(FusedLocation.Constants.HIGH_ACCURACY);
 
        // Get location once.
        const location = await FusedLocation.getFusedLocation();
        await setLat(location.latitude);
        await setLng(location.longitude);
 
        // Set options.
        FusedLocation.setLocationPriority(FusedLocation.Constants.BALANCED);
        FusedLocation.setLocationInterval(5000);
        FusedLocation.setFastestLocationInterval(5000);
        FusedLocation.setSmallestDisplacement(10);
 
       
        // Keep getting updated location.
        FusedLocation.startLocationUpdates();
 
        // Place listeners.
        const subscription = FusedLocation.on('fusedLocation', location => {
        
           let region = {
              latitude:       location.latitude,
              longitude:      location.longitude,
              latitudeDelta:  LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA
            }

            let marker = {
              latitude:       location.latitude,
              longitude:      location.longitude,
            }

            let lat =  location.latitude;
            let lng =  location.longitude;

            database().ref('/partners/'+global.id).update({
              lat: lat,
              lng: lng,
              bearing : location.bearing
            });

        });
      }
  }

  const get_dashboard = async () => {
    await axios({
      method: 'post', 
      url: api_url + dashboard,
      data:{ id: global.id }
    })
    .then(async response => {
      setLoading(false);
      if(response.data.status == 1){
        setActiveServices(response.data.result.active_services);
        setCompletedServices(response.data.result.completed_services);
        setUpcomingServices(response.data.result.upcoming_services);
        setCancelledServices(response.data.result.cancelled_services);
      }
    })
    .catch(error => {
      alert('Sorry something went wrong')
      setLoading(false);
    });
  }

  const online_status = async (status) => {
    setLoading(true);
    await axios({
      method: 'post', 
      url: api_url + change_online_status,
      data:{ id: global.id, online_status : status }
    })
    .then(async response => {
      setLoading(false);
    })
    .catch(error => {
      alert('Sorry something went wrong')
      setLoading(false);
    });
  }

  const saveData = async(status) =>{
    try{
        await AsyncStorage.setItem('online_status', status.toString());
        global.online_status = await status.toString();
        
      }catch (e) {
    }
  }
  
  const view_orders = (slug,label) =>{
    navigation.navigate("MyOrdersWithFilters",{ slug : slug, label:label })
  }

  const move_profile = () =>{
    navigation.navigate("Profile")
  }

  const render_list  = ({ item }) => (
    <DropShadow
        style={{
          margin: 10,
          alignItems: 'center', justifyContent: 'center',
          shadowColor: "#000",
          elevation: 5,
          shadowOffset: {
            width: 0,
            height: 0,
          }, 
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >  
      <TouchableOpacity >
        <Text style={{ fontSize:16, color:colors.theme_fg_two, fontFamily:bold}}>{item.customer_name}</Text>
        <View style={{ margin:2 }} />
        <View style={{ borderLeftWidth:4, borderColor:colors.theme_bg, padding:10 }}>
          <Text numberOfLines={1} style={{ fontSize:12, color:colors.grey, fontFamily:regular}}>order id: #{item.id}</Text>
          <View style={{ margin:4 }} />
          <View style={{ flexDirection:'row'}}>
            <Text style={{ fontSize:12, color:colors.theme_fg_two, fontFamily:bold}} >{Moment(item.created_at).fromNow()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </DropShadow> 
  );
  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={loading}/>
      <ScrollView style={{ padding:10}} showsVerticalScrollIndicator={false}>
        <View style={{ margin:5 }} />
        <View style={{ flexDirection:'row', width:'100%', alignItems:'center', justifyContent:'center'}}>
          <View style={{ width:'50%',justifyContent:'center', alignItems:'flex-start', }}>
          <TouchableOpacity>
            <Switch
              trackColor={{ false: "#767577", true: colors.theme_bg }}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={switch_value}
            />
            </TouchableOpacity>
          </View>
          <View style={{ width:'50%',justifyContent:'center', alignItems:'flex-end', }}>
            <TouchableOpacity onPress={move_profile.bind(this)} style={{ width: 40, height:40, borderWidth:1, borderRadius:30, borderColor:colors.theme_fg_three, backgroundColor:colors.theme_fg_three,  }}>
              <Image style= {{ height: undefined, width: undefined, flex: 1, borderRadius:30 }} source={{ uri : img_url + props.profile_picture }} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ margin:5 }} />
        <View style={{ flexDirection:'row' }} >
          <Text style={{ fontSize:24, fontFamily:bold, color:colors.theme_fg_two,  letterSpacing:0.5 }}>Hello</Text>
          <View style={{ margin:3 }} />
          <Text style={{ fontSize:24, fontFamily:bold, color:colors.theme_fg, letterSpacing:0.5 }}>{global.store_name}</Text>
        </View>
        <View style={{ width: '100%', height:180, borderRadius:10 }}>
          <Image style= {{ height: undefined, width: undefined, flex: 1, borderRadius:10 }} source={dash_banner} />
        </View>
        <View style={{ margin:10 }} />
        <Text style={{ fontSize:16, fontFamily:bold, color:colors.theme_fg_two }}>Your Today Report</Text>
        <View style={{ margin:10 }} />
        <View style={{ flexDirection:'row'}}>
          <View style={{ width:'50%', alignItems:'center', justifyContent:'center'}}>
          <DropShadow
                  style={{
                margin: 10,
                shadowColor: "#000",
                elevation: 5,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                }}						
          >
              <TouchableOpacity onPress={view_orders.bind(this,'active','Active')} style={{ padding:10, alignItems:'center', justifyContent:'center', backgroundColor:'#a7c661', height:130, width:150, borderRadius:10 }}>
                <View style={{ width: 50, height:50 }}>
                  <Image style= {{ height: undefined, width: undefined, flex: 1, }} source={dash_active_icon} />
                </View>
                <View style={{ margin:3 }} />
                <Text style={{ fontSize:18, fontFamily:bold, color:colors.theme_fg_three }}>
                    {active_services}
                </Text>
                <View style={{ margin:4 }} />
                <Text style={{ fontSize:16, fontFamily:bold, color:colors.theme_fg_three }}>Active</Text>
              </TouchableOpacity>
            </DropShadow>
          </View>
          <View style={{ width:'50%', alignItems:'center', justifyContent:'center'}}>
          <DropShadow
                style={{
                margin: 10,
                shadowColor: "#000",
                elevation: 5,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                }}						
          >
              <TouchableOpacity onPress={view_orders.bind(this,'upcoming','Upcoming')} style={{ padding:10, alignItems:'center', justifyContent:'center', backgroundColor:'#619fc6', height:130, width:150,borderRadius:10 }}>
                <View style={{ width: 50, height:50 }}>
                  <Image style= {{ height: undefined, width: undefined, flex: 1, }} source={dash_upcoming_icon} />
                </View>
                <View style={{ margin:3 }} />
                <Text style={{ fontSize:18, fontFamily:bold, color:colors.theme_fg_three }}>
                  {upcoming_services}
                </Text>
                <View style={{ margin:4 }} />
                <Text style={{ fontSize:16, fontFamily:bold, color:colors.theme_fg_three }}>Upcoming</Text>
              </TouchableOpacity>
            </DropShadow>
          </View>
        </View>
     
        <View style={{ flexDirection:'row'}}>
          <View style={{ width:'50%', alignItems:'center', justifyContent:'center'}}> 
          <DropShadow
                style={{
                margin: 10,
                shadowColor: "#000",
                elevation: 5,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                }}						
          >
              <TouchableOpacity onPress={view_orders.bind(this,'completed','Completed')} style={{ padding:10, alignItems:'center', justifyContent:'center', backgroundColor:'#61c6c1', height:130, width:150, borderRadius:10 }}>
                <View style={{ width: 50, height:50 }}>
                  <Image style= {{ height: undefined, width: undefined, flex: 1, }} source={dash_completed_icon} />
                </View>
                <View style={{ margin:3 }} />
                <Text style={{ fontSize:18, fontFamily:bold, color:colors.theme_fg_three }}>
                  {completed_services}
                </Text>
                <View style={{ margin:4 }} />
                <Text style={{ fontSize:16, fontFamily:bold, color:colors.theme_fg_three }}>Completed</Text>
              </TouchableOpacity>
            </DropShadow>
          </View>
          <View style={{ width:'50%', alignItems:'center', justifyContent:'center'}}>
          <DropShadow
                style={{
                margin: 10,
                shadowColor: "#000",
                elevation: 5,
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 3,
                }}						
          >
              <TouchableOpacity onPress={view_orders.bind(this,'cancelled','Cancelled')} style={{ padding:10, alignItems:'center', justifyContent:'center', backgroundColor:'#EE4B2B', height:130, width:150, borderRadius:10 }}>
                <View style={{ width: 50, height:50 }}>
                  <Image style= {{ height: undefined, width: undefined, flex: 1, }} source={dash_cancelled_icon} />
                </View>
                <View style={{ margin:3 }} />
                <Text style={{ fontSize:18, fontFamily:bold, color:colors.theme_fg_three }}>
                  {cancelled_services}
                </Text>
                <View style={{ margin:4 }} />
                <Text style={{ fontSize:16, fontFamily:bold, color:colors.theme_fg_three }}>Cancelled</Text>
              </TouchableOpacity>
            </DropShadow>
          </View>
        </View>
        <View style={{ margin:30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function mapStateToProps(state){
  return{
    profile_picture : state.auth_function.profile_picture,
  };
}

export default connect(mapStateToProps,null)(Home);
