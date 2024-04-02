import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';


const VideoCallPatient = () => {
  // const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  let localVideoRef = useRef();
  let remoteVideoRef = useRef();
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [remoteID, setRemoteId] = useState(location.state.callee);
  const [localID, setLocalId] = useState(location.state.caller);
  let peerConnection = useRef();
  // let socket;


  useEffect(() => {

    let conn = new WebSocket("ws://18ed-103-156-19-229.ngrok-free.app/socket");
    console.log(conn);


    var configuration = {
      iceServers: [{
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ]
      }]
    };
    var peerConnection = new RTCPeerConnection(configuration);

    

    conn.onopen = async (event) => {
      await peerConnection.setLocalDescription(await peerConnection.createOffer());
      conn.send(JSON.stringify({ description: peerConnection.localDescription }));
      
    }


    peerConnection.onicecandidate = (event) => {
      const candidate = event.candidate;
      conn.send(JSON.stringify({ candidate }));
    }


    conn.onmessage = async (event) => {
      console.log(event.data);
      const data = JSON.parse(event.data);
      console.log("data: ", data);
      if (data.description) {
        await peerConnection.setRemoteDescription(data.description);
        if (data.description.type === "offer") {
          await peerConnection.setLocalDescription(await peerConnection.createAnswer());
          conn.send(JSON.stringify({ description: peerConnection.localDescription }));
        }
      }
      else if (data.candidate) {
        console.log(data.candidate);
        await peerConnection.addIceCandidate(data.candidate);
      }
    }

    peerConnection.onnegotiationneeded = async (event) => {

      console.log("negotiation event: ", event);
      await peerConnection.setLocalDescription(await peerConnection.createOffer());
      console.log(peerConnection.localDescription.toJSON());
      conn.send(JSON.stringify({ description: peerConnection.localDescription }));
      
    }


    peerConnection.onicecandidate = (event) => {
      console.log(event);
    }


    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      console.log(stream);
      localVideoRef.current.srcObject = stream;
      for (const track of stream.getTracks()) {
        peerConnection.addTrack(track, stream);
      }
    })


    peerConnection.ontrack = ({ streams }) => {
      console.log("streams: ", streams);
      remoteVideoRef.current.srcObject = streams[0];
    }


  }, [])





  return (
    <div>
      <video ref={localVideoRef} autoPlay muted />
      <video ref={remoteVideoRef} autoPlay />
    </div>
  );
};

export default VideoCallPatient;
