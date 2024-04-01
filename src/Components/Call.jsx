import React, { useEffect } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import { ZIM } from 'zego-zim-web';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// const navigate = useNavigate();


function randomID(len) {
  let result = '';
  if (result) return result;
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function getUrlParams(
  url = window.location.href
) {
  let urlStr = url.split('?')[1];
  return new URLSearchParams(urlStr);
}


export default function Call() {
  
  
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  // const doctorId = location.state.doctorid;
  console.log(location.state);
  const roomID = location.state.roomID;

  // const patientId = user.id;




  // useEffect(() => {
    
  //   axios.post("http://localhost:9191/appointment/makeAppointment",
  //     {
  //       "roomId": roomID,
  //       "doctor": {
  //         "id": doctorId
  //       },
  //       "patient": {
  //         "id": patientId
  //       }
  //     })
  //     .then((res) => {
  //       console.log(res);
  //     })
  //     .catch((res) => {
  //       console.log(res);
  //     })
  // }, [])


  let myMeeting = async (element) => {
    // generate Kit Token
    const appID = 602901630;
    const serverSecret = "184e47eeb3ba9ad8fbbf6a786c4d5456";

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // start the call
    zp.joinRoom({
      container: element,
      // onJoinRoom: 
      sharedLinks: [
        {
          name: 'Personal link',
          url:
            window.location.protocol + '//' +
            window.location.host + window.location.pathname +
            '?roomID=' +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.InvitationTypeVideoCall, // To implement 1-on-1 calls, modify the parameter here to [ZegoUIKitPrebuilt.OneONoneCall].
      },
    });

  };

  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: '100%', height: '100vh' }}
    ></div>
  );
}