import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, Image, Platform, Linking } from 'react-native';
import {  bold, regular, service, partner_service_details, api_url, status_change } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon, { Icons } from '../components/Icons';
import ProgressCircle from 'react-native-progress-circle-rtl';
import axios from 'axios';
import Loader from '../components/Loader';
import database from '@react-native-firebase/database';
import Moment from 'moment';
import DropShadow from "react-native-drop-shadow";

const MyOrderDetails = () =>{
	const route = useRoute();
	const navigation = useNavigation();
	const [data, setData] = useState(undefined);
	const [id, setId] = useState(route.params.data);
	const [loading, setLoading] = useState(false);
	  console.log(data)

	const handleBackButtonClick= () => {
		navigation.goBack()
	}

	useEffect(() => {
		const onValueChange = database().ref(`/services/${id}`)
			.on('value', snapshot => {
				get_service_details();
		});
		const unsubscribe = navigation.addListener('focus', async () => {
			await get_service_details();
		});
		return unsubscribe;
	},[]);

	const get_service_details = async() => {
		console.log({ order_id:id })
		setLoading(true);
		await axios({
			method: 'post', 
			url: api_url + partner_service_details,
			data:{ service_id:id }
		})
		.then(async response => {
			setLoading(false);
			setData(response.data.result);
		})
		.catch(error => {
			setLoading(false);
			alert('Sorry something went wrong')
		});
	} 

	const change_status = async(slug) => {
		setLoading(true);
		await axios({
			method: 'post', 
			url: api_url + status_change,
			data:{ service_id:id, slug:slug }
		})
		.then(async response => {
			setLoading(false);
			get_service_details();
		})
		.catch(error => {
			setLoading(false);
			alert('Sorry something went wrong')
		});
	}

	const get_status_background = (slug) =>{
		if(slug == "error"){
			return { backgroundColor:colors.error_background}
		}else if(slug == "warning"){
			return  { backgroundColor:colors.warning_background } 
		}else{
			return { backgroundColor:colors.success_background }  
		}
	}
	
	const get_status_foreground = (slug) =>{
		if(slug == "error"){
			return { color:colors.error}
		}else if(slug == "warning"){
			return  { color:colors.warning } 
		}else{
			return { color:colors.success }  
		}
	}

	const show_products = (products) =>{
		let list = JSON.parse(products)
		return list.map((data,i) => {
			return (
				<View style={{ flexDirection:'row', margin:3 }}>
					<View style={{ width:'100%', alignItems:'flex-start'}}>
						<Text style={{ fontFamily:regular, color:colors.grey, fontSize:14}}>{data.service_name}</Text>
					</View>
				</View>
			)
		  });
	}

	const get_notification_color = (status) =>{
		if(status <= 5 ){
			return colors.success;
		}else{
			return colors.error;
		}
	}

	const redirection = (lat,lng) =>{
		if(lat != 0 && lng != 0){
		  var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
		  var url = scheme + `${lat},${lng}`;
		  if(Platform.OS === 'android'){
			Linking.openURL("google.navigation:q="+lat+" , "+lng+"&mode=d");
		  }else{
			Linking.openURL('maps://app?saddr='+lat+'&daddr='+lng);
		  }
		}
	}

	return(
		<SafeAreaView style={styles.container}>
			<Loader visible={loading} />
			{data != undefined &&
				<ScrollView>
					<View style={{ height:250, backgroundColor:colors.theme_bg, alignItems:'center', justifyContent:'center'}}>
						<ProgressCircle
							percent={ data.status_id * 20}
							radius={60}
							borderWidth={3}
							color={get_notification_color(data.status_id)}
							shadowColor={colors.grey}
							bgColor={colors.theme_bg}
							>
							<View style={{ height:60, width:60, backgroundColor:colors.theme_bg }} >
								<Image
								style= {{flex:1 , width: undefined, height: undefined}}
								source={service}
								/>
							</View>
						</ProgressCircle>
						<View style={{ margin:10 }} />
						{data.status_id > 5 ?
							<Text style={{ fontFamily:bold, color:colors.error, fontSize:14}}>{data.status}</Text>
						:
							<Text style={{ fontFamily:regular, color:colors.theme_fg_three, fontSize:14}}>{data.status}</Text>
						}	
					</View>
					<DropShadow
						style={{
						margin: 15,
						marginTop:-20,
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
						<View style={{ padding:20, borderRadius:10,backgroundColor: colors.theme_fg_three }}>
							<View style={{ flexDirection:'row'}}>
								<View style={{ width:'50%', alignItems:'flex-start'}}>
									<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:17}}>{data.customer_name}</Text>
									<View style={{ margin:2 }} />
									<Text style={{ fontFamily:regular, color:colors.grey, fontSize:12}}>{Moment(data.booking_date).format('DD MMM-YY')} / {data.booking_time}</Text>
									<View style={{ margin:5 }} />
									<View style={ [{ padding:5, justifyContent:'center', alignItems:'center', borderRadius:5, width:'100%'}, get_status_background(data.status_type)]}>
										<Text style={[ {fontFamily:regular, color:colors.error, fontSize:12}, get_status_foreground(data.status_type) ]}>{data.status}</Text>
									</View>
								</View>
								<View style={{ width:'50%', alignItems:'flex-end'}}>
									{data.status_id == 5 ? 
										<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>{global.currency}{data.total}</Text>
									:
										<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>{global.currency}0</Text>
									}
									<View style={{ margin:2 }} />
									<Text style={{ fontFamily:regular, color:colors.grey, fontSize:12}}>#{data.id}</Text>
									<View style={{ margin:5 }} />
									{data.status_id == 5 ? 
										<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>{data.payment_name}</Text>
									:
										<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>********</Text>
									}
									
								</View>
							</View>
							<View style={{ margin:10 }} />
							{data.status_id < 3 &&
							<View>
								<Text style={{ fontFamily:regular, color:colors.theme_fg, fontSize:16}}>Customer Address</Text>
								<View style={{ margin:5, flexDirection:'row' }}>
									<View style={{ width:'80%'}}>
										<Text style={{ fontFamily:regular, color:colors.grey, fontSize:12}}>{data.address}</Text>
									</View>
									<View style={{ width:'20%', alignItems:'flex-end', justifyContent:'center'}}>
									<TouchableOpacity onPress={redirection.bind(this,data.lat,data.lng)}>
										<Icon type={Icons.Feather} name="navigation" color={colors.grey} style={{ fontSize:25 }} />
									</TouchableOpacity>
									</View>
								</View>
								<View style={{ margin:5 }} />
							</View>
							}
							<View style={{ borderBottomWidth:1, borderStyle:'dashed', borderColor:colors.grey }} />
							<View style={{ margin:5 }} />
							<Text style={{ fontFamily:regular, color:colors.theme_fg, fontSize:16}}>Services</Text>
							<View style={{ margin:2 }} />
							{show_products(data.items)}
							
							{data.status_id < 3 &&
								<TouchableOpacity onPress={change_status.bind(this,'cancelled_by_partner')} style={{ padding:5, width:'96%', marginLeft:'2%', marginRight:'2%', backgroundColor:colors.error, borderRadius:5, alignItems:'center', justifyContent:'center', marginTop:20 }}>
									<Text style={{ fontFamily:regular, color:colors.theme_fg_three, fontSize:14}}>Cancel This Order</Text>
								</TouchableOpacity>
							}
						</View>
					</DropShadow>
				<View style={{ margin:30 }}/>
				</ScrollView>
			}
			{data != undefined && data.status_id == 2 &&
				<TouchableOpacity onPress={change_status.bind(this,'at_point')} style={{ height:40, position:'absolute', bottom:10, width:'100%', backgroundColor:colors.theme_bg, padding:10, alignItems:'center', justifyContent:'center', width:'90%', marginLeft:'5%', borderRadius:10}}>
					<Text style={{ fontFamily:bold, color:colors.theme_fg_three, fontSize:16}}>
						At Point
					</Text>
				</TouchableOpacity>
			}
			{data != undefined && data.status_id == 3 &&
				<TouchableOpacity onPress={change_status.bind(this,'on_duty')} style={{ height:40, position:'absolute', bottom:10, width:'100%', backgroundColor:colors.theme_bg, padding:10, alignItems:'center', justifyContent:'center', width:'90%', marginLeft:'5%', borderRadius:10}}>
					<Text style={{ fontFamily:bold, color:colors.theme_fg_three, fontSize:16}}>
						On Duty
					</Text>
				</TouchableOpacity>
			}
			{data != undefined && data.status_id == 4 && 
				<TouchableOpacity onPress={change_status.bind(this,'completed')} style={{ height:40, position:'absolute', bottom:10, width:'100%', backgroundColor:colors.theme_bg, padding:10, alignItems:'center', justifyContent:'center', width:'90%', marginLeft:'5%', borderRadius:10}}>
					<Text style={{ fontFamily:bold, color:colors.theme_fg_three, fontSize:16}}>
						Completed
					</Text>
				</TouchableOpacity>
			}
			<TouchableOpacity onPress={handleBackButtonClick} style={{ position:'absolute', top:10, left:10 }}>
				<Icon type={Icons.Feather} name="arrow-left" color={colors.theme_fg_three} style={{ fontSize:30 }} />
			</TouchableOpacity>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:colors.theme_bg_three
    }
});

export default MyOrderDetails;