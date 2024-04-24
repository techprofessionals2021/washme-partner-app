import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, FlatList } from 'react-native';
import {  bold, regular, api_url, partner_service_list_with_filter } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';
import Loader from '../components/Loader';
import Moment from 'moment';
import Icon, { Icons } from '../components/Icons';
import DropShadow from "react-native-drop-shadow";

const MyOrdersWithFilters = () =>{
    const route = useRoute();
	const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
	const [order_list, setOrderList] = useState([]);
    const [slug, setSlug] = useState(route.params.slug);
    const [label, setLable] = useState(route.params.label);  

	useEffect(() => {
		const unsubscribe = navigation.addListener('focus', async () => {
		  await get_service_list();
		});
		return unsubscribe;
	},[]);

	const get_service_list = async() => {
		setLoading(true);
		await axios({
			method: 'post', 
			url: api_url + partner_service_list_with_filter,
			data:{ partner_id:global.id, slug:slug }
		})
		.then(async response => {
			setLoading(false);
			console.log(response.data.result[0])
			setOrderList(response.data.result)
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
	
    const handleBackButtonClick = () =>{
		navigation.goBack()
	}

	const move_details = (data) =>{
		navigation.navigate("MyOrderDetails", { data: data })
	}

	const render_list = ({ item }) => (
		<DropShadow
		    style={{
			margin: 10,
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
			<TouchableOpacity onPress={move_details.bind(this,item.id)} style={{ padding:20, borderRadius:10, backgroundColor:colors.theme_fg_three }}>
			<View style={{ flexDirection:'row'}}>
				<View style={{ width:'50%', alignItems:'flex-start'}}>
					<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:17}}>{item.customer_name}</Text>
					<View style={{ margin:2 }} />
					<Text style={{ fontFamily:regular, color:colors.grey, fontSize:12}}>{Moment(item.booking_date).format('DD MMM-YY')} / {item.booking_time}</Text>
					<View style={{ margin:5 }} />
					<View style={ [{ padding:5, justifyContent:'center', alignItems:'center', borderRadius:5, width:'100%'}, get_status_background(item.status_type)]}>
						<Text style={[ {fontFamily:regular, color:colors.error, fontSize:12}, get_status_foreground(item.status_type) ]}>{item.status}</Text>
					</View>
				</View>
				<View style={{ width:'50%', alignItems:'flex-end'}}>
					{item.status_id == 5 ? 
						<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>{global.currency}{item.total}</Text>
					:
						<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>{global.currency}0</Text>
					}
					<View style={{ margin:2 }} />
					<Text style={{ fontFamily:regular, color:colors.grey, fontSize:12}}>#{item.id}</Text>
					<View style={{ margin:5 }} />
					{item.status_id == 5 ? 
						<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>{item.payment_name}</Text>
					:
						<Text style={{ fontFamily:regular, color:colors.theme_fg_two, fontSize:14}}>********</Text>
					}
					
				</View>
			</View>
			<View style={{ margin:10 }} />
			<View style={{ borderBottomWidth:1, borderStyle:'dashed', borderColor:colors.grey }} />
			<View style={{ margin:5 }} />
			{show_products(item.items)}
			</TouchableOpacity>
		</DropShadow>
	);

	return(
        <SafeAreaView style={styles.container}>
			<Loader visible={loading} />
			{order_list.length > 0 ?
				<ScrollView style={{ padding:10 }}>
					<View style={{ margin:10, flexDirection:'row' }}>
                        <View style={{ width:'80%', justifyContent:'center'}}>
                            <Text style={{ fontFamily:bold, color:colors.theme_fg_two, fontSize:20}}>{label}</Text>
                        </View>
                        <View style={{ width:'20%', justifyContent:'center', alignItems:'flex-end'}}>
                            <TouchableOpacity onPress={handleBackButtonClick.bind(this)}>
                                <Icon type={Icons.Feather} name="x-circle" color={colors.grey} style={{ fontSize:25 }} />
                            </TouchableOpacity>
                        </View>
						
					</View>
					<FlatList
						data={order_list}
						renderItem={render_list}
						keyExtractor={item => item.id}
					/>
					<View style={{ margin:50 }} />
				</ScrollView>
			:
			<View>
				<View style={{ margin:10, flexDirection:'row' }}>
					<View style={{ width:'80%', justifyContent:'center'}}>
						<Text style={{ fontFamily:bold, color:colors.theme_fg_two, fontSize:20}}>{label}</Text>
					</View>
					<View style={{ width:'20%', justifyContent:'center', alignItems:'flex-end'}}>
						<TouchableOpacity onPress={handleBackButtonClick.bind(this)}>
							<Icon type={Icons.Feather} name="x-circle" color={colors.grey} style={{ fontSize:25 }} />
						</TouchableOpacity>
					</View>
					
				</View>
				<View style={{ width:'100%', height:'100%', alignItems:'center', justifyContent:'center'}}>
					<Text style={{ fontFamily:bold, color:colors.theme_fg_two, fontSize:16}}>Sorry no orders found</Text>
				</View>
			</View>
			}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:colors.theme_bg_three
    }
  });

export default MyOrdersWithFilters;