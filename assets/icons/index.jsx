import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Home from './Home'
import { theme } from '../../constants/theme'
import ArrowLeft from './ArrowLeft'
import Mail from './Mail'
import Lock from './Lock'
import User from './User'
import Heart from './Heart'
import Plus from './Plus'
import Logout from './Logout'
import Edit from './Edit'
import Camera from './Camera'
import Call from './Call'
import Location from './Location'
import Image from './Image'
import Video from './Video'
import Delete from './Delete'
import ThreeDotsHorizontal from './ThreeDotsHorizonta'
import Comment from './Comment'
import Share from './Share'
import Send from './Send'

const icons ={
    home: Home,
    arrowleft: ArrowLeft,
    mail:Mail,
    lock: Lock,
    user: User,
    heart: Heart,
    plus: Plus,
    logout:Logout,
    edit:Edit,
    camera:Camera,
    call: Call,
    location:Location,
    image: Image,
    video : Video,
    delete : Delete,
    threeDotsHorizontal : ThreeDotsHorizontal,
    comment: Comment,
    share: Share,
    send: Send,
}

const Icon = ({name, ...props}) => {
    const IconComponent = icons[name];
  return (
    <IconComponent
        height={props.size || 24}
        width={props.size || 24}
        strokeWidth={props.strokeWidth || 1.9}
        color={theme.colors.textLight}
        {...props}
    />
  )
}

export default Icon

