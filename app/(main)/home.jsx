import { Alert, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Button from '../../components/Button' 
import { useAuth } from '../../contexts/AuthContexts'
import { supabase } from '../../lib/supabase'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Icon from '../../assets/icons'
import {  useFocusEffect, useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import { FlatList } from 'react-native'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loadingfix'
import {getUserData} from '../../services/userService'

var limit = 0;
const Home = () => {
    const{user,setAuth} = useAuth();
    const router = useRouter();

    const[posts, setPosts] = useState([]);
    const[hasMore , setHasMore] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    //Realtime Update section to be checked 
    const handlePostEvent = async (payload)=>{
      // console.log('payload: ', payload);
      if(payload.eventType == 'INSERT' && payload?.new?.id){
        let newPost = {...payload.new};
        let res = await getUserData(newPost.userId);
        newPost.postLikes = [];
        newPost.comments = [{count: 0}];
        newPost.user = res.success? res.data: {};
        setPosts(prevPosts => [newPost, ...prevPosts]);
      } 
      if(payload.eventType=='DELETE' && payload.old.id){
        setPosts(prevPosts=>{
          let updatedPosts = prevPosts.filter(post=> post.id!=payload.old.id);
          return updatedPosts;
        })
      }
      if(payload.eventType == 'UPDATE' && payload?.new?.id){
          setPosts(prevPosts=>{
            let updatedPosts = prevPosts.map(post=>{
              if(post.id == payload.new.id){
                post.body = payload.new.body;
                post.file = payload.new.file;
              }
              return post;
            });

            return updatedPosts;

          })
      } 
    }

    const handleNewNotification = async(payload)=>{
      console.log('got new notifications: ', payload);
      if(payload.eventType == 'INSERT' && payload.new.id){
        setNotificationCount(prev=> prev+1);
      }
    }
   useFocusEffect(
    useCallback(()=>{
      getPosts()
return () => {
        console.log('This route is now unfocused.');
      };
    },[])
   )


    useEffect(()=>{
    //  getPosts()

      let postChannel, notificationChannel;

      if (Platform.OS === 'android') {
        const backAction = () => {
          // Exit the app when back is pressed on Home
          BackHandler.exitApp();
          return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          backAction
        );

        return () => backHandler.remove();
      }
      
      //console.log('Setting up subscription')

       postChannel= supabase
      .channel('posts')
      .on('postgres_changes',{event: '*', schema:'public', table:'posts'}, handlePostEvent)
      .subscribe()

      //console.log('Post subscription active:', postChannel);


      //getPosts();
       notificationChannel= supabase
      .channel('notifications')
      .on('postgres_changes',{event: 'INSERT', schema:'public', table:'notifications', filter: `receiverId= eq.${user.id}`}, handleNewNotification)
      .subscribe()

    // Subscription for new comments
        // let commentChannel = supabase
        //     .channel('comments')
        //     .on('postgres_changes',{
        //     event: 'INSERT', 
        //     schema: 'public', 
        //     table: 'comments' 
        //   },)
        //.subscribe();

        return()=>{
          supabase.removeChannel(postChannel);
          supabase.removeChannel(notificationChannel);

        }
        
        // return () => {
        //     supabase.removeChannel(postChannel);
        //     supabase.removeChannel(commentChannel);      };
    },[])

    const getPosts = async()=>{
      //call the api here

      if(!hasMore) return null;
      limit= limit+4;

      console.log('fetching posts: ', limit);
      let res = await fetchPosts(limit);
      if(res.success){
        if(posts.length == res.data.length) setHasMore(false);
        setPosts(res.data);
      }
    }


    // console.log('user:' ,user);

    // const onLogout = async()=>{
    //     //setAuth(null);
    //     const {error} = await supabase.auth.signOut();
    //     if(error){
    //         Alert.alert('Sign out',"Error signing out!")
    //     }
    // }
  return (
    <ScreenWrapper bg='white'>
      <View style={styles.container}>
        {/*header */}
        <View style={styles.header}>
          <Text style={styles.title}>Echo</Text>
          <View style={styles.icons}>
            <Pressable onPress={()=> {
                setNotificationCount(0)
                router.push('notifications')
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {
                notificationCount >0 &&(
                  <View style={styles.pill}>
                    <Text style = {styles.pillText}>{notificationCount}</Text>
                  </View>
                )
              }
            </Pressable>
            <Pressable onPress={()=> router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={()=> router.push('profile')}>
              <Avatar
                  uri={user?.image}
                  size={hp(4.3)}
                  rounded={theme.radius.sm}
                  style={{borderWidth:2}}
                />
            </Pressable>
          </View>
        </View>
        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({item})=><PostCard
            item={item}
            currentUser={user}
            router= {router}
            />
          }

          onEndReached={()=>{
            getPosts();
            console.log('got to the end');
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={hasMore?(
            <View style={{marginVertical: posts.length==0? 250: 30}}>
              <Loading/>
            </View>
          ):(
          <View style={{marginVertical:30}}>
            <Text style={styles.noPosts}>Get a life!</Text>
          </View>
          )}
        />


      </View>
      {/* <Button title="logout" onPress={onLogout}/> */}
    </ScreenWrapper>
  )
}

export default Home;

const styles = StyleSheet.create({
  container:{
    flex: 1,
    // paddingHorizontal: wp(4)
    },
    header: {
      flexDirection:'row',
      alignItems:'center',
      justifyContent: 'space-between',
      marginBottom:10 ,
      marginHorizontal:wp(4)
    },

    title: {
      color: theme.colors.text,
      fontSize: hp(3.2),
      fontWeight: theme.fonts.bold
    },

  avatarImage:{
    height :hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve:'continuous',
    borderColor: theme.colors.darkLight,
    borderWidth: 3
  },
  icons: {
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    gap:18
  },
  listStyle:{
    paddingTop:20,
    paddingHorizontal:wp(4)
  },
  noPosts:{
    fontSize:hp(2),
    textAlign:'center',
    color: theme.colors.text
  },
  pill:{
    position:'absolute',
    right:-10,
    top:-4,
    height: hp(2.2),
    width:hp(2.2),
    justifyContent: 'center',
    alignItems:'center',
    borderRadius:20,
    backgroundColor: theme.colors.roseLight
  },
  pillText:{
    color:'white',
    fontSize: hp(1.2),
    fontWeight:theme.fonts.bold
  }
})
