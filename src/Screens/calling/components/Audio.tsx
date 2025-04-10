import React, { useEffect, useState } from 'react';
import { OTSession, OTPublisher, OTSubscriber, OTPublisherProperties } from 'opentok-react-native';
import { View } from 'react-native';
import Config from 'react-native-config';
import { useSelector } from 'react-redux';
import { StoreType } from '../../../types';
import { stopSound } from '../../../utils/callKitCustom';

// eslint-disable-next-line
const Audio = (props:any) =>{
  const callState = useSelector((state: StoreType) => state?.VoipReducer?.call_state || {});
  const callData = useSelector((state: StoreType) => state?.VoipReducer?.call_data || {});



  const [publisherProperties,setPublisherProperties] = useState<OTPublisherProperties>({
    publishAudio: false,
    publishVideo: false,
  });

  const sessionEventHandlers = {
    // eslint-disable-next-line
    streamCreated: (event:any) => console.log('streamCreated', event),
    // eslint-disable-next-line
    streamDestroyed: (event:any) => console.log('session disconnected',event),
    // eslint-disable-next-line
    error: (error:any) => console.log('session error:', error),
    // eslint-disable-next-line
    otrnError: (error:any) => console.log('Session otrnError error:', error),
    sessionDisconnected: () => console.log('Session Disconnected'),
  };

  const publisherEventHandlers = {
    // eslint-disable-next-line
    streamCreated: (event:any) => {console.log('Publisher stream created!', event)},
    // eslint-disable-next-line
    streamDestroyed: (event:any) => console.log('Publisher stream destroyed!', event),
  };

  const subscriberEventHandlers = {
    connected:()=> callState.state!=='active'?props?.answerCall?.():null,
    disconnected:()=>props?.endCall?.(),
  }
  
  useEffect(()=>{
    if(callState.state==='active'){
      const data = { ...publisherProperties };
      data.publishAudio = true;
      setPublisherProperties({...data});
    } 
  },[callState.state]);

  useEffect(()=>{

    if(callState.state != 'outgoing'){
      stopSound()
    }
   },[callState.state])



    return (
      <View>
        <OTSession
          // @ts-expect-error - add explanation here, e.g., "Expected type error due to XYZ reason"
         apiKey={Config.TOKBOX_KEY} sessionId={callData?.session} token={callData?.token} eventHandlers={sessionEventHandlers}>
            <OTPublisher style={{ width: 0, height: 0 }}  properties={publisherProperties} eventHandlers={publisherEventHandlers} />
            <OTSubscriber style={{ width: 0, height: 0 }} eventHandlers={subscriberEventHandlers}/>
        </OTSession>
      </View>
    );
  
}
export default Audio;