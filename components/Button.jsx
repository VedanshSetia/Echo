import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'
import Loading from './Loadingfix'


const Button = ({
    buttonStyle,
    textStyle,
    title='',
    onPress=()=>{},
    loading = false,
    hasShadow = false,
}) => {

    const shadowStyle ={
        shadowColor: theme.colors.dark,
        shadowOffset: {width:0,height:10},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation:4,
    }

    if(loading){
        return(
            <View style={[styles.button, buttonStyle,{backgroundColor:'white'}]}>
                <Loading/>
            </View>
        )
    }
  return (
    <Pressable onPress={onPress} style={[styles.button, buttonStyle, hasShadow && shadowStyle,{backgroundColor:theme.colors.primary}]}>
      <Text style={[styles.text, textStyle,{color:theme.colors.gray}]}>{title}</Text>
    </Pressable>
  )
}

export default Button;

const styles = StyleSheet.create({
    button:{
        backgroundColor: 'transparent',
        height: hp(6.6),
        justifyContent:'center',
        alignItems:'center',
        borderCurve:'continuous',
        borderRadius: theme.radius.xl
    },
    text:{
        fontSize: hp(2.5),
        color:theme.colors.primary,
        fontWeight: theme.fonts.bold
    }

})